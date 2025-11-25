import type { Request, Response } from 'express';
import { ContactService } from '../services/contactService.js';

const contactService = new ContactService();

// Controlador para manejar las peticiones HTTP relacionadas con contactos
export class ContactController {

    // POST /api/contacts - Crea un nuevo contacto
    async createContact(req: Request, res: Response): Promise<void> {
        try {
            const { email, name } = req.body;

            if (!email || !name) {
                res.status(400).json({ error: 'Email y nombre son obligatorios' });
                return;
            }

            if (typeof email !== 'string' || typeof name !== 'string') {
                res.status(400).json({ error: 'Email y nombre deben ser cadenas de texto' });
                return;
            }

            const contact = await contactService.createContact({ email, name });
            res.status(201).json(contact);
        } catch (error: any) {
            if (error.code === 11000) {
                res.status(409).json({ error: 'El email ya está registrado' });
                return;
            }
            
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
                res.status(400).json({ 
                    error: 'Error de validación', 
                    details: validationErrors.length > 0 ? validationErrors : error.message 
                });
                return;
            }

            res.status(500).json({ 
                error: 'Error al crear contacto', 
                details: error.message || 'Error desconocido' 
            });
        }
    }

    // GET /api/contacts - Obtiene todos los contactos
    async getAllContacts(req: Request, res: Response): Promise<void> {
        try {
            const contacts = await contactService.getAllContacts();
            res.json(contacts);
        } catch (error: any) {
            res.status(500).json({ error: 'Error al obtener contactos', details: error.message });
        }
    }

    // GET /api/contacts/:id - Obtiene un contacto específico por ID
    async getContactById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ error: 'ID es obligatorio' });
                return;
            }
            const contact = await contactService.getContactById(id);

            if (!contact) {
                res.status(404).json({ error: 'Contacto no encontrado' });
                return;
            }

            res.json(contact);
        } catch (error: any) {
            res.status(500).json({ error: 'Error al obtener contacto', details: error.message });
        }
    }

    // PATCH /api/contacts/:id - Actualiza únicamente el nombre de un contacto
    async updateContactName(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!id) {
                res.status(400).json({ error: 'ID es obligatorio' });
                return;
            }

            if (!name) {
                res.status(400).json({ error: 'El nombre es obligatorio' });
                return;
            }

            const contact = await contactService.updateContactName(id, { name });

            if (!contact) {
                res.status(404).json({ error: 'Contacto no encontrado' });
                return;
            }

            res.json(contact);
        } catch (error: any) {
            res.status(500).json({ error: 'Error al actualizar contacto', details: error.message });
        }
    }

    // POST /api/contacts/:id/operations - Agrega una operación financiera (crédito o débito) a un contacto
    async addOperation(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { amount, type } = req.body;

            if (!id) {
                res.status(400).json({ error: 'ID es obligatorio' });
                return;
            }

            if (!amount || !type) {
                res.status(400).json({ error: 'Amount y type son obligatorios' });
                return;
            }

            if (amount <= 0) {
                res.status(400).json({ error: 'El monto debe ser mayor a 0' });
                return;
            }

            const MAX_AMOUNT = 10000000;
            if (amount > MAX_AMOUNT) {
                res.status(400).json({ 
                    error: `El monto máximo permitido por transacción es $${MAX_AMOUNT.toLocaleString('es-ES')}`,
                    details: `El monto ingresado ($${amount.toLocaleString('es-ES')}) excede el límite permitido.`
                });
                return;
            }

            if (type !== 'CREDIT' && type !== 'DEBIT') {
                res.status(400).json({ error: 'El tipo debe ser CREDIT o DEBIT' });
                return;
            }

            const contact = await contactService.addOperation(id, { amount, type });
            res.json(contact);
        } catch (error: any) {
            if (error.message === 'Contacto no encontrado') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ 
                    error: 'Error al agregar operación', 
                    details: error.message || 'Error desconocido'
                });
            }
        }
    }

    // GET /api/contacts/:id/profile - Obtiene el perfil completo de un contacto con todas sus transacciones
    async getContactProfile(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ error: 'ID es obligatorio' });
                return;
            }
            const profile = await contactService.getContactProfile(id);

            if (!profile) {
                res.status(404).json({ error: 'Contacto no encontrado' });
                return;
            }

            res.json(profile);
        } catch (error: any) {
            res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
        }
    }

    // GET /api/contacts/:id/validate-balance - Valida la consistencia del balance de un contacto
    async validateBalance(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ error: 'ID es obligatorio' });
                return;
            }
            const validation = await contactService.validateBalance(id);
            res.json(validation);
        } catch (error: any) {
            if (error.message === 'Contacto no encontrado') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Error al validar balance', details: error.message });
            }
        }
    }
}
