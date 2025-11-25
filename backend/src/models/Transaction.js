import mongoose, { Schema, Document } from 'mongoose';
import { TransactionType } from '../types/types.js';
const transactionSchema = new Schema({
    contactId: {
        type: String,
        required: [true, 'El ID del contacto es obligatorio'],
        ref: 'Contact'
    },
    amount: {
        type: Number,
        required: [true, 'El monto es obligatorio']
    },
    type: {
        type: String,
        enum: Object.values(TransactionType),
        required: [true, 'El tipo de transacción es obligatorio']
    },
    description: {
        type: String,
        required: false
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
});
// Índices para búsquedas eficientes
transactionSchema.index({ contactId: 1, createdAt: -1 });
transactionSchema.index({ createdAt: -1 });
export const Transaction = mongoose.model('Transaction', transactionSchema);
//# sourceMappingURL=Transaction.js.map