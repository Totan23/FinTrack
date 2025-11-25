import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController.js';
const router = Router();
const transactionController = new TransactionController();
// Ruta de exportación CSV
router.get('/export', (req, res) => transactionController.exportTransactions(req, res));
export default router;
//# sourceMappingURL=transactionRoutes.js.map