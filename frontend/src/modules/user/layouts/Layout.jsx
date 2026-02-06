import React from "react";
import { Outlet, useLocation, useOutlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import { AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";

const Layout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const isProductDetail = location.pathname.startsWith("/product/");
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
      <main className="flex-1 pb-16 md:pb-0 relative overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            {outlet}
          </PageTransition>
        </AnimatePresence>
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
};

export default Layout;
