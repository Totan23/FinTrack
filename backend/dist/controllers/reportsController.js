import { Operation } from '../models/Operation.js';
import { Contact } from '../models/Contact.js';
import mongoose from 'mongoose';
/**
 * Exportar operaciones de un contacto a CSV
 */
export const exportContactOperations = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, fromStart, untilNow } = req.query;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'ID de contacto inválido' });
            return;
        }
        const contact = await Contact.findById(id);
        if (!contact) {
            res.status(404).json({ error: 'Contacto no encontrado' });
            return;
        }
        // Construir filtro de fecha
        const dateFilter = { contactId: new mongoose.Types.ObjectId(id) };
        const fromStartStr = Array.isArray(fromStart) ? fromStart[0] : fromStart;
        const untilNowStr = Array.isArray(untilNow) ? untilNow[0] : untilNow;
        const fromStartBool = fromStartStr === 'true' || fromStartStr === '1';
        const untilNowBool = untilNowStr === 'true' || untilNowStr === '1';
        if (!fromStartBool) {
            const startDateStr = Array.isArray(startDate) ? startDate[0] : startDate;
            if (startDateStr && typeof startDateStr === 'string') {
                dateFilter.createdAt = { ...dateFilter.createdAt, $gte: new Date(startDateStr) };
            }
        }
        if (!untilNowBool) {
            const endDateStr = Array.isArray(endDate) ? endDate[0] : endDate;
            if (endDateStr && typeof endDateStr === 'string') {
                const end = new Date(endDateStr);
                end.setHours(23, 59, 59, 999); // Incluir todo el día
                dateFilter.createdAt = { ...dateFilter.createdAt, $lte: end };
            }
        }
        // Obtener operaciones
        const operations = await Operation.find(dateFilter).sort({ createdAt: -1 });
        // Generar CSV
        const csvHeader = 'Fecha,Contacto,Email,Tipo,Monto,Descripción\n';
        const csvRows = operations.map((op) => {
            const date = op.createdAt ? new Date(op.createdAt).toISOString().split('T')[0] : '';
            const type = op.type === 'credit' ? 'Crédito' : 'Débito';
            const amount = op.amount.toFixed(2);
            const description = op.description ? `"${op.description.replace(/"/g, '""')}"` : '';
            return `${date},${contact.name},${contact.email},${type},${amount},${description}`;
        });
        const csv = csvHeader + csvRows.join('\n');
        // Generar nombre de archivo
        const contactName = contact.name.toLowerCase().replace(/\s+/g, '-');
        const startStr = fromStartBool ? 'ALL' : startDate || 'ALL';
        const endStr = untilNowBool ? 'NOW' : endDate || 'NOW';
        const fileName = `transactions-${contactName}-${startStr}_${endStr}.csv`;
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send('\ufeff' + csv); // BOM para Excel
    }
    catch (error) {
        res.status(500).json({ error: 'Error al exportar operaciones', details: error.message });
    }
};
/**
 * Exportar todas las operaciones a CSV
 */
export const exportAllOperations = async (req, res) => {
    try {
        const { startDate, endDate, fromStart, untilNow } = req.query;
        // Construir filtro de fecha
        const dateFilter = {};
        const fromStartStr = Array.isArray(fromStart) ? fromStart[0] : fromStart;
        const untilNowStr = Array.isArray(untilNow) ? untilNow[0] : untilNow;
        const fromStartBool = fromStartStr === 'true' || fromStartStr === '1';
        const untilNowBool = untilNowStr === 'true' || untilNowStr === '1';
        if (!fromStartBool) {
            const startDateStr = Array.isArray(startDate) ? startDate[0] : startDate;
            if (startDateStr && typeof startDateStr === 'string') {
                dateFilter.createdAt = { ...dateFilter.createdAt, $gte: new Date(startDateStr) };
            }
        }
        if (!untilNowBool) {
            const endDateStr = Array.isArray(endDate) ? endDate[0] : endDate;
            if (endDateStr && typeof endDateStr === 'string') {
                const end = new Date(endDateStr);
                end.setHours(23, 59, 59, 999);
                dateFilter.createdAt = { ...dateFilter.createdAt, $lte: end };
            }
        }
        // Obtener operaciones con información del contacto
        const operations = await Operation.find(dateFilter)
            .populate('contactId', 'name email')
            .sort({ createdAt: -1 });
        // Generar CSV
        const csvHeader = 'Fecha,Contacto,Email,Tipo,Monto,Descripción\n';
        const csvRows = operations.map((op) => {
            const date = op.createdAt ? new Date(op.createdAt).toISOString().split('T')[0] : '';
            const contactName = op.contactId?.name || 'N/A';
            const contactEmail = op.contactId?.email || 'N/A';
            const type = op.type === 'credit' ? 'Crédito' : 'Débito';
            const amount = op.amount.toFixed(2);
            const description = op.description ? `"${op.description.replace(/"/g, '""')}"` : '';
            return `${date},${contactName},${contactEmail},${type},${amount},${description}`;
        });
        const csv = csvHeader + csvRows.join('\n');
        // Generar nombre de archivo
        const startStr = fromStartBool ? 'ALL' : startDate || 'ALL';
        const endStr = untilNowBool ? 'NOW' : endDate || 'NOW';
        const fileName = `transactions-all-${startStr}_${endStr}.csv`;
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send('\ufeff' + csv); // BOM para Excel
    }
    catch (error) {
        res.status(500).json({ error: 'Error al exportar operaciones', details: error.message });
    }
};
//# sourceMappingURL=reportsController.js.map