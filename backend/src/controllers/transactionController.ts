import type { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService.js';

const transactionService = new TransactionService();

// Controlador para manejar las peticiones HTTP relacionadas con la exportación de transacciones
export class TransactionController {

    // GET /api/transactions/export - Exporta transacciones a formato CSV
    async exportTransactions(req: Request, res: Response): Promise<void> {
        try {
            const { contactId, startDate, noStartLimit, endDate, untilNow } = req.query;

            const query = {
                ...(contactId && { contactId: String(contactId) }),
                ...(startDate && { startDate: String(startDate) }),
                noStartLimit: noStartLimit === 'true',
                ...(endDate && { endDate: String(endDate) }),
                untilNow: untilNow === 'true'
            };

            const { csv, filename } = await transactionService.exportTransactionsCSV(query);

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csv);
        } catch (error: any) {
            res.status(500).json({ error: 'Error al exportar transacciones', details: error.message });
        }
    }
}
