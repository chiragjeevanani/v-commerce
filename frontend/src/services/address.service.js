import apiClient from "../lib/axios";

// const API_URL = 'http://localhost:3000/api/v1/addresses';
// const api = axios.create...

export const addressService = {
    getAddresses: async () => {
        try {
            const response = await apiClient.get('/addresses/');
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch addresses");
        }
    },

    addAddress: async (addressData) => {
        try {
            const response = await apiClient.post('/addresses/add', addressData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to add address");
        }
    },

    updateAddress: async (addressId, addressData) => {
        try {
            const response = await apiClient.put(`/addresses/${addressId}`, addressData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to update address");
        }
    },

    deleteAddress: async (addressId) => {
        try {
            const response = await apiClient.delete(`/addresses/${addressId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to delete address");
        }
    },

    setDefaultAddress: async (addressId) => {
        try {
            const response = await apiClient.put(`/addresses/set-default/${addressId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to set default address");
        }
    }
};
