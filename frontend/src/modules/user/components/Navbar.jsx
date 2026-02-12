import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, User, Menu, X, LogOut, Package, Settings, LogIn, Home } from "lucide-react";
import { useCart } from "@/modules/user/context/CartContext";
import { useAuth } from "@/modules/user/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/modules/user/components/ModeToggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-logo tracking-wider text-primary">
              V-Commerce
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link to="/shop" className="transition-colors hover:text-foreground">
              Shop
            </Link>
            <Link to="/store-products" className="transition-colors hover:text-foreground">
              Store Products
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.form
            onSubmit={handleSearch}
            className="hidden lg:flex relative"
            initial={false}
            animate={{ width: searchQuery || isSearchFocused ? 320 : 220 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search elegance..."
              className="pl-10 rounded-full bg-muted border-none focus-visible:ring-primary/20 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </motion.form>

          <div className="flex items-center gap-2">
            <ModeToggle />

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative group rounded-full">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <ShoppingCart className="h-5 w-5 group-hover:text-primary transition-colors" />
                </motion.div>
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-primary border-2 border-background"
                      >
                        {cartCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border">
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                      ) : (
                        user?.fullName?.charAt(0) || 'U'
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-muted">
                  <DropdownMenuLabel className="p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-black leading-none">{user?.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground font-medium italic">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-bold" onClick={() => navigate('/account')}>
                    <User className="h-4 w-4" /> Account
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-bold" onClick={() => navigate('/orders')}>
                    <Package className="h-4 w-4" /> Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-bold" onClick={() => navigate('/account?tabs=settings')}>
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-red-500 focus:text-red-500 font-black" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button variant="default" className="rounded-full px-6 font-bold gap-2">
                  <LogIn className="h-4 w-4" /> Login
                </Button>
              </Link>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l bg-background">
                <SheetHeader>
                  <SheetTitle className="text-left font-logo text-2xl text-primary">V-Commerce</SheetTitle>
                  <SheetDescription className="sr-only"> Navigation </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  {!isAuthenticated && (
                    <div className="grid grid-cols-2 gap-2">
                      <SheetClose asChild>
                        <Link to="/login">
                          <Button variant="outline" className="w-full rounded-xl font-bold">Login</Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/signup">
                          <Button className="w-full rounded-xl font-bold">Join</Button>
                        </Link>
                      </SheetClose>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    {[
                      { to: "/", label: "Home", icon: Home },
                      { to: "/shop", label: "Shop", icon: Package },
                      { to: "/store-products", label: "Store Products", icon: Package },
                      { to: "/cart", label: "Cart", icon: ShoppingCart },
                      { to: "/orders", label: "My Orders", icon: Package },
                      { to: "/account", label: "Profile", icon: User },
                    ].map((link, i) => (
                      <motion.div
                        key={link.to}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <SheetClose asChild>
                          <Link
                            to={link.to}
                            className="flex items-center gap-4 text-base font-bold p-4 rounded-xl hover:bg-muted transition-colors"
                          >
                            {link.label}
                          </Link>
                        </SheetClose>
                      </motion.div>
                    ))}
                  </div>

                  {isAuthenticated && (
                    <div className="mt-8 pt-4 border-t">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-4 text-red-500 font-black hover:bg-red-50 hover:text-red-600 rounded-xl"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" /> Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
