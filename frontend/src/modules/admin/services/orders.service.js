import axios from "axios";
import { userOrders } from "../../../services/mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mocking the Axios instance for consistency
const adminApi = axios.create({
    baseURL: "/api/admin",
});

export const ordersService = {
    getAllOrders: async () => {
        await delay(600);
        // In a real app, this would be adminApi.get('/orders')
        return userOrders;
    },

    getOrderById: async (id) => {
        await delay(400);
        return userOrders.find((order) => order.id === id);
    },

    updateOrderStatus: async (id, status) => {
        await delay(800);
        console.log(`Order ${id} status updated to ${status}`);
        return { success: true, id, status };
    },

    syncWithSupplier: async (id) => {
        await delay(1500);
        console.log(`Order ${id} synced with supplier API`);
        return { success: true, trackingNumber: `TRK-${Math.floor(Math.random() * 1000000)}` };
    },
};
