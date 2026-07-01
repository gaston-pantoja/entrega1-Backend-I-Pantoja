import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class ProductManager {
    
    constructor(customPath = null) {
        this.path = customPath || path.resolve(__dirname, '../../data/products.json');
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

    async getProducts() {
        return await this.#readFile();
    }

    async getProductById(id) {
        const products = await this.#readFile();
        return products.find(p => p.id === id) || null;
    }

    async addProduct(productData) {
        const products = await this.#readFile();
        
        const newProduct = {
            id: crypto.randomUUID(), 
            ...productData,
            status: productData.status ?? true,
            thumbnails: productData.thumbnails || []
        };

        products.push(newProduct);
        await this.#writeFile(products);
        return newProduct;
    }

    async updateProduct(id, updateData) {
        const products = await this.#readFile();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;

        
        const { id: _, ...safeData } = updateData; 
        products[index] = { ...products[index], ...safeData };
        
        await this.#writeFile(products);
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.#readFile();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return false;

        products.splice(index, 1);
        await this.#writeFile(products);
        return true;
    }
}