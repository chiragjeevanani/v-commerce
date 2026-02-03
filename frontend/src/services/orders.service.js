import apiClient from '../lib/axios';

export const ordersService = {
    // Get all orders for the current logged-in user
    getMyOrders: async () => {
        try {
            const response = await apiClient.get('/orders/my-orders');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch orders");
        }
    },

    // Get details of a specific order
    getOrderDetails: async (orderId) => {
        try {
            const response = await apiClient.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch order details");
        }
    }
};
