import mongoose from 'mongoose';
import { Contact } from '../models/Contact.js';
import { Transaction } from '../models/Transaction.js';
import { TransactionType } from '../types/types.js';
export class ContactService {
    // Crear un nuevo contacto con balance inicial de 0
    async createContact(data) {
        // Normalizar email y nombre antes de crear
        const normalizedEmail = data.email.trim().toLowerCase();
        const normalizedName = data.name.trim();
        // Validar que el email no esté vacío después de normalizar
        if (!normalizedEmail) {
            throw new Error('El email no puede estar vacío');
        }
        // Validar que el nombre no esté vacío después de normalizar
        if (!normalizedName) {
            throw new Error('El nombre no puede estar vacío');
        }
        const contact = new Contact({
            email: normalizedEmail,
            name: normalizedName,
            balance: 0
        });
        await contact.save();
        return contact.toObject();
    }
    // Obtener todos los contactos
    async getAllContacts() {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        return contacts.map(c => c.toObject());
    }
    // Obtener un contacto por ID
    async getContactById(id) {
        const contact = await Contact.findById(id);
        return contact ? contact.toObject() : null;
    }
    // Actualizar solo el nombre del contacto
    async updateContactName(id, data) {
        const contact = await Contact.findByIdAndUpdate(id, { name: data.name }, { new: true, runValidators: true });
        return contact ? contact.toObject() : null;
    }
    // Agregar o restar balance usando transacciones atómicas de MongoDB (con fallback)
    async addOperation(contactId, operation) {
        // Intentar usar transacciones de MongoDB si están disponibles (replica set)
        // Si no están disponibles, usar implementación sin transacciones
        try {
            return await this.addOperationWithTransaction(contactId, operation);
        }
        catch (error) {
            // Si el error es por transacciones no disponibles, usar fallback
            if (error.message?.includes('replica set') || error.message?.includes('mongos')) {
                console.warn('⚠️  Transacciones de MongoDB no disponibles, usando implementación sin transacciones');
                return await this.addOperationWithoutTransaction(contactId, operation);
            }
            // Si es otro error, relanzarlo
            throw error;
        }
    }
    // Implementación con transacciones de MongoDB (requiere replica set)
    async addOperationWithTransaction(contactId, operation) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Validar que el contacto existe (dentro de la transacción)
            const contact = await Contact.findById(contactId).session(session);
            if (!contact) {
                await session.abortTransaction();
                await session.endSession();
                throw new Error('Contacto no encontrado');
            }
            // Calcular el cambio en el balance
            const balanceChange = operation.type === TransactionType.CREDIT
                ? operation.amount
                : -operation.amount;
            // Obtener el balance actual calculado desde las transacciones existentes
            const existingTransactions = await Transaction.find({ contactId: contactId }).session(session);
            const currentCalculatedBalance = existingTransactions.reduce((sum, tx) => {
                const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount));
                return sum + amount;
            }, 0);
            // Si hay inconsistencia, corregir el balance antes de agregar la nueva operación
            if (Math.abs(contact.balance - currentCalculatedBalance) >= 0.01) {
                console.warn('⚠️  Corrigiendo balance inconsistente antes de agregar operación:', {
                    storedBalance: contact.balance,
                    calculatedBalance: currentCalculatedBalance
                });
                contact.balance = currentCalculatedBalance;
                await contact.save({ session });
            }
            // Calcular el nuevo balance
            const newCalculatedBalance = currentCalculatedBalance + balanceChange;
            // OPERACIONES ATÓMICAS (dentro de la transacción):
            // 1. Crear el registro de transacción
            const transaction = new Transaction({
                contactId: contactId,
                amount: balanceChange,
                type: operation.type
            });
            await transaction.save({ session });
            // 2. Actualizar el balance del contacto
            contact.balance = newCalculatedBalance;
            await contact.save({ session });
            // Confirmar la transacción (commit)
            await session.commitTransaction();
            await session.endSession();
            console.log('✅ Operación atómica completada exitosamente');
            // Recargar el contacto para obtener los datos actualizados
            const updatedContact = await Contact.findById(contactId);
            return updatedContact ? updatedContact.toObject() : contact.toObject();
        }
        catch (error) {
            // Si hay error, revertir la transacción (rollback)
            await session.abortTransaction();
            await session.endSession();
            console.error('❌ Error en addOperationWithTransaction:', error);
            throw error;
        }
    }
    // Implementación sin transacciones (fallback para MongoDB standalone)
    async addOperationWithoutTransaction(contactId, operation) {
        try {
            // Validar que el contacto existe
            const contact = await Contact.findById(contactId);
            if (!contact) {
                throw new Error('Contacto no encontrado');
            }
            // Calcular el cambio en el balance
            const balanceChange = operation.type === TransactionType.CREDIT
                ? operation.amount
                : -operation.amount;
            // Obtener el balance actual calculado desde las transacciones existentes
            const existingTransactions = await Transaction.find({ contactId: contactId });
            const currentCalculatedBalance = existingTransactions.reduce((sum, tx) => {
                const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount));
                return sum + amount;
            }, 0);
            // Si hay inconsistencia, corregir el balance antes de agregar la nueva operación
            if (Math.abs(contact.balance - currentCalculatedBalance) >= 0.01) {
                console.warn('⚠️  Corrigiendo balance inconsistente antes de agregar operación:', {
                    storedBalance: contact.balance,
                    calculatedBalance: currentCalculatedBalance
                });
                contact.balance = currentCalculatedBalance;
                await contact.save();
            }
            // Calcular el nuevo balance
            const newCalculatedBalance = currentCalculatedBalance + balanceChange;
            // Crear el registro de transacción
            const transaction = new Transaction({
                contactId: contactId,
                amount: balanceChange,
                type: operation.type
            });
            await transaction.save();
            // Actualizar el balance del contacto
            contact.balance = newCalculatedBalance;
            await contact.save();
            // Validar que el balance coincida con la suma de todas las transacciones
            const allTransactions = await Transaction.find({ contactId: contactId });
            const finalCalculatedBalance = allTransactions.reduce((sum, tx) => {
                const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount));
                return sum + amount;
            }, 0);
            // Verificar consistencia (tolerancia de 0.01 para errores de punto flotante)
            const balanceDiff = Math.abs(contact.balance - finalCalculatedBalance);
            if (balanceDiff >= 0.01) {
                console.error('⚠️  Inconsistencia de balance detectada después de crear operación:', {
                    storedBalance: contact.balance,
                    calculatedBalance: finalCalculatedBalance,
                    difference: balanceDiff,
                    transactionCount: allTransactions.length
                });
                // Corregir el balance
                contact.balance = finalCalculatedBalance;
                await contact.save();
            }
            console.log('✅ Operación completada exitosamente (sin transacciones)');
            // Recargar el contacto para obtener los datos actualizados
            const updatedContact = await Contact.findById(contactId);
            return updatedContact ? updatedContact.toObject() : contact.toObject();
        }
        catch (error) {
            console.error('❌ Error en addOperationWithoutTransaction:', error);
            throw error;
        }
    }
    // Obtener perfil del contacto con todas sus operaciones
    // Valida que el balance mostrado coincida con la suma de operaciones
    async getContactProfile(id) {
        const contact = await Contact.findById(id);
        if (!contact) {
            return null;
        }
        // Obtener operaciones ordenadas por fecha descendente
        const operations = await Transaction.find({ contactId: id })
            .sort({ createdAt: -1 });
        // Calcular el balance desde las operaciones
        const calculatedBalance = operations.reduce((sum, tx) => sum + tx.amount, 0);
        // Si hay inconsistencia, corregir el balance almacenado
        if (Math.abs(contact.balance - calculatedBalance) >= 0.01) {
            console.warn(`⚠️  Inconsistencia detectada en balance del contacto ${id}. ` +
                `Balance almacenado: ${contact.balance}, ` +
                `Balance calculado: ${calculatedBalance}. ` +
                `Corrigiendo balance...`);
            // Corregir el balance para que coincida con las operaciones
            contact.balance = calculatedBalance;
            await contact.save();
        }
        const contactObj = contact.toObject();
        return {
            contact: contactObj,
            operations: operations.map(op => op.toObject())
        };
    }
    // Validar que el balance coincida con la suma de transacciones
    // Retorna información detallada sobre la validación
    async validateBalance(contactId) {
        const contact = await Contact.findById(contactId);
        if (!contact) {
            throw new Error('Contacto no encontrado');
        }
        const transactions = await Transaction.find({ contactId });
        const calculatedBalance = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const difference = Math.abs(contact.balance - calculatedBalance);
        const isValid = difference < 0.01; // Tolerancia para decimales
        return {
            valid: isValid,
            storedBalance: contact.balance,
            calculatedBalance: calculatedBalance,
            difference: difference,
            transactionCount: transactions.length
        };
    }
}
//# sourceMappingURL=contactService.js.map