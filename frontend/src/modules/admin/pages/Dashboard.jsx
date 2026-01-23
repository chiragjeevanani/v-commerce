import React, { useEffect, useState } from 'react';
import {
    ShoppingBag,
    DollarSign,
    Clock,
    Users,
    ArrowRight,
    MoreVertical,
    ExternalLink
} from 'lucide-react';
import KPICard from '../components/KPICard';
import StatsChart from '../components/StatsChart';
import { analyticsService } from '../services/analytics.service';
import { ordersService } from '../services/orders.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kpis, charts, status, orders] = await Promise.all([
                    analyticsService.getKPIData(),
                    analyticsService.getSalesChartData("month"),
                    analyticsService.getOrderStatusDistribution(),
                    ordersService.getAllOrders()
                ]);

                setStats(kpis);
                // Transform chart data for our custom component
                setSalesData(charts.labels.map((label, i) => ({
                    label,
                    value: charts.datasets[0].data[i] / 100 // simplifying for display
                })));
                setStatusData(status);
                setRecentOrders(orders.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-48 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-card rounded-xl border animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[400px] bg-card rounded-xl border animate-pulse" />
                    <div className="h-[400px] bg-card rounded-xl border animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    index={0}
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    trend="up"
                    trendValue={stats.trends.orders}
                />
                <KPICard
                    index={1}
                    title="Total Revenue"
                    value={`$${stats.revenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="up"
                    trendValue={stats.trends.revenue}
                />
                <KPICard
                    index={2}
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon={Clock}
                    trend="down"
                    trendValue="-2%"
                />
                <KPICard
                    index={3}
                    title="New Customers"
                    value={stats.newCustomers}
                    icon={Users}
                    trend="up"
                    trendValue={stats.trends.customers}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <StatsChart title="Revenue Performance" data={salesData} />
                </div>
                <div>
                    <StatsChart title="Order Distribution" data={statusData} type="pie" />
                </div>
            </div>

            {/* Recent Orders Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Orders</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Review your latest transactions.</p>
                    </div>
                    <Link to="/admin/orders">
                        <Button variant="outline" size="sm" className="gap-2">
                            View All <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {recentOrders.map((order, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={order.id}
                                        className="border-b transition-colors hover:bg-muted/50"
                                    >
                                        <td className="p-4 align-middle font-medium">{order.id}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-xs">Customer Name</span>
                                                <span className="text-[10px] text-muted-foreground">customer@email.com</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">${order.total.toFixed(2)}</td>
                                        <td className="p-4 align-middle">
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-right text-xs">
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
