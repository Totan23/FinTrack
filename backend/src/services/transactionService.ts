import { Transaction } from '../models/Transaction.js';
import { Contact } from '../models/Contact.js';
import type { IExportQuery } from '../types/types.js';

// Servicio para gestionar la exportación de transacciones a CSV
export class TransactionService {

    // Exporta transacciones a formato CSV con filtros opcionales de fecha y contacto
    async exportTransactionsCSV(query: IExportQuery): Promise<{ csv: string; filename: string }> {
        const dateFilter: any = {};

        if (!query.noStartLimit && query.startDate) {
            dateFilter.$gte = new Date(query.startDate);
        }

        if (query.untilNow) {
            dateFilter.$lte = new Date();
        } else if (query.endDate) {
            const endDate = new Date(query.endDate);
            endDate.setHours(23, 59, 59, 999);
            dateFilter.$lte = endDate;
        }

        const filter: any = {};
        if (query.contactId) {
            filter.contactId = query.contactId;
        }
        if (Object.keys(dateFilter).length > 0) {
            filter.createdAt = dateFilter;
        }

        const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

        let contactName: string | null = null;
        if (query.contactId) {
            const contact = await Contact.findById(query.contactId);
            contactName = contact ? contact.name : null;
        }

        const csvHeader = 'ID,Contact ID,Contact Name,Amount,Type,Date,Description\n';
        const csvRows = await Promise.all(
            transactions.map(async (tx) => {
                const contact = await Contact.findById(tx.contactId);
                const txContactName = contact ? contact.name : 'Unknown';
                const date = tx.createdAt ? tx.createdAt.toISOString() : '';
                const description = (tx as any).description || '';

                const escapeCSV = (value: any): string => {
                    if (value === null || value === undefined) return '';
                    const str = String(value);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                return `${escapeCSV(tx._id)},${escapeCSV(tx.contactId)},${escapeCSV(txContactName)},${escapeCSV(tx.amount)},${escapeCSV(tx.type)},${escapeCSV(date)},${escapeCSV(description)}`;
            })
        );

        const csv = csvHeader + csvRows.join('\n');
        const filename = this.generateFilename(query, contactName);

        return { csv, filename };
    }

    // Genera el nombre del archivo CSV basado en el contacto
    private generateFilename(query: IExportQuery, contactName: string | null = null): string {
        const sanitizeName = (name: string): string => {
            return name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .trim()
                .split(/\s+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .filter(word => word.length > 0)
                .join('');
        };

        let filename = '';
        
        if (query.contactId && contactName) {
            const cleanName = sanitizeName(contactName);
            filename = `${cleanName}TransactionsHistory.csv`;
        } else if (query.contactId) {
            filename = `ContactTransactionsHistory.csv`;
        } else {
            filename = 'AllTransactionsHistory.csv';
        }

        return filename;
    }

    // Obtiene todas las transacciones de un contacto específico
    async getTransactionsByContact(contactId: string): Promise<any[]> {
        const transactions = await Transaction.find({ contactId }).sort({ createdAt: -1 });
        return transactions.map(tx => tx.toObject());
    }
}
