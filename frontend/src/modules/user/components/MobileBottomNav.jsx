import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid, ShoppingCart, User, Store } from "lucide-react";
import { useCart } from "@/modules/user/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { pathname } = location;

  // Hide on product detail pages to avoid conflict with sticky "Add to Cart" bar
  if (pathname.startsWith("/product/") || pathname.startsWith("/store-product/")) {
    return null;
  }

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Grid, label: "Shop", path: "/shop" },
    { icon: Store, label: "Store", path: "/store-products" },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: cartCount },
    { icon: User, label: "Account", path: "/account" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t md:hidden no-print">
      <div className="grid h-full grid-cols-5 mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 transition-colors",
                isActive && "text-primary"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-6 w-6 mb-1", isActive && "fill-current")} />
                {item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center rounded-full p-0 text-[10px]"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
