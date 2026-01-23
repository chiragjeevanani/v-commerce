import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Download,
    Target,
    MousePointer2,
    ShoppingBag,
    Zap,
    ArrowUpRight,
    ChevronDown
} from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import StatsChart from '../components/StatsChart';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const Analytics = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("Month");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const charts = await analyticsService.getSalesChartData("month");
                setSalesData(charts.labels.map((label, i) => ({
                    label,
                    value: charts.datasets[0].data[i] / 100
                })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const topProducts = [
        { name: "Wireless Headphones", sales: 450, growth: "+12.5%", revenue: 112500 },
        { name: "Smart Watch S7", sales: 320, growth: "+8.2%", revenue: 128000 },
        { name: "Denim Jacket", sales: 280, growth: "-2.4%", revenue: 16800 },
        { name: "Minimalist Lamp", sales: 210, growth: "+15.8%", revenue: 18900 },
    ];

    if (loading) return <div className="h-96 flex items-center justify-center animate-pulse">Loading Analytics...</div>;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Deep dive into your store's performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1 gap-2 bg-background border-2">
                        <Calendar className="h-3.5 w-3.5" /> {timeRange}: Oct 2023
                    </Badge>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" /> Reports <ChevronDown className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Conversion Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: Target, label: "Conversion Rate", value: "3.24%", trend: "+0.4%", color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: MousePointer2, label: "Avg. Session", value: "4m 12s", trend: "+25s", color: "text-purple-600", bg: "bg-purple-50" },
                    { icon: ShoppingBag, label: "Avg. Order Value", value: "$142.50", trend: "+$12", color: "text-green-600", bg: "bg-green-50" },
                    { icon: Zap, label: "Churn Rate", value: "1.2%", trend: "-0.2%", color: "text-orange-600", bg: "bg-orange-50" },
                ].map((metric, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={metric.label}
                    >
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                                <div className={`p-3 rounded-full ${metric.bg} ${metric.color}`}>
                                    <metric.icon className="h-6 w-6" />
                                </div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{metric.label}</p>
                                <h3 className="text-3xl font-black">{metric.value}</h3>
                                <span className={`text-[10px] font-bold ${metric.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {metric.trend} vs last period
                                </span>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <StatsChart title="Revenue Trends" data={salesData} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
                            <CardDescription>Performance of your best moving inventory.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topProducts.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary">#{i + 1}</div>
                                            <div>
                                                <p className="font-bold text-sm">{p.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{p.sales} units sold</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="font-black text-sm">${p.revenue.toLocaleString()}</p>
                                                <span className={`text-[10px] font-bold ${p.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{p.growth}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Side Insights */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-xl shadow-indigo-500/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 drop-shadow-md">
                                <TrendingUp className="h-5 w-5 text-indigo-200" />
                                Smart Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                <p className="text-xs font-medium text-indigo-100">Revenue Opportunity</p>
                                <p className="text-sm font-bold mt-1 text-pretty">
                                    Electronics category is up <span className="text-green-300">22%</span> this week. Consider increasing your ad spend.
                                </p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                <p className="text-xs font-medium text-indigo-100">Stock Alert</p>
                                <p className="text-sm font-bold mt-1 text-pretty">
                                    Denim Jackets are selling out <span className="text-orange-300">3x faster</span> than average.
                                </p>
                            </div>
                            <Button className="w-full bg-white text-indigo-700 hover:bg-white/90 font-bold">
                                Generate Full Report
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="h-[432px]">
                        <CardHeader>
                            <CardTitle>Regional Sales</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-full pt-0">
                            <div className="h-48 w-full bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed relative group">
                                <p className="text-xs text-muted-foreground italic font-medium">Interactive Geo-Map Coming Soon</p>
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-center">
                                    <p className="text-[10px] text-primary font-bold">Connecting to global sales tracking matrix...</p>
                                </div>
                            </div>
                            <div className="w-full mt-6 space-y-3">
                                {[
                                    { label: "North India", value: 45 },
                                    { label: "South India", value: 30 },
                                    { label: "International", value: 25 },
                                ].map(reg => (
                                    <div key={reg.label} className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-tighter">
                                            <span>{reg.label}</span>
                                            <span>{reg.value}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${reg.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
