import { Contact } from '../models/Contact.js';
import { Operation } from '../models/Operation.js';
import mongoose from 'mongoose';
/**
 * Crear una operación (crédito o débito) y actualizar el balance del contacto
 * Usa transacciones MongoDB para garantizar atomicidad
 */
export const createOperation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { amount, type, description } = req.body;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            await session.abortTransaction();
            res.status(400).json({ error: 'ID de contacto inválido' });
            return;
        }
        if (!amount || amount <= 0) {
            await session.abortTransaction();
            res.status(400).json({ error: 'El monto debe ser un número positivo' });
            return;
        }
        if (!type || (type !== 'credit' && type !== 'debit')) {
            await session.abortTransaction();
            res.status(400).json({ error: 'El tipo debe ser "credit" o "debit"' });
            return;
        }
        // Obtener el contacto dentro de la transacción
        const contact = await Contact.findById(id).session(session);
        if (!contact) {
            await session.abortTransaction();
            res.status(404).json({ error: 'Contacto no encontrado' });
            return;
        }
        // Calcular el nuevo balance
        const amountChange = type === 'credit' ? amount : -amount;
        const newBalance = contact.balance + amountChange;
        // Crear la operación
        const operation = new Operation({
            contactId: new mongoose.Types.ObjectId(id),
            amount,
            type,
            description: description?.trim(),
        });
        await operation.save({ session });
        // Actualizar el balance del contacto
        contact.balance = newBalance;
        await contact.save({ session });
        // Validar consistencia: calcular balance desde operaciones
        const allOperations = await Operation.find({ contactId: new mongoose.Types.ObjectId(id) }).session(session);
        const calculatedBalance = allOperations.reduce((sum, op) => {
            return sum + (op.type === 'credit' ? op.amount : -op.amount);
        }, 0);
        if (Math.abs(calculatedBalance - newBalance) > 0.01) {
            // Tolerancia para errores de punto flotante
            await session.abortTransaction();
            res.status(500).json({
                error: 'Inconsistencia detectada en el balance',
                calculatedBalance,
                storedBalance: newBalance,
            });
            return;
        }
        // Confirmar la transacción
        await session.commitTransaction();
        res.status(201).json({
            operation,
            contact: {
                _id: contact._id,
                email: contact.email,
                name: contact.name,
                balance: contact.balance,
            },
        });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: 'Error al crear operación', details: error.message });
    }
    finally {
        session.endSession();
    }
};
/**
 * Listar operaciones de un contacto, ordenadas por fecha DESC
 */
export const listOperations = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = '1', limit = '10' } = req.query;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'ID de contacto inválido' });
            return;
        }
        // Verificar que el contacto existe
        const contact = await Contact.findById(id);
        if (!contact) {
            res.status(404).json({ error: 'Contacto no encontrado' });
            return;
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const operations = await Operation.find({ contactId: new mongoose.Types.ObjectId(id) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Operation.countDocuments({ contactId: new mongoose.Types.ObjectId(id) });
        res.json({
            operations,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al listar operaciones', details: error.message });
    }
};
//# sourceMappingURL=operationsController.js.map