import axios from "axios";
import { products } from "../../../services/mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const productsService = {
    getSupplierProducts: async () => {
        await delay(700);
        // Simulating read-only view from supplier
        return products.map(product => ({
            ...product,
            supplierPrice: (product.price * 0.7).toFixed(2), // Mock supplier price
            margin: 30, // Default 30% margin
        }));
    },

    updateProductMargin: async (id, margin) => {
        await delay(500);
        console.log(`Product ${id} margin updated to ${margin}%`);
        return { success: true, id, margin };
    },

    toggleProductVisibility: async (id, visible) => {
        await delay(500);
        console.log(`Product ${id} visibility set to ${visible}`);
        return { success: true, id, visible };
    }
};
