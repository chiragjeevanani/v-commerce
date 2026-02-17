import apiClient from "@/lib/axios";

export const settingsService = {
    getStoreSettings: async () => {
        try {
            const response = await apiClient.get('/content/get-content', {
                params: { contentType: 'store_settings' }
            });
            // Content API returns the object directly or wrapper? 
            // ContentCtrl: res.status(200).json(contentData);
            // contentData structure: { _id, contentType, content: "..." or {...}, createdAt, ... }
            return response.data ? response.data.content : null;
        } catch (error) {
            console.error("Fetch Store Settings Error:", error);
            // Return null or default if not found (404 likely)
            return null;
        }
    },

    updateStoreSettings: async (settings) => {
        try {
            const response = await apiClient.put('/content/update-content', {
                contentType: 'store_settings',
                content: settings
            });
            return response.data;
        } catch (error) {
            console.error("Update Store Settings Error:", error);
            throw error;
        }
    },

    uploadStoreLogo: async (file) => {
        try {
            const formData = new FormData();
            formData.append("image", file); // 'image' matches Multer config

            const response = await apiClient.post('/upload/settings/store/logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Upload Store Logo Error:", error);
            throw error;
        }
    },

    // Razorpay Settings
    getRazorpaySettings: async () => {
        try {
            const response = await apiClient.get('/razorpay/settings');
            return response.data?.data || null;
        } catch (error) {
            console.error("Fetch Razorpay Settings Error:", error);
            return null;
        }
    },

    updateRazorpaySettings: async (settings) => {
        try {
            const response = await apiClient.put('/razorpay/settings', settings);
            return response.data;
        } catch (error) {
            console.error("Update Razorpay Settings Error:", error);
            throw error;
        }
    },

    testRazorpayConnection: async () => {
        try {
            const response = await apiClient.post('/razorpay/test-connection');
            return response.data;
        } catch (error) {
            console.error("Test Razorpay Connection Error:", error);
            throw error;
        }
    }
};
