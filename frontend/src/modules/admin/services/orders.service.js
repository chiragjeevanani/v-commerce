import axios from "axios";
import { userOrders } from "../../../services/mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mocking the Axios instance for consistency
const adminApi = axios.create({
    baseURL: "/api/admin",
});

const API_URL = 'http://localhost:3000/api/v1/cj';

export const ordersService = {
    getAllOrders: async ({ pageNum = 1, pageSize = 20 } = {}) => {
        try {
            const response = await axios.get(`${API_URL}/list-orders`, {
                params: { pageNum, pageSize }
            });
            const result = response.data;

            if (result.success && result.code === 200) {
                // Map CJ order data to our app's format
                return {
                    orders: result.data.list.map(order => ({
                        id: order.orderId,
                        cjOrderId: order.cjOrderId,
                        date: order.createDate,
                        total: parseFloat(order.orderAmount) || 0,
                        status: order.orderStatus, // Map CJ status to our badges if needed
                        paymentMethod: "CJ Wallet", // CJ orders usually use their wallet/integrated pay
                        itemsCount: order.productCount,
                        customer: {
                            name: order.shippingName,
                            country: order.shippingCountry
                        }
                    })),
                    total: result.data.total,
                    totalPages: Math.ceil(result.data.total / pageSize)
                };
            }
            throw new Error(result.message || "Failed to fetch orders");
        } catch (error) {
            console.error("Fetch Orders Error:", error);
            throw error;
        }
    },

    getOrderById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/order-detail`, {
                params: { orderId: id }
            });
            return response.data;
        } catch (error) {
            console.error("Fetch Order Detail Error:", error);
            throw error;
        }
    },

    updateOrderStatus: async (id, status) => {
        // CJ API usually doesn't allow direct status updates via generic endpoint
        // This would likely involve specific actions like confirm-order
        console.log(`Order ${id} status update requested: ${status}`);
        return { success: true };
    },

    syncWithSupplier: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/order-detail`, {
                params: { orderId: id }
            });
            return response.data;
        } catch (error) {
            console.error("Sync Order Error:", error);
            throw error;
        }
    },
};
