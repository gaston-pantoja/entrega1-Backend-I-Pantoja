import { Schema, model } from 'mongoose';

const cartCollection = 'carts';

const cartSchema = new Schema({
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'products', // Referencia al modelo de productos
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            _id: false // Evita generar un _id interno innecesario para cada ítem del array
        }
    ]
});

export const cartModel = model(cartCollection, cartSchema);