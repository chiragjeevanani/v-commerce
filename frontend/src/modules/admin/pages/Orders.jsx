import React, { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    RefreshCw,
    SearchX,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { ordersService } from '../services/orders.service';
import StatusBadge from '../components/StatusBadge';
import OrderDrawer from '../components/OrderDrawer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await ordersService.getAllOrders();
                setOrders(data);
                setFilteredOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;

        if (statusFilter !== "all") {
            result = result.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.id.toLowerCase().includes(query) ||
                o.paymentMethod.toLowerCase().includes(query)
            );
        }

        setFilteredOrders(result);
    }, [searchQuery, statusFilter, orders]);

    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setIsDrawerOpen(true);
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
                    <p className="text-muted-foreground mt-1">Manage and track all customer orders.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Export
                    </Button>
                    <Button className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Sync Now
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by ID or customer..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                            {["all", "pending", "confirmed", "shipped", "delivered"].map(status => (
                                <Button
                                    key={status}
                                    variant={statusFilter === status ? "primary" : "ghost"}
                                    size="sm"
                                    className="capitalize whitespace-nowrap"
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Order ID</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b">
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j} className="p-6"><Skeleton className="h-4 w-full" /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : filteredOrders.length > 0 ? (
                                    <AnimatePresence>
                                        {filteredOrders.map((order, i) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={order.id}
                                                className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                                                onClick={() => handleRowClick(order)}
                                            >
                                                <td className="px-6 py-4 font-medium">{order.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-xs">Jane Doe</span>
                                                        <span className="text-[10px] text-muted-foreground">jane@example.com</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs whitespace-nowrap">
                                                    {new Date(order.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-primary">
                                                    ${order.total.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleRowClick(order)}>
                                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <RefreshCw className="mr-2 h-4 w-4" /> Sync Supplier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                                                Cancel Order
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <SearchX className="h-10 w-10 opacity-20" />
                                                <p className="font-medium">No orders found matching your criteria.</p>
                                                <Button variant="link" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
                                                    Clear all filters
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
                        <span className="text-xs text-muted-foreground">Showing 1 to {filteredOrders.length} of {orders.length} orders</span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" disabled className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" className="h-8 bg-primary text-primary-foreground">1</Button>
                            <Button variant="outline" size="icon" disabled className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <OrderDrawer
                order={selectedOrder}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
};

export default Orders;
