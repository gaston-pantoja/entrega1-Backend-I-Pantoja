import { Router } from 'express';
import { productModel } from '../dao/models/product.model.js';
import { cartModel } from '../dao/models/cart.model.js';

const router = Router();


router.get('/home', async (req, res) => {
    try {
        const products = await productModel.find().lean();
        res.render('home', { products });
    } catch (error) {
        console.error('[VIEWS ERROR] Error al cargar home:', error);
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


router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 10, sort, query } = req.query;

        let filter = {};
        if (query) {
            if (query.startsWith('status:')) {
                filter.status = query.split(':')[1] === 'true';
            } else {
                filter.category = query;
            }
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true 
        };

        if (sort === 'asc' || sort === 'desc') {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const result = await productModel.paginate(filter, options);

       
        const baseUrl = '/products';
        const queryParams = new URLSearchParams();
        if (limit) queryParams.set('limit', limit);
        if (sort) queryParams.set('sort', sort);
        if (query) queryParams.set('query', query);

        const prevLink = result.hasPrevPage 
            ? `${baseUrl}?page=${result.prevPage}&${queryParams.toString()}` 
            : null;
        const nextLink = result.hasNextPage 
            ? `${baseUrl}?page=${result.nextPage}&${queryParams.toString()}` 
            : null;

        res.render('products', {
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink,
            nextLink
        });
    } catch (error) {
        console.error('[VIEWS ERROR] Error al cargar vista /products:', error);
        res.status(500).send('Error al cargar la vista de productos');
    }
});


router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid).populate('products.product').lean();

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        res.render('cart', { cart });
    } catch (error) {
        console.error('[VIEWS ERROR] Error al cargar vista del carrito:', error);
        res.status(500).send('Error al cargar el carrito');
    }
});

export default router;