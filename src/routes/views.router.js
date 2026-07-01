import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ProductManager from '../managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));


router.get('/home', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        
        res.render('home', { products });
    } catch (error) {
        res.status(500).send("Error interno al cargar la vista home");
    }
});


router.get('/realtimeproducts', (req, res) => {
    try {
        res.render('realTimeProducts');
    } catch (error) {
        res.status(500).send("Error interno al cargar la vista en tiempo real");
    }
});

export default router;