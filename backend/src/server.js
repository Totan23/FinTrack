import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import contactRoutes from './routes/contactRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middlewares
app.use(cors());
app.use(express.json());
// Rutas
app.get('/', (_req, res) => {
    res.json({ message: 'FinTrack API funcionando 🚀' });
});
app.use('/api/contacts', contactRoutes);
app.use('/api/transactions', transactionRoutes);
// Manejo de errores 404
app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});
// Iniciar el servidor primero
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    // Conectar a la base de datos en segundo plano
    connectDB().catch((error) => {
        console.error('❌ Error conectando a MongoDB:', error);
        console.log('⚠️  El servidor está corriendo pero las rutas de BD no funcionarán');
    });
});
//# sourceMappingURL=server.js.map