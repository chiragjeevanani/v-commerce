import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/cart';

// Create axios instance with auth interceptor
const cartApi = axios.create({
    baseURL: API_URL,
});

cartApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Deduplicate concurrent getCart calls
let activeCartRequest = null;

export const cartService = {
    getCart: async () => {
        if (activeCartRequest) return activeCartRequest;

        activeCartRequest = (async () => {
            try {
                const response = await cartApi.get('/');
                return response.data.data;
            } catch (error) {
                console.error("Fetch Cart Error:", error);
                throw error;
            } finally {
                activeCartRequest = null;
            }
        })();

        return activeCartRequest;
    },

    addToCart: async (productData) => {
        try {
            const response = await cartApi.post('/add', productData);
            return response.data.data;
        } catch (error) {
            console.error("Add to Cart Error:", error);
            throw error;
        }
    },

    updateQuantity: async (pid, quantity) => {
        try {
            const response = await cartApi.put('/update', { pid, quantity });
            return response.data.data;
        } catch (error) {
            console.error("Update Cart Error:", error);
            throw error;
        }
    },

    removeFromCart: async (pid) => {
        try {
            const response = await cartApi.delete(`/remove/${pid}`);
            return response.data.data;
        } catch (error) {
            console.error("Remove from Cart Error:", error);
            throw error;
        }
    },

    clearCart: async () => {
        try {
            const response = await cartApi.delete('/clear');
            return response.data;
        } catch (error) {
            console.error("Clear Cart Error:", error);
            throw error;
        }
    },

    syncCart: async (items) => {
        try {
            const response = await cartApi.post('/sync', { items });
            return response.data.data;
        } catch (error) {
            console.error("Sync Cart Error:", error);
            throw error;
        }
    }
};
