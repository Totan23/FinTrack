import type { IExportQuery } from '../types/types.js';
export declare class TransactionService {
    exportTransactionsCSV(query: IExportQuery): Promise<{
        csv: string;
        filename: string;
    }>;
    private generateFilename;
    getTransactionsByContact(contactId: string): Promise<any[]>;
}
//# sourceMappingURL=transactionService.d.ts.map