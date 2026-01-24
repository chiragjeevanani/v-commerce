import React, { useState } from 'react';
import {
    Search,
    Bell,
    User,
    Moon,
    Sun,
    Menu,
    ChevronDown,
    LogOut,
    Settings as SettingsIcon
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '@/modules/user/components/ThemeProvider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Header = () => {
    const { adminUser, notifications, logout } = useAdmin();
    const { theme, setTheme } = useTheme();
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    if (!adminUser) return null;

    const unreadCount = notifications.filter(n => !n.read).length;


    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-6 lg:px-10">

                {/* Search Bar */}
                <div className={`relative flex items-center transition-all duration-300 ${isSearchFocused ? 'w-full max-w-md' : 'w-64'}`}>
                    <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders, products..."
                        className="pl-9 bg-muted/50 border-none focus-visible:ring-primary"
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">

                    {/* Dark Mode Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="rounded-full"
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative rounded-full">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <Badge
                                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 border-2 border-background"
                                    >
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <DropdownMenuItem key={n.id} className="flex flex-col items-start p-4 gap-1">
                                            <div className="flex w-full justify-between items-center">
                                                <span className="font-semibold text-sm">{n.title}</span>
                                                <span className="text-[10px] text-muted-foreground">{n.time}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="w-full justify-center text-primary font-medium">
                                View All Notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2 px-2 hover:bg-accent rounded-full">
                                <div className="h-8 w-8 rounded-full overflow-hidden border">
                                    <img src={adminUser.avatar} alt={adminUser.name} className="h-full w-full object-cover" />
                                </div>
                                {!isSearchFocused && (
                                    <div className="hidden lg:flex flex-col items-start text-left">
                                        <span className="text-sm font-semibold leading-none">{adminUser.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{adminUser.role}</span>
                                    </div>
                                )}
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>
        </header>
    );
};

export default Header;
