import apiClient from "@/lib/axios";

// const API_URL = 'http://localhost:3000/api/v1/hero-banners';
// const apiClient = axios.create...

export const heroBannerService = {
    getHeroBanners: async () => {
        try {
            const response = await apiClient.get('/hero-banners');
            return response.data;
        } catch (error) {
            console.error("Fetch Hero Banners Error:", error);
            throw error;
        }
    },

    createHeroBanner: async (data) => {
        try {
            const response = await apiClient.post('/hero-banners/', data);
            return response.data;
        } catch (error) {
            console.error("Create Hero Banner Error:", error);
            throw error;
        }
    },

    updateHeroBanner: async (id, data) => {
        try {
            const response = await apiClient.put(`/hero-banners/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Update Hero Banner Error:", error);
            throw error;
        }
    },

    deleteBanner: async (id) => {
        try {
            const response = await apiClient.delete(`/hero-banners/${id}`);
            return response.data;
        } catch (error) {
            console.error("Delete Hero Banner Error:", error);
            throw error;
        }
    }
};
