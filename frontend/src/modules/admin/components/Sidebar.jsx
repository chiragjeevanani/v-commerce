import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', end: true },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const Sidebar = () => {
    const { sidebarCollapsed, toggleSidebar, logout } = useAdmin();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-full bg-card border-r z-50 transition-all duration-300 ease-in-out flex flex-col",
                sidebarCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Brand Logo */}
            <div className="p-6 border-b flex items-center justify-between">
                {!sidebarCollapsed && (
                    <span className="font-logo text-2xl text-primary">V-Commerce</span>
                )}
                {sidebarCollapsed && (
                    <span className="font-logo text-2xl text-primary mx-auto">V</span>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!sidebarCollapsed && (
                            <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                {item.label}
                            </span>
                        )}

                        {/* Tooltip on collapsed */}
                        {sidebarCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border shadow-md whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t space-y-2">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group relative",
                        sidebarCollapsed && "justify-center"
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!sidebarCollapsed && <span className="font-medium">Logout</span>}

                    {sidebarCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md whitespace-nowrap z-50">
                            Logout
                        </div>
                    )}
                </button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="w-full h-10 hover:bg-accent"
                >
                    {sidebarCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <ChevronLeft className="h-5 w-5" />
                            <span className="text-xs">Collapse Sidebar</span>
                        </div>
                    )}
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;
