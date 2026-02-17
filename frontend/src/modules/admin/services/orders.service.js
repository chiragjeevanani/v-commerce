import apiClient from "@/lib/axios";
import axios from "axios";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mocking the Axios instance for consistency
const adminApi = axios.create({
    baseURL: "/api/admin",
});

// Using local API URL for orders
// const API_URL = 'http://localhost:3000/api/v1/orders';
// const apiClient = axios.create...

export const ordersService = {
    getAllOrders: async ({ pageNum = 1, pageSize = 20 } = {}) => {
        try {
            const response = await apiClient.get('/orders/admin/all', {
                params: { pageNum, pageSize }
            });
            const result = response.data;

            if (result.success) {
                // Return data directly as the backend now formats it correctly
                return result.data;
            }
            throw new Error(result.message || "Failed to fetch orders");
        } catch (error) {
            console.error("Fetch Orders Error:", error);
            throw error;
        }
    },

    getOrdersByCustomerId: async (userId) => {
        try {
            const response = await apiClient.get(`/orders/admin/user/${userId}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || "Failed to fetch customer orders");
        } catch (error) {
            console.error("Fetch Customer Orders Error:", error);
            throw error;
        }
    },

    getOrderById: async (id) => {
        try {
            const response = await apiClient.get(`/orders/admin/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || "Failed to fetch order details");
        } catch (error) {
            console.error("Fetch Order Detail Error:", error);
            throw error;
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            console.log("Calling API to update order status:", { orderId, status });
            const response = await apiClient.put(`/orders/admin/${orderId}/status`, { status });
            console.log("API Response:", response.data);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || "Failed to update order status");
        } catch (error) {
            console.error("Update Order Status Error:", error);
            console.error("Error Response:", error.response?.data);
            console.error("Error Status:", error.response?.status);
            // Re-throw with more details
            const errorMessage = error.response?.data?.message || error.message || "Failed to update order status";
            const enhancedError = new Error(errorMessage);
            enhancedError.response = error.response;
            throw enhancedError;
        }
    },

    getRecentOrders: async () => {
        try {
            const response = await apiClient.get('/orders/admin/recent');
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || "Failed to fetch recent orders");
        } catch (error) {
            console.error("Fetch Recent Orders Error:", error);
            throw error;
        }
    },

    syncWithSupplier: async (id) => {
        // Placeholder
        return { success: true };
    },
};
