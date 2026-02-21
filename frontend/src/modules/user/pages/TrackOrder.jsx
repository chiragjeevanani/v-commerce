import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, MapPin, CreditCard, Calendar, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import OrderTimeline from "../components/OrderTimeline";
import { api } from "@/services/api";

const TrackOrder = () => {
    const { orderId: paramOrderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [orderId, setOrderId] = useState(paramOrderId || "");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrder = async (id) => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.trackOrder(id);
            if (data) {
                setOrder(data);
            } else {
                setError("Order not found. Please check the Order ID.");
                setOrder(null);
            }
        } catch (err) {
            setError("Failed to fetch order information.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (paramOrderId) {
            fetchOrder(paramOrderId);
        }
    }, [paramOrderId, location.key]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (orderId) {
            navigate(`/track-order/${orderId}`);
        }
    };

    return (
        <div className="container py-8 md:py-12 max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/account")}
                    className="rounded-full"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
            </div>

            {!paramOrderId || error ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                        <CardContent className="pt-10 pb-10">
                            <Package className="w-16 h-16 text-primary/40 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold mb-2">Track your shipment</h2>
                            <p className="text-muted-foreground mb-8">
                                Enter your order identification number below to view its current status and location.
                            </p>

                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    placeholder="Order ID (e.g., ORD-12345)"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="h-12 text-lg font-mono"
                                    required
                                />
                                <Button type="submit" size="lg" className="h-12 px-8">
                                    <Search className="w-5 h-5 mr-2" />
                                    Track Now
                                </Button>
                            </form>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-6 p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2 justify-center"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    <p className="font-medium">{error}</p>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-lg font-medium text-muted-foreground">Retrieving shipment details...</p>
                </div>
            ) : order ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Timeline Section */}
                    <div className="md:col-span-2 space-y-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Shipment Progress</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Order ID: <span className="font-mono font-bold text-foreground">{order.id}</span></p>
                                </div>
                                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-none">
                                    {order.status.toUpperCase()}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <OrderTimeline steps={order.timeline} currentStatus={order.status} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item) => {
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
                                            <div key={item.productId || item.pid} className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                                    <img src={parseImage(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium leading-tight">{item.name}</h4>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        );
                                    })}
                                    <Separator className="my-4" />
                                    <div className="flex justify-between items-center pt-2">
                                        <p className="font-medium text-muted-foreground">Total Paid</p>
                                        <p className="text-xl font-bold text-primary">₹{order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Delivery Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Shipping Address</p>
                                        <p className="text-sm font-semibold">
                                            {typeof order.shippingAddress === 'object' ? (
                                                <>
                                                    {order.shippingAddress.fullName}<br />
                                                    {order.shippingAddress.street}<br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                                                </>
                                            ) : (
                                                order.shippingAddress
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Expected Delivery</p>
                                        <p className="text-sm font-semibold">{order.estimatedDelivery}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Payment Method</p>
                                        <p className="text-sm font-semibold">{order.paymentMethod}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/10">
                            <CardContent className="pt-6">
                                <h4 className="font-bold mb-2">Need help?</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    If you have any questions about your order, our 24/7 support team is here to help.
                                </p>
                                <Button variant="outline" className="w-full bg-background">
                                    Contact Support
                                </Button>
                            </CardContent>
                        </Card>

                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-primary"
                            onClick={() => {
                                setOrderId("");
                                navigate("/track-order");
                            }}
                        >
                            Track another order
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default TrackOrder;
