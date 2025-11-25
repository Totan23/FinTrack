import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
    });
};

mongoose.connection.on('disconnected', () => {
    console.error('MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
    console.error('Error en la conexión de MongoDB:', err);
});
