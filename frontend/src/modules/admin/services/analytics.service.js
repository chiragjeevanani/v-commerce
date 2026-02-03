import apiClient from "@/lib/axios";

export const analyticsService = {
    getKPIData: async () => {
        try {
            const response = await apiClient.get('/admin/analytics/kpis');
            return response.data.data;
        } catch (error) {
            console.error("Fetch KPI Error:", error);
            throw error;
        }
    },

    getSalesChartData: async (period = "month") => {
        try {
            const response = await apiClient.get('/admin/analytics/sales', {
                params: { range: period }
            });
            return response.data.data;
        } catch (error) {
            console.error("Fetch Sales Chart Error:", error);
            throw error;
        }
    },

    getOrderStatusDistribution: async () => {
        try {
            const response = await apiClient.get('/admin/analytics/order-status');
            return response.data.data;
        } catch (error) {
            console.error("Fetch Status Distribution Error:", error);
            throw error;
        }
    }
};
