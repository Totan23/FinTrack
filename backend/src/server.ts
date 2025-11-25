import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import contactRoutes from './routes/contactRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
    res.json({ message: 'FinTrack API' });
});

app.use('/api/contacts', contactRoutes);
app.use('/api/transactions', transactionRoutes);

app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    connectDB().catch((error) => {
        console.error('Error conectando a MongoDB:', error);
    });
});