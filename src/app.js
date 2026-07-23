import express from 'express';
import { createServer } from 'http'; 
import { Server } from 'socket.io';   
import { engine } from 'express-handlebars'; 
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose'; 
import dns from 'dns';

// Solución al error ECONNREFUSED en resoluciones SRV de Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js'; 
import { productModel } from './dao/models/product.model.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

const MONGO_URI = 'mongodb+srv://gastonpantoja875_db_user:BjfVKxN89yqNls9J@cluster0.8qdrw0l.mongodb.net/coderhouse?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('[DATABASE] Conexión exitosa a MongoDB'))
    .catch(error => console.error('[DATABASE ERROR] Error al conectar a MongoDB:', error));

const httpServer = createServer(app);
const io = new Server(httpServer);

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: "error", message: "Internal server error" });
});

io.on('connection', async (socket) => {
    console.log(`[SOCKET] Cliente conectado con ID: ${socket.id}`);
    
    try {
        const products = await productModel.find().lean();
        socket.emit('updateProducts', products);
    } catch (error) {
        console.error('[SOCKET ERROR] Error al obtener productos:', error);
    }
});

httpServer.listen(PORT, () => {
    console.log(`[SYSTEM] High-performance real-time server operating on port ${PORT}`);
});