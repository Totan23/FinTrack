import { Contact } from '../models/Contact.js';
import { Operation } from '../models/Operation.js';
import mongoose from 'mongoose';
/**
 * Crear un nuevo contacto
 */
export const createContact = async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            res.status(400).json({ error: 'Email y nombre son requeridos' });
            return;
        }
        // El balance siempre inicia en 0
        const contact = new Contact({
            email: email.trim().toLowerCase(),
            name: name.trim(),
            balance: 0,
        });
        await contact.save();
        res.status(201).json(contact);
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ error: 'El email ya está registrado' });
            return;
        }
        res.status(500).json({ error: 'Error al crear contacto', details: error.message });
    }
};
/**
 * Listar todos los contactos
 */
export const listContacts = async (_req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al listar contactos', details: error.message });
    }
};
/**
 * Obtener un contacto por ID con sus operaciones (opcional, paginadas)
 */
export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const { includeOperations, page = '1', limit = '10' } = req.query;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'ID de contacto inválido' });
            return;
        }
        const contact = await Contact.findById(id);
        if (!contact) {
            res.status(404).json({ error: 'Contacto no encontrado' });
            return;
        }
        const response = { contact };
        // Si se solicitan operaciones, incluirlas paginadas
        if (includeOperations === 'true') {
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const skip = (pageNum - 1) * limitNum;
            const operations = await Operation.find({ contactId: new mongoose.Types.ObjectId(id) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum);
            const totalOperations = await Operation.countDocuments({ contactId: new mongoose.Types.ObjectId(id) });
            response.operations = operations;
            response.pagination = {
                page: pageNum,
                limit: limitNum,
                total: totalOperations,
                totalPages: Math.ceil(totalOperations / limitNum),
            };
        }
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener contacto', details: error.message });
    }
};
/**
 * Actualizar solo el nombre de un contacto
 */
export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'ID de contacto inválido' });
            return;
        }
        if (!name || name.trim().length === 0) {
            res.status(400).json({ error: 'El nombre es requerido' });
            return;
        }
        const contact = await Contact.findByIdAndUpdate(id, { name: name.trim() }, { new: true, runValidators: true });
        if (!contact) {
            res.status(404).json({ error: 'Contacto no encontrado' });
            return;
        }
        res.json(contact);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar contacto', details: error.message });
    }
};
//# sourceMappingURL=contactsController.js.map