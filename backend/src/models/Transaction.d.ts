import mongoose, { Document } from 'mongoose';
import type { ITransaction } from '../types/types.js';
export interface ITransactionDocument extends Omit<ITransaction, '_id'>, Document {
}
export declare const Transaction: mongoose.Model<ITransactionDocument, {}, {}, {}, mongoose.Document<unknown, {}, ITransactionDocument, {}, {}> & ITransactionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Transaction.d.ts.map