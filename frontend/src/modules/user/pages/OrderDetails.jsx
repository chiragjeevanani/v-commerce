import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
    ArrowLeft, Package, MapPin, CreditCard, Calendar,
    Printer, AlertCircle, Loader2, Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import OrderTimeline from "../components/OrderTimeline";
import { ordersService } from "@/services/orders.service";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/utils/utils";

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payRemainingLoading, setPayRemainingLoading] = useState(false);
    const [razorpayKeyId, setRazorpayKeyId] = useState(null);

    const fetchOrder = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await ordersService.getOrderDetails(orderId);
            if (data) {
                setOrder(data);
            } else if (!silent) {
                setError("Order not found.");
            }
        } catch (err) {
            if (!silent) setError("Failed to fetch order details.");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId, location.key]);

    useEffect(() => {
        if (!order?.isPartialPayment || order?.remainingPaymentStatus === "paid") return;
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        api.getRazorpayPublicKey().then((keyData) => {
            if (keyData.success && keyData.keyId) setRazorpayKeyId(keyData.keyId);
        }).catch(() => {});
    }, [order?.isPartialPayment, order?.remainingPaymentStatus]);

    const handlePayRemaining = async () => {
        if (!order?.remainingAmount || order.remainingPaymentStatus === "paid" || !razorpayKeyId) return;
        setPayRemainingLoading(true);
        try {
            const res = await api.createRemainingPaymentOrder(order.id || order._id, order.remainingAmount);
            if (!res.success || !res.order) throw new Error(res.message || "Failed to create payment");
            const options = {
                key: razorpayKeyId,
                amount: res.order.amount,
                currency: res.order.currency || "INR",
                name: "V-Commerce",
                description: "Remaining amount for order",
                order_id: res.order.id,
                handler: async function (response) {
                    setPayRemainingLoading(true);
                    try {
                        const verifyRes = await api.verifyRemainingPayment({
                            orderId: order.id || order._id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        if (verifyRes.success) {
                            toast({ title: "Payment successful", description: "Remaining amount paid." });
                            fetchOrder(true);
                        } else {
                            toast({ title: "Verification failed", description: verifyRes.message, variant: "destructive" });
                        }
                    } catch (err) {
                        toast({ title: "Error", description: err.message, variant: "destructive" });
                    } finally {
                        setPayRemainingLoading(false);
                    }
                },
                theme: { color: "#000000" },
            };
            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", () => {
                toast({ title: "Payment failed", description: "Please try again.", variant: "destructive" });
                setPayRemainingLoading(false);
            });
            rzp.open();
        } catch (err) {
            toast({ title: "Error", description: err.message || "Could not start payment", variant: "destructive" });
        }
        setPayRemainingLoading(false);
    };

    const getStatusStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'placed': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case 'confirmed': return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            case 'shipped': return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case 'delivered': return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            default: return "bg-muted text-muted-foreground";
        }
    };

    if (loading) {
        return (
            <div className="container py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Loading order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-6">{error || "We couldn't find the order you're looking for."}</p>
                <Button onClick={() => navigate('/orders')}>Back to My Orders</Button>
            </div>
        );
    }

    return (
        <div className="container py-8 md:py-12 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/orders')}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold font-mono">{order.id}</h1>
                            <Badge className={cn("px-2.5 py-0.5 border-none", getStatusStyles(order.status))}>
                                {order.status.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-muted-foreground text-sm">Placed on {new Date(order.date ?? order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            {order.cjResponse?.data?.orderId && (
                                <p className="text-xs font-bold text-primary flex items-center gap-2">
                                    <span className="text-muted-foreground font-medium uppercase tracking-tighter">Tracking ID:</span>
                                    {order.cjResponse.data.orderId}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 no-print">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.print()}
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Timeline and Items */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Timeline Card */}
                    <Card className="border-none shadow-xl bg-card rounded-3xl overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Order Tracking
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 pb-8 px-6 md:px-10">
                            <OrderTimeline steps={order.timeline} currentStatus={order.status} />
                        </CardContent>
                    </Card>

                    {/* Items Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items ({order.items.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
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
                                        <div key={item.productId ?? item.pid} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                                            <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                                <img src={parseImage(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-bold text-lg leading-tight mb-1">{item.name}</h4>
                                                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-start sm:gap-4 mt-2">
                                                    <p className="font-bold text-primary">₹{item.price.toFixed(2)} each</p>
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary p-0 sm:px-2" asChild>
                                                        <Link to={`/product/${item.productId ?? item.pid}`}>View Product</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="font-bold text-lg hidden sm:block">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Order Summary and Info */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.isPartialPayment && (
                                <>
                                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">Partial Payment</p>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Paid (first)</span>
                                            <span>₹{(order.amountPaid ?? 500).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Remaining</span>
                                            <span className="font-bold">₹{(order.remainingAmount ?? 0).toFixed(2)}</span>
                                        </div>
                                        {order.remainingPaymentStatus === "paid" ? (
                                            <Badge className="bg-green-600 text-white">Remaining paid</Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="w-full mt-2 gap-2"
                                                onClick={handlePayRemaining}
                                                disabled={payRemainingLoading || !razorpayKeyId}
                                            >
                                                {payRemainingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                                                Pay remaining ₹{(order.remainingAmount ?? 0).toFixed(0)}
                                            </Button>
                                        )}
                                    </div>
                                    <Separator />
                                </>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{(order.total ?? order.totalAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-green-600 font-medium">FREE</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>₹0.00</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">₹{(order.total ?? order.totalAmount).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logistics Info Cards */}
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Shipping Address</p>
                                    <p className="text-sm font-semibold">
                                        {typeof order.shippingAddress === 'object' ? (
                                            <>
                                                {order.shippingAddress.fullName}<br />
                                                {order.shippingAddress.street}<br />
                                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                                {order.shippingAddress.country}
                                            </>
                                        ) : (
                                            order.shippingAddress || "N/A"
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Payment</p>
                                    <p className="text-sm font-semibold">
                                        {order.paymentMethod || "N/A"}
                                        {order.isPartialPayment && (
                                            <span className="block text-muted-foreground font-normal mt-1">
                                                {order.remainingPaymentStatus === "paid" ? "Full amount paid" : "Partial paid, remaining due"}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Estimated Delivery</p>
                                    <p className="text-sm font-semibold text-primary">{order.estimatedDelivery || "Coming Soon"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reorder/Support Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                        <Button className="w-full h-11">Reorder All Items</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
