import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Package,
    Search,
    ChevronRight,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    ShoppingBag,
    Calendar,
    ArrowLeft
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ordersService } from "@/services/orders.service";
import { cn } from "@/utils/utils";

const OrderHistory = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await ordersService.getMyOrders();

                // ✅ Normalize backend response (CRITICAL FIX)
                const ordersArray =
                    Array.isArray(response)
                        ? response
                        : Array.isArray(response?.data)
                            ? response.data
                            : Array.isArray(response?.orders)
                                ? response.orders
                                : [];

                setOrders(ordersArray);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [location.key]);

    const getStatusStyles = (status = "") => {
        switch (status.toLowerCase()) {
            case "placed":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "confirmed":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            case "shipped":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case "delivered":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "cancelled":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    const getStatusIcon = (status = "") => {
        switch (status.toLowerCase()) {
            case "placed":
                return <Clock className="w-3 h-3" />;
            case "confirmed":
                return <CheckCircle2 className="w-3 h-3" />;
            case "shipped":
                return <Truck className="w-3 h-3" />;
            case "delivered":
                return <CheckCircle2 className="w-3 h-3" />;
            default:
                return <AlertCircle className="w-3 h-3" />;
        }
    };

    // ✅ Defensive filtering (no crash ever)
    const filteredOrders = Array.isArray(orders)
        ? orders.filter(order =>
            order?.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order?.items?.some(item =>
                item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        : [];

    return (
        <div className="container py-8 md:py-12 max-w-4xl">
            <Button
                variant="ghost"
                className="mb-6 hover:bg-transparent hover:text-primary transition-colors group p-0"
                onClick={() => navigate("/account")}
            >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Account
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your recent purchases.
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 w-full rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <Card className="border-2 border-dashed border-muted bg-transparent py-16 text-center">
                    <CardContent className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No orders found</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                            {searchQuery
                                ? "We couldn't find any orders matching your search."
                                : "You haven't placed any orders yet."}
                        </p>
                        <Button asChild>
                            <Link to="/shop">Start Shopping</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className="group hover:border-primary/30 transition-all hover:shadow-md cursor-pointer"
                                onClick={() => navigate(`/orders/${order.id}`)}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Images */}
                                        <div className="p-4 sm:p-6 sm:border-r border-border flex flex-row sm:flex-col gap-2 bg-muted/20">
                                            <div className="relative flex -space-x-3 overflow-hidden">
                                                {order.items?.slice(0, 3).map((item, i) => {
                                                    const parseImage = (imgData) => {
                                                        if (!imgData) return "";
                                                        if (typeof imgData !== 'string') return imgData;
                                                        try {
                                                            if (imgData.startsWith('[') || imgData.startsWith('{')) {
                                                                const parsed = JSON.parse(imgData);
                                                                return Array.isArray(parsed) ? parsed[0] : imgData;
                                                            }
                                                            return imgData;
                                                        } catch (e) {
                                                            return imgData;
                                                        }
                                                    };
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="inline-block h-12 w-12 rounded-full ring-2 ring-background overflow-hidden bg-white"
                                                        >
                                                            <img
                                                                src={parseImage(item.image)}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                                {order.items?.length > 3 && (
                                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted ring-2 ring-background text-xs font-medium">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-center sm:mt-2">
                                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                                    {order.items?.length} item
                                                    {order.items?.length !== 1 ? "s" : ""}
                                                </p>
                                                <p className="text-sm font-bold text-foreground">
                                                    ₹{order.total?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                                        ORDER ID
                                                    </p>
                                                    <h3 className="font-mono font-bold text-lg leading-none">
                                                        {order.id}
                                                    </h3>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        className={cn(
                                                            "flex items-center gap-1 px-2 py-0.5 border-none",
                                                            getStatusStyles(order.status)
                                                        )}
                                                    >
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </Badge>
                                                    {order.isPartialPayment && (
                                                        <Badge variant="outline" className="text-[10px] font-medium">
                                                            {order.remainingPaymentStatus === "paid" ? "Fully paid" : `₹${(order.remainingAmount ?? 0).toFixed(0)} due`}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        {new Date(order.date ?? order.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="group-hover:text-primary p-0 h-auto"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
