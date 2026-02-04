import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';
// const BASE_URL = 'https://v-commerce.onrender.com/api/v1';

const apiClient = axios.create({
    baseURL: BASE_URL,
});

// Interceptor to add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for global error handling (optional, matches zero-breakage rule by doing nothing specific yet)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
