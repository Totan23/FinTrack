import { Router } from 'express';
import * as reportsController from '../controllers/reportsController.js';
const router = Router();
// Exportar operaciones de un contacto específico
router.get('/contacts/:id/operations/export', reportsController.exportContactOperations);
// Exportar todas las operaciones
router.get('/operations/export', reportsController.exportAllOperations);
export default router;
//# sourceMappingURL=reportsRoutes.js.map