import { ContactService } from '../services/contactService.js';
const contactService = new ContactService();
export class ContactController {
    // POST /api/contacts - Crear contacto
    async createContact(req, res) {
        try {
            const { email, name } = req.body;
            if (!email || !name) {
                res.status(400).json({ error: 'Email y nombre son obligatorios' });
                return;
            }
            // Validar que email y name sean strings
            if (typeof email !== 'string' || typeof name !== 'string') {
                res.status(400).json({ error: 'Email y nombre deben ser cadenas de texto' });
                return;
            }
            const contact = await contactService.createContact({ email, name });
            res.status(201).json(contact);
        }
        catch (error) {
            // Error de duplicado (email único)
            if (error.code === 11000) {
                res.status(409).json({ error: 'El email ya está registrado' });
                return;
            }
            // Errores de validación de Mongoose
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors || {}).map((err) => err.message);
                res.status(400).json({
                    error: 'Error de validación',
                    details: validationErrors.length > 0 ? validationErrors : error.message
                });
                return;
            }
            // Otros errores
            console.error('Error al crear contacto:', error);
            res.status(500).json({
                error: 'Error al crear contacto',
                details: error.message || 'Error desconocido'
            });
        }
    }
    // GET /api/contacts - Listar todos los contactos
    async getAllContacts(req, res) {
        try {
            const contacts = await contactService.getAllContacts();
            res.json(contacts);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener contactos', details: error.message });
        }
    }
    // GET /api/contacts/:id - Obtener un contacto
    async getContactById(req, res) {
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
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener contacto', details: error.message });
        }
    }
    // PATCH /api/contacts/:id - Actualizar nombre del contacto
    async updateContactName(req, res) {
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
        }
        catch (error) {
            res.status(500).json({ error: 'Error al actualizar contacto', details: error.message });
        }
    }
    // POST /api/contacts/:id/operations - Agregar operación (sumar/restar balance)
    async addOperation(req, res) {
        try {
            const { id } = req.params;
            const { amount, type } = req.body;
            console.log('📝 Creando operación:', { id, amount, type });
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
            // Validar monto máximo (10 millones)
            const MAX_AMOUNT = 10000000;
            if (amount > MAX_AMOUNT) {
                res.status(400).json({
                    error: `El monto máximo permitido por transacción es $${MAX_AMOUNT.toLocaleString('es-ES')}`,
                    details: `El monto ingresado ($${amount.toLocaleString('es-ES')}) excede el límite permitido.`
                });
                return;
            }
            // Validar que el tipo sea válido
            if (type !== 'CREDIT' && type !== 'DEBIT') {
                res.status(400).json({ error: 'El tipo debe ser CREDIT o DEBIT' });
                return;
            }
            const contact = await contactService.addOperation(id, { amount, type });
            console.log('✅ Operación creada exitosamente');
            res.json(contact);
        }
        catch (error) {
            console.error('❌ Error al agregar operación:', error);
            console.error('   Stack:', error.stack);
            if (error.message === 'Contacto no encontrado') {
                res.status(404).json({ error: error.message });
            }
            else if (error.message?.includes('replica set') || error.message?.includes('mongos')) {
                // Error de transacciones - pero ya se maneja con fallback, esto no debería ocurrir
                res.status(500).json({
                    error: 'Error al procesar la operación',
                    details: 'Hubo un problema al guardar la transacción. Por favor, intenta nuevamente.'
                });
            }
            else {
                // Retornar mensaje de error claro para el usuario
                const errorMessage = error.message || 'Error desconocido';
                res.status(500).json({
                    error: 'Error al agregar operación',
                    details: errorMessage
                });
            }
        }
    }
    // GET /api/contacts/:id/profile - Obtener perfil con operaciones
    async getContactProfile(req, res) {
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
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
        }
    }
    // GET /api/contacts/:id/validate-balance - Validar consistencia del balance
    async validateBalance(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ error: 'ID es obligatorio' });
                return;
            }
            const validation = await contactService.validateBalance(id);
            res.json(validation);
        }
        catch (error) {
            if (error.message === 'Contacto no encontrado') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Error al validar balance', details: error.message });
            }
        }
    }
}
//# sourceMappingURL=contactController.js.map