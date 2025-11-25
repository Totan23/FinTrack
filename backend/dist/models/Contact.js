import mongoose, { Schema, Model } from 'mongoose';
const contactSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    balance: {
        type: Number,
        default: 0,
        required: true,
    },
}, {
    timestamps: true,
});
export const Contact = mongoose.model('Contact', contactSchema);
//# sourceMappingURL=Contact.js.map