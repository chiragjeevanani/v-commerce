import React, { useState } from 'react';
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
    RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '../components/StatusBadge';
import { motion } from 'framer-motion';

const mockTransactions = [
    { id: "TXN-7721", orderId: "ORD-12345", amount: 249.99, method: "Visa •••• 4242", status: "Success", date: "2023-10-15" },
    { id: "TXN-7722", orderId: "ORD-12346", amount: 399.99, method: "UPI (Google Pay)", status: "Success", date: "2023-11-02" },
    { id: "TXN-7723", orderId: "ORD-12347", amount: 89.99, method: "Cash on Delivery", status: "Pending", date: "2023-11-05" },
    { id: "TXN-7724", orderId: "ORD-12348", amount: 1200.00, method: "Mastercard •••• 5555", status: "Failed", date: "2023-11-06" },
    { id: "TXN-7725", orderId: "ORD-12349", amount: 55.00, method: "Visa •••• 1111", status: "Success", date: "2023-11-07" },
];

const Payments = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTransactions = mockTransactions.filter(t =>
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                <h3 className="text-3xl font-bold mt-1">$42,500.80</h3>
                                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                    <TrendingUp className="h-3 w-3" /> +14.2% from last week
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
                                <h3 className="text-3xl font-bold mt-1">$2,140.00</h3>
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
                                <h3 className="text-3xl font-bold mt-1">$450.00</h3>
                                <p className="text-xs text-muted-foreground mt-2">3 refunds this month</p>
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
                                <h3 className="text-3xl font-bold mt-1 text-red-600">8</h3>
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
                            <select className="bg-background border rounded-md px-3 py-1 text-sm h-9">
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
                                                {txn.orderId}
                                                <ArrowUpRight className="h-3 w-3" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-black">${txn.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-xs">{txn.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={txn.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs whitespace-nowrap">
                                            {new Date(txn.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
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
