import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Download,
    MoreVertical,
    Eye,
    RefreshCw,
    SearchX,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown
} from 'lucide-react';
import { ordersService } from '../services/orders.service';
import StatusBadge from '../components/StatusBadge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';

const Orders = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await ordersService.getAllOrders({
                pageNum: page,
                pageSize: 20
            });
            setOrders(data.orders);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast({
                title: "Error",
                description: "Failed to load orders.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    // Local filter for status (backend supports pagination, so client-side filtering 
    // is limited to the current page unless we implement server-side filtering params)
    const filteredOrders = statusFilter === "all"
        ? orders
        : orders.filter(o => o.status.toLowerCase().includes(statusFilter.toLowerCase()));

    // Further filter by search query if present
    const displayedOrders = searchQuery
        ? filteredOrders.filter(o =>
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : filteredOrders;

    const handleRowClick = (order) => {
        navigate(`/admin/orders/${order.id}`);
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
                    <Button className="gap-2" onClick={fetchOrders} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Sync Now
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
                                    className={`capitalize whitespace-nowrap ${statusFilter === status ? 'bg-primary text-primary-foreground' : ''}`}
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
                                ) : displayedOrders.length > 0 ? (
                                    <AnimatePresence>
                                        {displayedOrders.map((order, i) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={order.id}
                                                className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                                                onClick={() => handleRowClick(order)}
                                            >
                                                <td className="px-6 py-4 font-medium">{order.id.slice(-6).toUpperCase()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-xs">{order.user?.name || order.shippingAddress?.fullName || "Guest"}</span>
                                                        <span className="text-[10px] text-muted-foreground">{order.shippingAddress?.country || "N/A"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs whitespace-nowrap">
                                                    {new Date(order.date || order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-primary">
                                                    ₹{(order.total || order.totalAmount || 0).toFixed(2)}
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
                        <span className="text-xs text-muted-foreground">
                            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, totalItems)} of {totalItems} orders
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 w-8"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    const pageNum = i + 1; // Simplification for now
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={page === pageNum ? "primary" : "outline"}
                                            size="sm"
                                            className={`h-8 w-8 ${page === pageNum ? 'bg-primary text-primary-foreground' : ''}`}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="h-8 w-8"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Orders;
