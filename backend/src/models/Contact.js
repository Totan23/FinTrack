import mongoose, { Schema, Document } from 'mongoose';
const contactSchema = new Schema({
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Por favor ingresa un email válido']
    },
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    balance: {
        type: Number,
        default: 0,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});
// Índice para búsquedas rápidas por email
contactSchema.index({ email: 1 });
export const Contact = mongoose.model('Contact', contactSchema);
//# sourceMappingURL=Contact.js.map