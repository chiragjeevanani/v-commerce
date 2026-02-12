import apiClient from "@/lib/axios";

export const storeProductService = {
    getActiveProducts: async (params = {}) => {
        try {
            const response = await apiClient.get('/store-products', { params });
            return response.data;
        } catch (error) {
            console.error("Fetch Active Products Error:", error);
            throw error;
        }
    },

    getAllProducts: async (params = {}) => {
        try {
            const response = await apiClient.get('/store-products/admin/all', { params });
            return response.data;
        } catch (error) {
            console.error("Fetch All Products Error:", error);
            throw error;
        }
    },

    getProductById: async (id) => {
        try {
            const response = await apiClient.get(`/store-products/${id}`);
            return response.data;
        } catch (error) {
            console.error("Fetch Product Error:", error);
            throw error;
        }
    },

    createProduct: async (formData) => {
        try {
            const response = await apiClient.post('/store-products/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Create Product Error:", error);
            throw error;
        }
    },

    updateProduct: async (id, formData) => {
        try {
            const response = await apiClient.put(`/store-products/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Update Product Error:", error);
            throw error;
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await apiClient.delete(`/store-products/${id}`);
            return response.data;
        } catch (error) {
            console.error("Delete Product Error:", error);
            throw error;
        }
    },
};
