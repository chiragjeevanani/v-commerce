import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Mail,
    Phone,
    Calendar,
    Shield,
    Package,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { ordersService } from '../services/orders.service';
import StatusBadge from '../components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch customer details
                const customerRes = await authService.getUserById(id);
                if (customerRes.success) {
                    setCustomer(customerRes.data);
                } else {
                    throw new Error(customerRes.message || "Failed to fetch customer");
                }

                // Fetch customer orders
                const ordersData = await ordersService.getOrdersByCustomerId(id);
                setOrders(ordersData);

            } catch (error) {
                console.error("Failed to load customer data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load customer details or history.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="text-muted-foreground">Customer not found.</p>
                <Button variant="outline" onClick={() => navigate('/admin/customers')}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Customers
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => navigate('/admin/customers')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{customer.fullName}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {customer.email}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Joined {new Date(customer.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="ml-auto">
                    <Badge variant={customer.isActive ? "success" : "destructive"} className={
                        customer.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                    }>
                        {customer.isActive ? "Active Account" : "Deactivated"}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar - Customer Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="border-b bg-muted/20 pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" /> Account Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    {customer.fullName?.[0] || "U"}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{customer.fullName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{customer.role}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground block text-xs mb-1">Email Address</span>
                                    <div className="font-medium flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        {customer.email}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs mb-1">Phone Number</span>
                                    <div className="font-medium flex items-center gap-2">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        {customer.phoneNumber || "N/A"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs mb-1">Verification Status</span>
                                    <Badge variant="outline" className={customer.isVerified ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50"}>
                                        {customer.isVerified ? "Verified" : "Unverified"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                                <Package className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-2xl font-bold">{orders.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Lifetime order count</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Order History */}
                <div className="lg:col-span-2">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="border-b bg-muted/20 pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" /> Order History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Order ID</th>
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Amount</th>
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length > 0 ? (
                                            orders.map((order) => (
                                                <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium">{order.id.slice(-6).toUpperCase()}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {new Date(order.createdAt || order.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-primary">
                                                        ${(order.totalAmount || order.total || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={order.status} />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                        >
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-10 text-center text-muted-foreground">
                                                    <p>No orders placed by this customer yet.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
