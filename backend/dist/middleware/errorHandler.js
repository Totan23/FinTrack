/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};
//# sourceMappingURL=errorHandler.js.map