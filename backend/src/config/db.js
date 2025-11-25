import mongoose from 'mongoose';
export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI no está definida en las variables de entorno');
        }
        console.log('🔄 Intentando conectar a MongoDB...');
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // Timeout de 10 segundos
            socketTimeoutMS: 45000,
            family: 4, // Usar IPv4
        });
        console.log('✅ Conectado a MongoDB Atlas');
    }
    catch (error) {
        console.error('❌ Error conectando a MongoDB:');
        if (error instanceof Error) {
            console.error('   Mensaje:', error.message);
        }
        console.error('   Detalles:', error);
        console.log('\n💡 Posibles soluciones:');
        console.log('   1. Verifica que tu IP esté autorizada en MongoDB Atlas');
        console.log('   2. Verifica las credenciales en el archivo .env');
        console.log('   3. Verifica tu conexión a internet\n');
        console.log('⚠️  El servidor continuará ejecutándose pero las rutas de BD no funcionarán');
        // No hacer process.exit para que el servidor pueda iniciar
        throw error;
    }
};
// Manejo de eventos de conexión
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB desconectado');
});
mongoose.connection.on('error', (err) => {
    console.error('❌ Error en la conexión de MongoDB:', err);
});
//# sourceMappingURL=db.js.map