import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/addresses';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const addressService = {
    getAddresses: async () => {
        try {
            const response = await api.get('/');
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch addresses");
        }
    },

    addAddress: async (addressData) => {
        try {
            const response = await api.post('/add', addressData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to add address");
        }
    },

    updateAddress: async (addressId, addressData) => {
        try {
            const response = await api.put(`/${addressId}`, addressData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to update address");
        }
    },

    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/${addressId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to delete address");
        }
    },

    setDefaultAddress: async (addressId) => {
        try {
            const response = await api.put(`/set-default/${addressId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to set default address");
        }
    }
};
