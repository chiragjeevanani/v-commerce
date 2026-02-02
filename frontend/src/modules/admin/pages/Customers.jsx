import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Mail,
    MoreHorizontal,
    Ban,
    UserCheck,
    History,
    Phone,
    ArrowUpRight,
    Loader2
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
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

const Customers = () => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const result = await authService.getUsers();
            if (result.success) {
                setCustomers(result.data);
            }
        } catch (error) {
            console.error("Fetch Customers Error:", error);
            toast({
                title: "Error",
                description: "Failed to load customers from database.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleToggleStatus = async (userId) => {
        try {
            const result = await authService.toggleUserStatus(userId);
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                });
                fetchCustomers(); // Refresh list
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive",
            });
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = customers.filter(c => c.isActive).length;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage your platform users and their activity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Customers</p>
                            <p className="text-2xl font-bold">{customers.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600 dark:text-green-400">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Active Users</p>
                            <p className="text-2xl font-bold">{activeCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl text-yellow-600 dark:text-yellow-400">
                            <History className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">New This Week</p>
                            <p className="text-2xl font-bold">0</p>
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
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-muted-foreground">Fetching customers from database...</p>
                            </div>
                        ) : customers.length === 0 ? (
                            <div className="text-center py-20">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-bold">No customers found</h3>
                                <p className="text-muted-foreground">When users signup, they will appear here.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Contact</th>
                                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Joined On</th>
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
                                            key={customer._id}
                                            className="border-b hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {customer.fullName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{customer.fullName}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">Role: {customer.role}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        {customer.email}
                                                    </div>
                                                    {customer.phoneNumber && (
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            {customer.phoneNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={
                                                    customer.isActive ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                }>
                                                    {customer.isActive ? 'Active' : 'Deactivated'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem>
                                                            <ArrowUpRight className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {!customer.isActive ? (
                                                            <DropdownMenuItem className="text-green-600" onClick={() => handleToggleStatus(customer._id)}>
                                                                <UserCheck className="mr-2 h-4 w-4" /> Activate User
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem className="text-red-500" onClick={() => handleToggleStatus(customer._id)}>
                                                                <Ban className="mr-2 h-4 w-4" /> Deactivate User
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Customers;
