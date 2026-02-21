import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Package, ShoppingBag, Copy, Check, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import confetti from "canvas-confetti";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const orderData = location.state?.orderData;
  const orderId = location.state?.orderId || "ORD-73921";
  const total = location.state?.total || 129.99;
  const paymentMethod = location.state?.paymentMethod || "Credit Card";

  useEffect(() => {
    // Fire confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      <div className="absolute top-6 left-4 md:left-8 z-20">
        <Button variant="ghost" className="hover:bg-transparent hover:text-primary transition-colors group" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
        </Button>
      </div>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6 relative"
          >
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
          >
            Order Placed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            Your order has been confirmed and is being processed.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm shadow-xl mb-8 overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                {/* Order ID Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Order Identification</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono font-bold">{orderId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                        onClick={handleCopyId}
                      >
                        <AnimatePresence mode="wait">
                          {copied ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                            >
                              <Check className="w-4 h-4 text-green-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                            >
                              <Copy className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit h-fit px-3 py-1 bg-primary/10 text-primary border-none text-sm font-semibold">
                    Processing
                  </Badge>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Estimated Delivery</p>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      Jan 25, 2024
                    </p>
                  </div>
                  <div className="space-y-1 md:text-right">
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <p className="font-semibold text-foreground">{paymentMethod}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            variant="default"
            className="w-full max-w-sm h-14 text-lg font-semibold shadow-lg shadow-primary/20"
            asChild
          >
            <Link to="/shop">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Keep Shopping
              <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground font-black" />
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10 text-sm text-muted-foreground"
        >
          A confirmation email has been sent to your registered address.
          <br />
          Need help? <Link to="/support" className="text-primary hover:underline font-medium">Contact Customer Support</Link>
        </motion.p>
      </div>
    </div>
  );
};

export default OrderSuccess;
