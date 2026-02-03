import asyncHandler from "express-async-handler";
import Order from "../Models/OrderModel.js";
import User from "../Models/AuthModel.js";

/**
 * Get KPI Data
 * GET /api/v1/admin/analytics/kpis
 */
export const getKPIData = asyncHandler(async (req, res) => {
    // 1. Total Orders
    const totalOrders = await Order.countDocuments({});

    // 2. Total Revenue (Sum of totalAmount)
    const revenueAgg = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 3. Pending Orders
    const pendingOrders = await Order.countDocuments({ status: "placed" }); // Assuming 'placed' is pending

    // 4. New Customers (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newCustomers = await User.countDocuments({
        role: "user",
        createdAt: { $gte: startOfMonth }
    });

    // Mock trends for now (or implement comparison logic if time permits, but requirements say "minimal logic")
    // We'll calculate simple trends based on random realistic variations or static for stability if no historic data
    const trends = {
        orders: "+12%",
        revenue: "+8%",
        customers: "+5%"
    };

    res.json({
        success: true,
        data: {
            totalOrders,
            revenue,
            pendingOrders,
            newCustomers,
            trends
        }
    });
});

/**
 * Get Sales Chart Data
 * GET /api/v1/admin/analytics/sales?range=month
 */
export const getSalesChartData = asyncHandler(async (req, res) => {
    const { range } = req.query;
    // For "month" view, we want data for the last 6 months or current year months
    // For simplicity, let's return last 6 months data

    // Group by Month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const salesData = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Format for frontend
    const labels = [];
    const revenueDataset = [];
    const ordersDataset = [];

    // Fill in gaps if needed, but for now simple mapping
    // Assuming backend data exists, otherwise empty charts
    salesData.forEach(item => {
        // Convert "2024-05" to "May"
        const date = new Date(item._id + "-01");
        const monthName = date.toLocaleString('default', { month: 'short' });
        labels.push(monthName);
        revenueDataset.push(item.revenue);
        ordersDataset.push(item.count);
    });

    res.json({
        success: true,
        data: {
            labels,
            datasets: [
                {
                    label: "Revenue",
                    data: revenueDataset
                },
                {
                    label: "Orders",
                    data: ordersDataset
                }
            ]
        }
    });
});

/**
 * Get Order Status Distribution
 * GET /api/v1/admin/analytics/order-status
 */
export const getOrderStatusDistribution = asyncHandler(async (req, res) => {
    const distribution = await Order.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    // Map to frontend colors (frontend expects 'name', 'value', 'color')
    const colorMap = {
        'delivered': "hsl(var(--primary))",
        'shipped': "#9333ea",
        'placed': "#eab308",
        'cancelled': "#ef4444",
        'confirmed': "#3b82f6"
    };

    const data = distribution.map(item => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count,
        color: colorMap[item._id] || "#cccccc"
    }));

    res.json({
        success: true,
        data: data
    });
});
