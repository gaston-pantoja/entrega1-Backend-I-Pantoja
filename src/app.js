import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const PORT = 8080;

// Middlewares obligatorios para procesar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión modularizada de los enrutadores principales
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Inicialización del servidor en el puerto requerido 8080
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: "error", message: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`[SYSTEM] High-performance server operating on port ${PORT}`);
});