const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USER = {
    id: "user-123",
    name: "Test User",
    email: "test@vcommerce.com",
    phone: "9876543210",
    avatar: "https://github.com/shadcn.png"
};

export const authService = {
    login: async (email, password) => {
        await delay(1000);
        if (email === "test@vcommerce.com" && password === "password123") {
            const token = "mock-jwt-token-123";
            localStorage.setItem("auth_token", token);
            localStorage.setItem("user", JSON.stringify(MOCK_USER));
            return { success: true, user: MOCK_USER, token };
        }
        throw new Error("Invalid email or password");
    },

    signup: async (userData) => {
        await delay(1200);
        // Simulating signup - in reality, would save to DB
        const token = "mock-jwt-token-new";
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify({ ...MOCK_USER, ...userData }));
        return { success: true, user: { ...MOCK_USER, ...userData }, token };
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

    forgotPassword: async (email) => {
        await delay(800);
        console.log(`Reset link sent to ${email}`);
        return { success: true };
    },

    verifyOTP: async (otp) => {
        await delay(1000);
        if (otp === "123456") {
            return { success: true };
        }
        throw new Error("Invalid OTP code");
    }
};
