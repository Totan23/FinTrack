import mongoose, { Schema, Model } from 'mongoose';
const operationSchema = new Schema({
    contactId: {
        type: Schema.Types.ObjectId,
        ref: 'Contact',
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
// Índice compuesto para búsquedas eficientes
operationSchema.index({ contactId: 1, createdAt: -1 });
export const Operation = mongoose.model('Operation', operationSchema);
//# sourceMappingURL=Operation.js.map