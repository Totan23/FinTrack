import { Transaction } from '../models/Transaction.js';
import { Contact } from '../models/Contact.js';
export class TransactionService {
    // Exportar transacciones a CSV con filtros de fecha
    async exportTransactionsCSV(query) {
        // Construir filtro de fecha
        const dateFilter = {};
        // Fecha de inicio
        if (!query.noStartLimit && query.startDate) {
            dateFilter.$gte = new Date(query.startDate);
        }
        // Fecha de fin
        if (query.untilNow) {
            dateFilter.$lte = new Date();
        }
        else if (query.endDate) {
            // Incluir todo el día de fin
            const endDate = new Date(query.endDate);
            endDate.setHours(23, 59, 59, 999);
            dateFilter.$lte = endDate;
        }
        // Construir query completo
        const filter = {};
        if (query.contactId) {
            filter.contactId = query.contactId;
        }
        if (Object.keys(dateFilter).length > 0) {
            filter.createdAt = dateFilter;
        }
        // Obtener transacciones
        const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
        // Obtener información del contacto si es exportación de un contacto específico
        let contactName = null;
        if (query.contactId) {
            const contact = await Contact.findById(query.contactId);
            contactName = contact ? contact.name : null;
        }
        // Generar CSV
        const csvHeader = 'ID,Contact ID,Contact Name,Amount,Type,Date,Description\n';
        const csvRows = await Promise.all(transactions.map(async (tx) => {
            const contact = await Contact.findById(tx.contactId);
            const txContactName = contact ? contact.name : 'Unknown';
            const date = tx.createdAt ? tx.createdAt.toISOString() : '';
            const description = tx.description || '';
            // Escapar comas y comillas en los valores
            const escapeCSV = (value) => {
                if (value === null || value === undefined)
                    return '';
                const str = String(value);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            return `${escapeCSV(tx._id)},${escapeCSV(tx.contactId)},${escapeCSV(txContactName)},${escapeCSV(tx.amount)},${escapeCSV(tx.type)},${escapeCSV(date)},${escapeCSV(description)}`;
        }));
        const csv = csvHeader + csvRows.join('\n');
        // Generar nombre de archivo
        const filename = this.generateFilename(query, contactName);
        return { csv, filename };
    }
    generateFilename(query, contactName = null) {
        // Sanitizar nombre: remover caracteres especiales, normalizar acentos, capitalizar
        const sanitizeName = (name) => {
            return name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remover acentos
                .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiales
                .trim()
                .split(/\s+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .filter(word => word.length > 0)
                .join('');
        };
        let filename = '';
        if (query.contactId && contactName) {
            // Formato: "NombreContactoTransactionsHistory.csv"
            const cleanName = sanitizeName(contactName);
            filename = `${cleanName}TransactionsHistory.csv`;
        }
        else if (query.contactId) {
            filename = `ContactTransactionsHistory.csv`;
        }
        else {
            filename = 'AllTransactionsHistory.csv';
        }
        return filename;
    }
    // Obtener transacciones por contacto
    async getTransactionsByContact(contactId) {
        const transactions = await Transaction.find({ contactId }).sort({ createdAt: -1 });
        return transactions.map(tx => tx.toObject());
    }
}
//# sourceMappingURL=transactionService.js.map