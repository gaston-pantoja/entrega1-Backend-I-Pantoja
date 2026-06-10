import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class CartManager {
    constructor() {
       
        this.path = path.resolve(__dirname, '../../data/carts.json');
    }

    async #readFile() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
           
            if (!data || !data.trim()) return [];
            return JSON.parse(data);
        } catch (error) {
            
            return [];
        }
    }

    async #writeFile(data) {
        await fs.writeFile(this.path, JSON.stringify(data, null, 2), 'utf-8');
    }

    async createCart() {
        const carts = await this.#readFile();
        const newCart = {
            id: crypto.randomUUID(), 
            products: []
        };
        carts.push(newCart);
        await this.#writeFile(carts);
        return newCart;
    }

    async getCartById(id) {
        const carts = await this.#readFile();
        return carts.find(c => c.id === id) || null;
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.#readFile();
        const cartIndex = carts.findIndex(c => c.id === cartId);
        if (cartIndex === -1) return null;

        const cart = carts[cartIndex];
        const productIndex = cart.products.findIndex(p => p.product === productId);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        carts[cartIndex] = cart;
        await this.#writeFile(carts);
        return cart;
    }
}