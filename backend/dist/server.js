import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import contactsRoutes from './routes/contactsRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
// Health check
app.get('/', (_req, res) => {
    res.json({ message: 'API FinTrack funcionando 🚀', version: '1.0.0' });
});
// Rutas API
app.use('/api/contacts', contactsRoutes);
app.use('/api/reports', reportsRoutes);
// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);
// Iniciar servidor
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map