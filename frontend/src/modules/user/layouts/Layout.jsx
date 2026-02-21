import React from "react";
import { Outlet, useLocation, useOutlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";

const Layout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const isProductDetail = location.pathname.startsWith("/product/") || location.pathname.startsWith("/store-product/");
  const authPages = ["/login", "/signup", "/forgot-password", "/verify-otp"];
  const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");
  const isAuthPage = authPages.includes(currentPath) || authPages.includes(location.pathname);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && (
        (!isProductDetail) ? <Navbar /> : (
          <div className="hidden md:block">
            <Navbar />
          </div>
        )
      )}
      <main className="flex-1 min-h-[50vh] pb-16 md:pb-0 relative overflow-x-hidden">
        {outlet || <div className="min-h-[50vh]" />}
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
};

export default Layout;
