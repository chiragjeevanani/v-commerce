import { products, categories, userOrders } from "./mockData";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  getProducts: async () => {
    await delay(500); // Simulate network latency
    return products;
  },
  getProductById: async (id) => {
    await delay(300);
    return products.find((p) => p.id === Number(id));
  },
  getCategories: async () => {
    await delay(300);
    return categories;
  },
  getOrders: async () => {
    await delay(400);
    return userOrders;
  },
  getOrderById: async (orderId) => {
    await delay(400);
    return userOrders.find(o => o.id === orderId);
  },
  trackOrder: async (orderId) => {
    await delay(600);
    const existingOrder = userOrders.find(o => o.id === orderId);
    if (existingOrder) return existingOrder;

    // Smart Mocking: Generate a realistic order if ID starts with ORD-
    if (orderId.startsWith("ORD-")) {
      return {
        id: orderId,
        date: new Date().toISOString(),
        status: "confirmed",
        total: 154.98,
        paymentMethod: "Credit Card",
        shippingAddress: "456 Mock Street, Tech City, TC 10101",
        estimatedDelivery: "In 2-3 days",
        items: [
          { productId: 1, name: "Wireless Noise Cancelling Headphones", quantity: 1, price: 249.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
        ],
        timeline: [
          { status: "placed", label: "Order Placed", date: "Just now", completed: true },
          { status: "confirmed", label: "Confirmed", date: "Processing", completed: true },
          { status: "shipped", label: "Shipped", date: null, completed: false },
          { status: "out_for_delivery", label: "Out for Delivery", date: null, completed: false },
          { status: "delivered", label: "Delivered", date: null, completed: false }
        ]
      };
    }
    return null;
  },
  placeOrder: async (orderData) => {
    await delay(1000);
    return {
      success: true,
      orderId: `ORD-${Math.floor(Math.random() * 100000)}`,
      orderData: {
        ...orderData,
        date: new Date().toISOString(),
      }
    };
  }
};
