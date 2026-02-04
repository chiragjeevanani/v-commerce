import apiClient from "../lib/axios";

// Remove local instance creation and interceptor setup
// const API_URL = 'http://localhost:3000/api/v1';
// const apiClient = axios.create...

export const api = {
  // Products (using existing CJ endpoints via our backend)
  getProducts: async (params) => {
    const response = await apiClient.get('/cj/list-products-v2', { params });
    const data = response.data.data;
    const productList = data.content?.[0]?.productList || data.list || [];
    return productList.map(product => ({
      id: product.id || product.pid,
      name: product.nameEn || product.productNameEn,
      image: product.bigImage || product.productImage,
      category: product.categoryName || product.oneCategoryName || 'General',
      price: (parseFloat(product.sellPrice) * 1.3).toFixed(2), // 30% margin
      pid: product.id || product.pid
    }));
  },

  getProductById: async (pid) => {
    const response = await apiClient.get('/cj/product-details', { params: { pid } });
    const product = response.data.data;
    if (!product) return null;

    return {
      id: product.pid,
      name: product.productNameEn,
      description: product.description,
      price: (parseFloat(product.sellPrice) * 1.3).toFixed(2),
      images: product.productImage || [product.productImage], // assuming it might be an array or string
      category: product.categoryName,
      pid: product.pid
    };
  },

  getCategories: async () => {
    const response = await apiClient.get('/cj/get-categories');
    return response.data.data || [];
  },

  // Real Orders
  getOrders: async () => {
    const response = await apiClient.get('/orders/my-orders');
    return response.data.data.map(order => ({ ...order, id: order._id }));
  },

  getOrderById: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    const data = response.data.data;
    return { ...data, id: data._id };
  },

  trackOrder: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    const data = response.data.data;
    return { ...data, id: data._id };
  },

  placeOrder: async (orderData) => {
    const response = await apiClient.post('/orders/place', orderData);
    return response.data;
  },

  estimateShipping: async (data) => {
    const response = await apiClient.post('/cj/estimate-shipping', data);
    return response.data;
  }
};
