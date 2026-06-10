import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();


const productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        res.json({ status: "success", data: limit ? products.slice(0, limit) : products });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        if (!product) return res.status(404).json({ status: "error", message: "Product not found" });
        res.json({ status: "success", data: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;
        // Validación estricta de campos obligatorios
        if (!title || !description || !code || !price || stock === undefined || !category) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json({ status: "success", data: newProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
        if (!updatedProduct) return res.status(404).json({ status: "error", message: "Product not found" });
        res.json({ status: "success", data: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const success = await productManager.deleteProduct(req.params.pid);
        if (!success) return res.status(404).json({ status: "error", message: "Product not found" });
        res.json({ status: "success", message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;