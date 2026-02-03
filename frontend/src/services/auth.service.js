import apiClient from '../lib/axios';

// API URL is now handled by baseUrl in lib/axios.js + relative paths
// const API_URL = 'http://localhost:3000/api/v1/auth';
// const api = axios.create...

export const authService = {
    login: async (email, password) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
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
            const response = await apiClient.post('/auth/login', { email, password });
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
            const response = await apiClient.post('/auth/register', userData);
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

            const response = await apiClient.post('/auth/verify', { email, otp });
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
            const response = await apiClient.post('/auth/resend-otp', { email });
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
            const response = await apiClient.get('/auth/all-users');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch users");
        }
    },

    toggleUserStatus: async (userId) => {
        try {
            const response = await apiClient.put(`/auth/toggle-status/${userId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to toggle user status");
        }
    },

    getUserById: async (userId) => {
        try {
            const response = await apiClient.get(`/auth/userProfile/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Get User Error:", error);
            throw new Error(error.response?.data?.message || "Failed to fetch user details");
        }
    },

    updateProfile: async (userData) => {
        try {
            const response = await apiClient.put('/auth/update-profile', userData);
            // Update local storage user if successful
            if (response.data.success) {
                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                const updatedUser = { ...currentUser, ...response.data.data };
                localStorage.setItem("user", JSON.stringify(updatedUser));

                if (response.data.token) {
                    localStorage.setItem("auth_token", response.data.token);
                }
            }
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to update profile");
        }
    },

    changePassword: async (passwordData) => {
        try {
            const response = await apiClient.post('/auth/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to change password");
        }
    },

    uploadAvatar: async (file) => {
        try {
            const formData = new FormData();
            formData.append("image", file); // 'image' matches Multer config

            const response = await apiClient.post('/upload/admin/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                // Update local storage user avatar
                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                currentUser.avatar = response.data.data.avatar;
                localStorage.setItem("user", JSON.stringify(currentUser));
            }

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to upload avatar");
        }
    },

    forgotPassword: async (email) => {
        // Implement forgot password if backend supports it
        console.log(`Reset link request for ${email}`);
        return { success: true };
    }
};

