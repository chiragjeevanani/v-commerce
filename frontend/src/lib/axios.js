import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.vcommerce.shop/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
