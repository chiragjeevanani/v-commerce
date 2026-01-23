const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
    getKPIData: async () => {
        await delay(600);
        return {
            totalOrders: 1248,
            revenue: 45280.50,
            pendingOrders: 14,
            newCustomers: 85,
            trends: {
                orders: "+12%",
                revenue: "+8.5%",
                customers: "+5.2%"
            }
        };
    },

    getSalesChartData: async (period = "month") => {
        await delay(800);
        // Mock chart data
        const labels = period === "month"
            ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        return {
            labels,
            datasets: [
                {
                    label: "Revenue",
                    data: labels.map(() => Math.floor(Math.random() * 5000) + 1000),
                },
                {
                    label: "Orders",
                    data: labels.map(() => Math.floor(Math.random() * 100) + 20),
                }
            ]
        };
    },

    getOrderStatusDistribution: async () => {
        await delay(400);
        return [
            { name: "Delivered", value: 65, color: "hsl(var(--primary))" },
            { name: "Shipped", value: 20, color: "#9333ea" },
            { name: "Pending", value: 10, color: "#eab308" },
            { name: "Cancelled", value: 5, color: "#ef4444" },
        ];
    }
};
