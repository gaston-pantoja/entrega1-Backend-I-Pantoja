import { Router } from 'express';
import { cartModel } from '../dao/models/cart.model.js';
import { productModel } from '../dao/models/product.model.js';

const router = Router();


router.post('/', async (req, res) => {
    try {
        const newCart = await cartModel.create({ products: [] });
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        console.error('[CARTS ERROR] Error al crear carrito:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid).populate('products.product').lean();

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        res.json({ status: 'success', payload: cart });
    } catch (error) {
        console.error('[CARTS ERROR] Error al obtener carrito:', error);
        res.status(500).json({ status: 'error', message: 'ID de carrito inválido o error de servidor' });
    }
});


router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        
        const productExists = await productModel.findById(pid);
        if (!productExists) {
            return res.status(404).json({ status: 'error', message: 'El producto no existe' });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        
        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        res.json({ status: 'success', message: 'Producto agregado al carrito', payload: cart });
    } catch (error) {
        console.error('[CARTS ERROR] Error al agregar producto:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== pid);

        await cart.save();
        res.json({ status: 'success', message: 'Producto eliminado del carrito', payload: cart });
    } catch (error) {
        console.error('[CARTS ERROR] Error al eliminar producto:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({ status: 'error', message: 'El body debe contener un arreglo de productos' });
        }

        const cart = await cartModel.findByIdAndUpdate(
            cid,
            { products },
            { new: true }
        ).populate('products.product');

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        res.json({ status: 'success', payload: cart });
    } catch (error) {
        console.error('[CARTS ERROR] Error al actualizar carrito:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({ status: 'error', message: 'Proporcione una cantidad numérica válida mayor a 0' });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        const productInCart = cart.products.find(p => p.product.toString() === pid);
        if (!productInCart) {
            return res.status(404).json({ status: 'error', message: 'El producto no está en el carrito' });
        }

        productInCart.quantity = quantity;
        await cart.save();

        res.json({ status: 'success', message: 'Cantidad actualizada', payload: cart });
    } catch (error) {
        console.error('[CARTS ERROR] Error al actualizar cantidad:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await cartModel.findByIdAndUpdate(
            cid,
            { products: [] },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        res.json({ status: 'success', message: 'Carrito vaciado correctamente', payload: cart });
    } catch (error) {
        console.error('[CARTS ERROR] Error al vaciar carrito:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;