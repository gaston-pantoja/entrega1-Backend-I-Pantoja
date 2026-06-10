import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();

const cartManager = new CartManager('../data/carts.json');


router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({ status: "success", data: newCart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});


router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);
        if (!cart) return res.status(404).json({ status: "error", message: "Cart not found" });
        res.json({ status: "success", data: cart.products });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});


router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
        if (!updatedCart) return res.status(404).json({ status: "error", message: "Cart not found" });
        res.json({ status: "success", data: updatedCart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;