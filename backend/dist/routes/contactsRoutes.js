import { Router } from 'express';
import * as contactsController from '../controllers/contactsController.js';
import * as operationsController from '../controllers/operationsController.js';
const router = Router();
// Rutas de contactos
router.post('/', contactsController.createContact);
router.get('/', contactsController.listContacts);
router.get('/:id', contactsController.getContactById);
router.patch('/:id', contactsController.updateContact);
// Rutas de operaciones anidadas bajo contactos
router.post('/:id/operations', operationsController.createOperation);
router.get('/:id/operations', operationsController.listOperations);
export default router;
//# sourceMappingURL=contactsRoutes.js.map