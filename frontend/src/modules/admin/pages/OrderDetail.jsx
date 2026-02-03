import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Package,
    Truck,
    User,
    MapPin,
    CreditCard,
    Calendar,
    Receipt,
    Loader2
} from 'lucide-react';
import { ordersService } from '../services/orders.service';
import StatusBadge from '../components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await ordersService.getOrderById(id);
                setOrder(data);
            } catch (error) {
                console.error("Failed to load order:", error);
                toast({
                    title: "Error",
                    description: "Failed to load order details.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="text-muted-foreground">Order not found.</p>
                <Button variant="outline" onClick={() => navigate('/admin/orders')}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Orders
                </Button>
            </div>
        );
    }

    // Safely handle deprecated shippingAddress structure if strictly string vs object
    const shippingAddressDisplay = typeof order.shippingAddress === 'string'
        ? order.shippingAddress
        : order.shippingAddress
            ? `${order.shippingAddress.fullName || ''}, ${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''}, ${order.shippingAddress.country || ''} - ${order.shippingAddress.zipCode || ''}`
            : 'N/A';

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => navigate('/admin/orders')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">Order #{order.id?.slice(-8).toUpperCase()}</h1>
                            <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt || order.date).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Receipt className="h-4 w-4" /> Invoice
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2 Columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <Card>
                        <CardHeader className="border-b bg-muted/20">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" /> Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {order.items?.map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 items-center">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden border bg-background shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">SKU: {item.sku || item.pid || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${(item.price || 0).toFixed(2)}</p>
                                            <p className="text-sm text-muted-foreground">x {item.quantity}</p>
                                        </div>
                                        <div className="text-right w-24 font-bold">
                                            ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader className="border-b bg-muted/20">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" /> Order Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="relative border-l-2 border-muted ml-3 space-y-8">
                                {order.timeline?.map((event, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 ${event.completed ? 'bg-primary border-primary' : 'bg-background border-muted'}`} />
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${event.completed ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {event.label}
                                            </span>
                                            {event.date && (
                                                <span className="text-xs text-muted-foreground">{new Date(event.date).toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - 1 Column */}
                <div className="space-y-6">
                    {/* Customer */}
                    <Card>
                        <CardHeader className="border-b bg-muted/20 pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" /> Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {order.user?.name?.[0] || order.customer?.name?.[0] || 'G'}
                                </div>
                                <div>
                                    <p className="font-medium">{order.user?.name || order.customer?.name || "Guest"}</p>
                                    <p className="text-xs text-muted-foreground">{order.user?.email || "No email provided"}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <MapPin className="h-4 w-4" /> Shipping Address
                                </div>
                                <p className="text-sm leading-relaxed pl-6">
                                    {shippingAddressDisplay}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Summary */}
                    <Card>
                        <CardHeader className="border-b bg-muted/20 pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border">
                                <span className="text-sm font-medium">{order.paymentMethod || "Card"}</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Paid</Badge>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${(order.total || order.totalAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>$0.00</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">${(order.total || order.totalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
