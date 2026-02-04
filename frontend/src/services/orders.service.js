import apiClient from '../lib/axios';

export const ordersService = {
    // Get all orders for the current logged-in user
    getMyOrders: async () => {
        try {
            const response = await apiClient.get('/orders/my-orders');
            const data = response.data;

            // Normalize backend response
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.data)) return data.data;
            if (data && Array.isArray(data.orders)) return data.orders;

            return [];
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch orders");
        }
    },

    // Get details of a specific order
    getOrderDetails: async (orderId) => {
        try {
            const response = await apiClient.get(`/orders/${orderId}`);
            return response.data.data; // BUG FIX 3: Return direct order object
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch order details");
        }
    }
};
