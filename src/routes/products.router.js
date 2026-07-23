import { Router } from 'express';
import { productModel } from '../dao/models/product.model.js';

const router = Router();


router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        
        const options = {
            limit: parseInt(limit, 10),
            page: parseInt(page, 10),
            lean: true
        };

        
        if (sort === 'asc') {
            options.sort = { price: 1 };
        } else if (sort === 'desc') {
            options.sort = { price: -1 };
        }

        
        const filter = {};
        if (query) {
            if (query.startsWith('category:')) {
                filter.category = query.split(':')[1];
            } else if (query.startsWith('status:')) {
                filter.status = query.split(':')[1] === 'true';
            } else {
                filter.category = query;
            }
        }

       
        const result = await productModel.paginate(filter, options);

       
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        
        const buildLink = (targetPage) => {
            if (!targetPage) return null;
            let link = `${baseUrl}?page=${targetPage}&limit=${options.limit}`;
            if (sort) link += `&sort=${sort}`;
            if (query) link += `&query=${encodeURIComponent(query)}`;
            return link;
        };

        
        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
            nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
        });

    } catch (error) {
        console.error('[PRODUCTS ERROR] Error al obtener productos:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.get('/:pid', async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).lean();
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }
        res.json({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'ID de producto inválido o error de servidor' });
    }
});


router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;
        
        if (!title || !description || !code || !price || stock === undefined || !category) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }
        
        const newProduct = await productModel.create(req.body);
        
        
        if (req.io) {
            const updatedProducts = await productModel.find().lean();
            req.io.emit('updateProducts', updatedProducts);
        }

        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(
            req.params.pid, 
            req.body, 
            { new: true }
        ).lean();

        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }
        
        if (req.io) {
            const updatedProducts = await productModel.find().lean();
            req.io.emit('updateProducts', updatedProducts);
        }

        res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.delete('/:pid', async (req, res) => {
    try {
        const deletedProduct = await productModel.findByIdAndDelete(req.params.pid);
        if (!deletedProduct) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }
        
        if (req.io) {
            const remainingProducts = await productModel.find().lean();
            req.io.emit('updateProducts', remainingProducts);
        }

        res.json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;