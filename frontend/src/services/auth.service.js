import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/auth';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor to add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { data, token } = response.data;

            localStorage.setItem("auth_token", token);
            localStorage.setItem("user", JSON.stringify(data));

            return { success: true, user: data, token };
        } catch (error) {
            throw new Error(error.response?.data?.message || "Invalid email or password");
        }
    },

    adminLogin: async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { data, token } = response.data;

            if (data.role !== "admin") {
                throw new Error("Unauthorized: Only admins can login here.");
            }

            localStorage.setItem("auth_token", token);
            localStorage.setItem("user", JSON.stringify(data));

            return { success: true, user: data, token };
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || "Admin login failed");
        }
    },

    signup: async (userData) => {
        try {
            const response = await api.post('/register', userData);
            // Store email temporarily for verification
            localStorage.setItem("pending_email", userData.email);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Signup failed");
        }
    },

    verifyOTP: async (otp) => {
        try {
            const email = localStorage.getItem("pending_email");
            if (!email) throw new Error("No pending verification found. Please signup again.");

            const response = await api.post('/verify', { email, otp });
            const { data, token } = response.data;

            localStorage.setItem("auth_token", token);
            localStorage.setItem("user", JSON.stringify(data));
            localStorage.removeItem("pending_email");

            return { success: true, user: data, token };
        } catch (error) {
            throw new Error(error.response?.data?.message || "Invalid OTP code");
        }
    },

    resendOTP: async (email) => {
        try {
            const response = await api.post('/resend-otp', { email });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to resend OTP");
        }
    },

    logout: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
    },

    getCurrentUser: () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem("auth_token");
    },

    getUsers: async () => {
        try {
            const response = await api.get('/all-users');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch users");
        }
    },

    toggleUserStatus: async (userId) => {
        try {
            const response = await api.put(`/toggle-status/${userId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to toggle user status");
        }
    },

    forgotPassword: async (email) => {
        // Implement forgot password if backend supports it
        console.log(`Reset link request for ${email}`);
        return { success: true };
    }
};

