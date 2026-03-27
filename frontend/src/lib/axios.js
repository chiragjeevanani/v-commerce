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
    // If the backend returns 401 (Unauthorized/Session Expired), log the user out
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      
      // Only redirect if we are not already on the login or landing page to avoid loops
      const publicPaths = ["/", "/auth/login", "/auth/signup"];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
