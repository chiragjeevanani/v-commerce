import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Search,
    Download,
    Filter,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    Clock,
    Wallet,
    TrendingUp,
    AlertCircle,
    RefreshCw,
    SearchX,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '../components/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersService } from '../services/orders.service';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Payments = () => {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Methods");
    const [stats, setStats] = useState({
        revenue: 0,
        pending: 0,
        refunds: 0,
        failed: 0
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // Reusing getAllOrders as the source of truth for payments for now
            const data = await ordersService.getAllOrders({ pageNum: page, pageSize: 50 });

            // Map orders to a transaction-like structure
            // In a real scenario, you might have a dedicated /transactions endpoint
            const mappedTxns = data.orders.map(order => ({
                id: order.razorpayPaymentId || `TXN-${order._id.slice(-6).toUpperCase()}`,
                orderId: order._id,
                amount: order.totalAmount,
                method: order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)',
                status: order.paymentStatus || (order.status === 'cancelled' ? 'Failed' : 'Success'),
                date: order.createdAt,
                customer: order.user?.name || order.shippingAddress?.fullName || 'Guest'
            }));

            setTransactions(mappedTxns);
            setTotalPages(data.totalPages);

            // Calculate simple stats from the fetched batch (or ideally from a stats endpoint)
            const revenue = mappedTxns
                .filter(t => t.status === 'paid' || t.status === 'Success')
                .reduce((acc, curr) => acc + curr.amount, 0);

            const localFailed = mappedTxns.filter(t => t.status === 'failed' || t.status === 'Failed').length;

            setStats(prev => ({
                ...prev,
                revenue: revenue, // This is just for the current page/batch in this simple version
                failed: localFailed
            }));

        } catch (error) {
            console.error("Failed to fetch transactions", error);
            toast({ title: "Error", description: "Could not load transactions.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    // Client-side filtering
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch =
            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.orderId.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === "Credit Card" || statusFilter === "UPI") {
            matchesStatus = t.method.includes("Online");
        } else if (statusFilter === "COD") {
            matchesStatus = t.method === "Cash on Delivery";
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments & Transactions</h1>
                    <p className="text-muted-foreground mt-1">Monitor revenue and manage financial transactions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export Report</Button>
                    <Button className="gap-2 bg-primary"><Wallet className="h-4 w-4" /> Payout Settings</Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Settled Balance</p>
                                <h3 className="text-3xl font-bold mt-1">₹{stats.revenue.toLocaleString()}</h3>
                                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                    <TrendingUp className="h-3 w-3" /> +12% from last month
                                </div>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                                <h3 className="text-3xl font-bold mt-1">₹0.00</h3>
                                <p className="text-xs text-muted-foreground mt-2 italic">Estimated payout: Friday</p>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                <Clock className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Refunds Processed</p>
                                <h3 className="text-3xl font-bold mt-1">₹0.00</h3>
                                <p className="text-xs text-muted-foreground mt-2">0 refunds this month</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <RefreshCw className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Failed Payments</p>
                                <h3 className="text-3xl font-bold mt-1 text-red-600">{stats.failed}</h3>
                                <div className="flex items-center gap-1 mt-2 text-xs text-red-500 font-medium cursor-pointer hover:underline">
                                    <AlertCircle className="h-3 w-3" /> Review errors
                                </div>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                <XCircle className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search TXN ID or Order ID..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2"><Filter className="h-3.5 w-3.5" /> Filter</Button>
                            <select
                                className="bg-background border rounded-md px-3 py-1 text-sm h-9"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option>All Methods</option>
                                <option>Credit Card</option>
                                <option>UPI</option>
                                <option>COD</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Transaction ID</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Order ID</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Method</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Date</th>
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
                                ) : filteredTransactions.length > 0 ? (
                                    <AnimatePresence>
                                        {filteredTransactions.map((txn, i) => (
                                            <motion.tr
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={txn.id}
                                                className="border-b hover:bg-muted/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-muted-foreground">{txn.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-primary font-bold cursor-pointer hover:underline">
                                                        {txn.orderId.slice(-6).toUpperCase()}
                                                        <ArrowUpRight className="h-3 w-3" />
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">{txn.customer}</div>
                                                </td>
                                                <td className="px-6 py-4 font-black">₹{txn.amount.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-xs">{txn.method}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant={txn.status === 'paid' || txn.status === 'Success' ? 'default' : (txn.status === 'failed' ? 'destructive' : 'secondary')}
                                                        className="capitalize"
                                                    >
                                                        {txn.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs whitespace-nowrap">
                                                    {format(new Date(txn.date), 'MMM dd, yyyy')}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-muted-foreground">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls (Reused from Orders) */}
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
                        <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-muted/50 p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-muted-foreground opacity-50" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold">Secure Payment Processing</p>
                    <p className="text-xs text-muted-foreground max-w-sm">Financial data is handled via the dropship network's secure payment gateway. V-Commerce only maintains transaction logs for order tracking and analytics.</p>
                </div>
                <Button variant="link" className="text-xs h-auto p-0">Learn about our payout cycle</Button>
            </div>
        </div>
    );
};

export default Payments;
