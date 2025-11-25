import mongoose, { Document } from 'mongoose';
import type { IContact } from '../types/types.js';
export interface IContactDocument extends Omit<IContact, '_id'>, Document {
}
export declare const Contact: mongoose.Model<IContactDocument, {}, {}, {}, mongoose.Document<unknown, {}, IContactDocument, {}, {}> & IContactDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Contact.d.ts.map