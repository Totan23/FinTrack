import mongoose from 'mongoose';
/**
 * Conecta a MongoDB Atlas usando la URI del entorno
 */
export const connectDB = async () => {
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (!MONGO_URI) {
        throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB Atlas');
    }
    catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        throw error;
    }
};
//# sourceMappingURL=db.js.map