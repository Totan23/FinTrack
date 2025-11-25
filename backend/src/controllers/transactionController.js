import { TransactionService } from '../services/transactionService.js';
const transactionService = new TransactionService();
export class TransactionController {
    // GET /api/transactions/export - Exportar transacciones a CSV
    async exportTransactions(req, res) {
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
            // Configurar headers para descarga de archivo
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csv);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al exportar transacciones', details: error.message });
        }
    }
}
//# sourceMappingURL=transactionController.js.map