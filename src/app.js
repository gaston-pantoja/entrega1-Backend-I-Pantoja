import express from 'express';
import { createServer } from 'http'; 
import { Server } from 'socket.io';   
import { engine } from 'express-handlebars'; 
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js'; 
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;


const httpServer = createServer(app);
const io = new Server(httpServer);

const productManager = new ProductManager(path.join(__dirname, './data/products.json'));


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
    
 
    const products = await productManager.getProducts();
    socket.emit('updateProducts', products);
});


httpServer.listen(PORT, () => {
    console.log(`[SYSTEM] High-performance real-time server operating on port ${PORT}`);
});