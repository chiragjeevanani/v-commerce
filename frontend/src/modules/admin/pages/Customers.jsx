import React, { useState } from 'react';
import {
    Users,
    Search,
    Mail,
    MoreHorizontal,
    Ban,
    UserCheck,
    History,
    Phone,
    ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

const mockCustomers = [
    { id: 1, name: "Arun Kumar", email: "arun.k@example.com", phone: "+91 98765 43210", orders: 12, totalSpend: 1540.50, status: "Active" },
    { id: 2, name: "Priya Sharma", email: "priya.s@example.com", phone: "+91 87654 32109", orders: 5, totalSpend: 420.25, status: "Active" },
    { id: 3, name: "Rahul Singh", email: "rahul.singh@example.com", phone: "+91 76543 21098", orders: 0, totalSpend: 0, status: "New" },
    { id: 4, name: "Sneha Patil", email: "sneha.p@example.com", phone: "+91 65432 10987", orders: 24, totalSpend: 3200.75, status: "Active" },
    { id: 5, name: "Vikram Mehta", email: "v.mehta@example.com", phone: "+91 54321 09876", orders: 2, totalSpend: 150.00, status: "Blocked" },
];

const Customers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [customers, setCustomers] = useState(mockCustomers);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage your platform users and their activity.</p>
                </div>
                <Button className="gap-2">
                    <Mail className="h-4 w-4" /> Send Bulk Email
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Customers</p>
                            <p className="text-2xl font-bold">1,482</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600 dark:text-green-400">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Active This Month</p>
                            <p className="text-2xl font-bold">856</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl text-yellow-600 dark:text-yellow-400">
                            <History className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Retention Rate</p>
                            <p className="text-2xl font-bold">64%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Filter</Button>
                            <Button variant="outline" size="sm">Sort</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Contact</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Orders</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Total Spend</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={customer.id}
                                        className="border-b hover:bg-muted/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{customer.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">ID: CUST-00{customer.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-center md:text-left">{customer.orders}</td>
                                        <td className="px-6 py-4 font-bold text-primary">${customer.totalSpend.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={
                                                customer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    customer.status === 'Blocked' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                            }>
                                                {customer.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem>
                                                        <ArrowUpRight className="mr-2 h-4 w-4" /> View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <History className="mr-2 h-4 w-4" /> Order History
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {customer.status === 'Blocked' ? (
                                                        <DropdownMenuItem className="text-green-600">
                                                            <UserCheck className="mr-2 h-4 w-4" /> Unblock User
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem className="text-red-500">
                                                            <Ban className="mr-2 h-4 w-4" /> Block User
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Customers;
