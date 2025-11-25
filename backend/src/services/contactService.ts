import mongoose from 'mongoose';
import { Contact } from '../models/Contact.js';
import { Transaction } from '../models/Transaction.js';
import type {
    IContact,
    IContactProfile,
    ICreateContactRequest,
    IUpdateContactRequest,
    IOperationRequest
} from '../types/types.js';
import { TransactionType } from '../types/types.js';

// Servicio para gestionar operaciones relacionadas con contactos y sus transacciones
export class ContactService {

    // Crea un nuevo contacto normalizando email y nombre
    async createContact(data: ICreateContactRequest): Promise<IContact> {
        const normalizedEmail = data.email.trim().toLowerCase();
        const normalizedName = data.name.trim();

        if (!normalizedEmail || !normalizedName) {
            throw new Error('Email y nombre son obligatorios');
        }

        const contact = new Contact({
            email: normalizedEmail,
            name: normalizedName,
            balance: 0
        });

        await contact.save();
        return contact.toObject() as unknown as IContact;
    }

    // Obtiene todos los contactos ordenados por fecha de creación descendente
    async getAllContacts(): Promise<IContact[]> {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        return contacts.map(c => c.toObject() as unknown as IContact);
    }

    // Obtiene un contacto específico por su ID
    async getContactById(id: string): Promise<IContact | null> {
        const contact = await Contact.findById(id);
        return contact ? (contact.toObject() as unknown as IContact) : null;
    }

    // Actualiza únicamente el nombre de un contacto
    async updateContactName(id: string, data: IUpdateContactRequest): Promise<IContact | null> {
        const contact = await Contact.findByIdAndUpdate(
            id,
            { name: data.name },
            { new: true, runValidators: true }
        );

        return contact ? (contact.toObject() as unknown as IContact) : null;
    }

    // Agrega una operación financiera (crédito o débito) a un contacto usando transacciones atómicas si están disponibles
    async addOperation(contactId: string, operation: IOperationRequest): Promise<IContact> {
        try {
            return await this.addOperationWithTransaction(contactId, operation);
        } catch (error: any) {
            if (error.message?.includes('replica set') || error.message?.includes('mongos')) {
                return await this.addOperationWithoutTransaction(contactId, operation);
            }
            throw error;
        }
    }

    // Agrega operación usando transacciones atómicas de MongoDB (requiere replica set)
    private async addOperationWithTransaction(contactId: string, operation: IOperationRequest): Promise<IContact> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const contact = await Contact.findById(contactId).session(session);
            if (!contact) {
                await session.abortTransaction();
                await session.endSession();
                throw new Error('Contacto no encontrado');
            }

            const balanceChange = operation.type === TransactionType.CREDIT
                ? operation.amount
                : -operation.amount;

            const existingTransactions = await Transaction.find({ contactId: contactId }).session(session);
            const currentCalculatedBalance = existingTransactions.reduce((sum, tx) => {
                const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount));
                return sum + amount;
            }, 0);

            if (Math.abs(contact.balance - currentCalculatedBalance) >= 0.01) {
                contact.balance = currentCalculatedBalance;
                await contact.save({ session });
            }

            const newCalculatedBalance = currentCalculatedBalance + balanceChange;

            const transaction = new Transaction({
                contactId: contactId,
                amount: balanceChange,
                type: operation.type
            });
            await transaction.save({ session });

            contact.balance = newCalculatedBalance;
            await contact.save({ session });

            await session.commitTransaction();
            await session.endSession();

            const updatedContact = await Contact.findById(contactId);
            return updatedContact ? (updatedContact.toObject() as unknown as IContact) : contact.toObject() as unknown as IContact;
        } catch (error: any) {
            await session.abortTransaction();
            await session.endSession();
            throw error;
        }
    }

    // Agrega operación sin transacciones de MongoDB (fallback para MongoDB standalone)
    private async addOperationWithoutTransaction(contactId: string, operation: IOperationRequest): Promise<IContact> {
        const contact = await Contact.findById(contactId);
        if (!contact) {
            throw new Error('Contacto no encontrado');
        }

        const balanceChange = operation.type === TransactionType.CREDIT
            ? operation.amount
            : -operation.amount;

        const existingTransactions = await Transaction.find({ contactId: contactId });
        const currentCalculatedBalance = existingTransactions.reduce((sum, tx) => {
            const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount));
            return sum + amount;
        }, 0);

        if (Math.abs(contact.balance - currentCalculatedBalance) >= 0.01) {
            contact.balance = currentCalculatedBalance;
            await contact.save();
        }

        const newCalculatedBalance = currentCalculatedBalance + balanceChange;

        const transaction = new Transaction({
            contactId: contactId,
            amount: balanceChange,
            type: operation.type
        });
        await transaction.save();

        contact.balance = newCalculatedBalance;
        await contact.save();

        const allTransactions = await Transaction.find({ contactId: contactId });
        const finalCalculatedBalance = allTransactions.reduce((sum, tx) => {
            const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount));
            return sum + amount;
        }, 0);

        const balanceDiff = Math.abs(contact.balance - finalCalculatedBalance);
        if (balanceDiff >= 0.01) {
            contact.balance = finalCalculatedBalance;
            await contact.save();
        }

        const updatedContact = await Contact.findById(contactId);
        return updatedContact ? (updatedContact.toObject() as unknown as IContact) : contact.toObject() as unknown as IContact;
    }

    // Obtiene el perfil completo de un contacto con todas sus transacciones ordenadas por fecha descendente
    async getContactProfile(id: string): Promise<IContactProfile | null> {
        const contact = await Contact.findById(id);
        if (!contact) {
            return null;
        }

        const operations = await Transaction.find({ contactId: id })
            .sort({ createdAt: -1 });

        const calculatedBalance = operations.reduce((sum, tx) => sum + tx.amount, 0);

        if (Math.abs(contact.balance - calculatedBalance) >= 0.01) {
            contact.balance = calculatedBalance;
            await contact.save();
        }

        const contactObj = contact.toObject() as unknown as IContact;
        
        return {
            contact: contactObj,
            operations: operations.map(op => op.toObject() as any)
        };
    }

    // Valida que el balance almacenado coincida con la suma de todas las transacciones
    async validateBalance(contactId: string): Promise<{ 
        valid: boolean; 
        storedBalance: number; 
        calculatedBalance: number; 
        difference: number;
        transactionCount: number;
    }> {
        const contact = await Contact.findById(contactId);
        if (!contact) {
            throw new Error('Contacto no encontrado');
        }

        const transactions = await Transaction.find({ contactId });
        const calculatedBalance = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const difference = Math.abs(contact.balance - calculatedBalance);
        const isValid = difference < 0.01;

        return {
            valid: isValid,
            storedBalance: contact.balance,
            calculatedBalance: calculatedBalance,
            difference: difference,
            transactionCount: transactions.length
        };
    }
}
