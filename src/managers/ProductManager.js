import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas absolutas dinámicas para el entorno de ejecución
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class ProductManager {
    constructor() {
        // Resuelve de forma exacta la ubicación de products.json sin depender de parámetros externos
        this.path = path.resolve(__dirname, '../../data/products.json');
    }

    async #readFile() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            // Validamos que no esté vacío antes de parsear para evitar crashes de JSON
            if (!data || !data.trim()) return [];
            return JSON.parse(data);
        } catch (error) {
            // Si el archivo no existe (ENOENT), devolvemos el contenedor vacío estándar
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