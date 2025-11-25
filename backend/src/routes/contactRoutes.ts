import { Router } from 'express';
import { ContactController } from '../controllers/contactController.js';

const router = Router();
const contactController = new ContactController();

// Rutas de contactos
router.post('/', (req, res) => contactController.createContact(req, res));
router.get('/', (req, res) => contactController.getAllContacts(req, res));
router.get('/:id', (req, res) => contactController.getContactById(req, res));
router.patch('/:id', (req, res) => contactController.updateContactName(req, res));

// Rutas de operaciones
router.post('/:id/operations', (req, res) => contactController.addOperation(req, res));
router.get('/:id/profile', (req, res) => contactController.getContactProfile(req, res));
router.get('/:id/validate-balance', (req, res) => contactController.validateBalance(req, res));

export default router;
