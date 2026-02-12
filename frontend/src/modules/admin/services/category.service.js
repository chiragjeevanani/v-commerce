import apiClient from "@/lib/axios";

export const categoryService = {
    getActiveCategories: async () => {
        try {
            const response = await apiClient.get('/categories');
            return response.data;
        } catch (error) {
            console.error("Fetch Active Categories Error:", error);
            throw error;
        }
    },

    getAllCategories: async () => {
        try {
            const response = await apiClient.get('/categories/admin/all');
            return response.data;
        } catch (error) {
            console.error("Fetch All Categories Error:", error);
            throw error;
        }
    },

    getCategoryById: async (id) => {
        try {
            const response = await apiClient.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error("Fetch Category Error:", error);
            throw error;
        }
    },

    createCategory: async (formData) => {
        try {
            const response = await apiClient.post('/categories/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Create Category Error:", error);
            throw error;
        }
    },

    updateCategory: async (id, formData) => {
        try {
            const response = await apiClient.put(`/categories/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Update Category Error:", error);
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await apiClient.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error("Delete Category Error:", error);
            throw error;
        }
    },

    createSubcategory: async (data) => {
        try {
            const response = await apiClient.post('/categories/subcategory', data);
            return response.data;
        } catch (error) {
            console.error("Create Subcategory Error:", error);
            throw error;
        }
    },

    updateSubcategory: async (id, data) => {
        try {
            const response = await apiClient.put(`/categories/subcategory/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Update Subcategory Error:", error);
            throw error;
        }
    },

    deleteSubcategory: async (id) => {
        try {
            const response = await apiClient.delete(`/categories/subcategory/${id}`);
            return response.data;
        } catch (error) {
            console.error("Delete Subcategory Error:", error);
            throw error;
        }
    },

    getSubcategoriesByCategory: async (categoryId) => {
        try {
            const response = await apiClient.get(`/categories/${categoryId}/subcategories`);
            return response.data;
        } catch (error) {
            console.error("Fetch Subcategories Error:", error);
            throw error;
        }
    },
};
