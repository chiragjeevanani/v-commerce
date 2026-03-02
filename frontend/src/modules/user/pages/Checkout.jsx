import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, MapPin, Truck, ArrowLeft } from "lucide-react";
import { useCart } from "@/modules/user/context/CartContext";
import { api } from "@/services/api";
import { useAuth } from "@/modules/user/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddressForm from "@/modules/user/components/AddressForm";
import { Separator } from "@/components/ui/separator";
import AnimatedNumber from "@/modules/user/components/AnimatedNumber";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const isOrderPlaced = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [usePartialPayment, setUsePartialPayment] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    address: "",
    pinCode: "",
    phoneNumber: user?.phoneNumber || "",
  });

  // State for shipping estimation
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const shippingFee = selectedShipping?.fee ?? selectedShipping?.price ?? 0;
  const orderTotal = (cartTotal * 1.1) + shippingFee;
  const cartHasPartialPayment = cart.some((item) => item.allowPartialPayment === true);
  const PARTIAL_PAYMENT_AMOUNT = 500;
  const showPartialOption = cartHasPartialPayment && orderTotal > PARTIAL_PAYMENT_AMOUNT;

  useEffect(() => {
    if (cart.length === 0 && !isOrderPlaced.current) {
      navigate("/cart");
    }
  }, [cart, navigate, location.key]);

  // Fetch shipping estimate when cart or address changes
  useEffect(() => {
    const getEstimate = async () => {
      if (cart.length > 0) {
        // Check if cart has any CJ products (non-store products)
        const cjItems = cart.filter(item => !item.isStoreProduct);

        // If only store products, set default shipping
        if (cjItems.length === 0) {
          setShippingMethods([{
            name: "Standard Shipping",
            price: 0,
            time: "5-7 business days"
          }]);
          setSelectedShipping({
            name: "Standard Shipping",
            price: 0,
            time: "5-7 business days"
          });
          setDeliveryEstimate("5-7 business days");
          return;
        }

        // For CJ products, estimate shipping
        setShippingLoading(true);
        try {
          // Use the first CJ item's PID for estimation
          const res = await api.estimateShipping({
            pid: cjItems[0].pid,
            quantity: cjItems[0].quantity,
            countryCode: 'IN'
          });

          if (res.success && res.data && res.data.length > 0) {
            setShippingMethods(res.data);
            // Default to the first (usually cheapest/standard) method
            const standard = res.data[0];
            setSelectedShipping(standard);
            setDeliveryEstimate(standard.time);
          }
        } catch (error) {
          console.error("Shipping estimate failed", error);
          // Fallback for store products or if estimation fails
          setShippingMethods([{
            name: "Standard Shipping",
            price: 0,
            time: "5-7 business days"
          }]);
          setSelectedShipping({
            name: "Standard Shipping",
            price: 0,
            time: "5-7 business days"
          });
        } finally {
          setShippingLoading(false);
        }
      }
    };
    getEstimate();
  }, [cart]);

  // Razorpay key state
  const [razorpayKeyId, setRazorpayKeyId] = useState(null);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);

  // Load Razorpay Script and Key
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    
    // Fetch Razorpay public key from backend
    const loadRazorpayKey = async () => {
      try {
        const keyData = await api.getRazorpayPublicKey();
        if (keyData.success && keyData.keyId) {
          setRazorpayKeyId(keyData.keyId);
          setRazorpayEnabled(keyData.isEnabled !== false);
        }
      } catch (error) {
        console.error("Failed to load Razorpay key:", error);
      }
    };
    
    loadRazorpayKey();
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      if (!formData.fullName || !formData.address || !formData.pinCode || !formData.phoneNumber) {
        toast({
          title: "Missing details",
          description: "Please fill name, address, pin code and mobile number.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const shippingAddress = {
        fullName: formData.fullName,
        street: formData.address,
        city: "",
        state: "",
        zipCode: formData.pinCode,
        phoneNumber: formData.phoneNumber,
      };

      const totalAmount = (cartTotal * 1.1) + shippingFee;
      const amountToPay = usePartialPayment ? PARTIAL_PAYMENT_AMOUNT : totalAmount;

      // Branching logic for Payment Method
      if (paymentMethod === 'cod') {
        const res = await api.placeOrder({
          items: cart,
          total: totalAmount,
          shipping: shippingAddress,
          paymentMethod: paymentMethod,
        });

        isOrderPlaced.current = true;
        clearCart();
        navigate("/order-success", {
          state: {
            orderId: res.orderId,
            total: totalAmount,
            paymentMethod: "Cash on Delivery",
            orderData: res.orderData
          }
        });
      } else if (paymentMethod === 'online') {
        // Check if Razorpay is configured and enabled
        if (!razorpayKeyId) {
          toast({ 
            title: "Payment Gateway Not Configured", 
            description: "Razorpay is not configured. Please contact administrator.", 
            variant: "destructive" 
          });
          setLoading(false);
          return;
        }

        if (!razorpayEnabled) {
          toast({ 
            title: "Payment Gateway Disabled", 
            description: "Razorpay payment gateway is currently disabled. Please use Cash on Delivery.", 
            variant: "destructive" 
          });
          setLoading(false);
          return;
        }

        // 1. Create Razorpay Order on Backend
        const rzpOrderRes = await api.createRazorpayOrder(amountToPay);

        if (!rzpOrderRes.success) {
          throw new Error(rzpOrderRes.message || "Failed to create payment order");
        }

        const rzpOrder = rzpOrderRes.order;

        // 2. Open Razorpay Checkout
        const options = {
          key: razorpayKeyId, // Use key from backend settings
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "V-Commerce",
          description: "Order Payment",
          order_id: rzpOrder.id,
          handler: async function (response) {
            // 3. Verify Payment on Backend
            setLoading(true);
            try {
              const verifyRes = await api.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  items: cart,
                  total: totalAmount,
                  shipping: shippingAddress,
                  isPartialPayment: usePartialPayment,
                  amountPaid: amountToPay,
                  totalOrderAmount: totalAmount
                }
              });

              if (verifyRes.success) {
                isOrderPlaced.current = true;
                clearCart();
                navigate("/order-success", {
                  state: {
                    orderId: verifyRes.orderId,
                    total: totalAmount,
                    paymentMethod: "Online (Razorpay)",
                    orderData: verifyRes.orderData
                  }
                });
              } else {
                toast({ title: "Payment Verification Failed", description: verifyRes.message, variant: "destructive" });
              }
            } catch (err) {
              console.error("Verification failed", err);
              toast({ title: "Verification Error", description: err.message, variant: "destructive" });
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: shippingAddress.fullName,
            email: JSON.parse(localStorage.getItem("user"))?.email || "",
            contact: shippingAddress.phoneNumber,
          },
          theme: {
            color: "#000000",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
        });
        rzp.open();
        setLoading(false); // Stop main loading so user can interact with RZP
      }

    } catch (error) {
      console.error("Order failed", error);
      toast({ title: "Order Failed", description: error.message || "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      if (paymentMethod !== 'online') {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container py-8 max-w-4xl min-h-screen">
      <Button variant="ghost" className="mb-6 -ml-2 hover:bg-transparent hover:text-primary transition-colors group" onClick={() => navigate("/cart")}>
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Cart
      </Button>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-2xl bg-card rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-6">
              <CardTitle className="text-2xl font-black text-primary">
                Checkout
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Shipping form */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Shipping Details
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Your name"
                        className="h-11 rounded-xl"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="House / Street / Area"
                        className="h-11 rounded-xl"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="pinCode">Pin Code</Label>
                        <Input
                          id="pinCode"
                          name="pinCode"
                          type="tel"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="110001"
                          className="h-11 rounded-xl"
                          value={formData.pinCode}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="phoneNumber">Mobile Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="9876543210"
                          className="h-11 rounded-xl"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Payment Method
                  </h3>
                  <div className="flex justify-center md:justify-start">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className="w-full max-w-[320px] p-6 sm:p-7 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all duration-200 relative border-primary bg-primary/5 shadow-[0_0_30px_rgba(0,0,0,0.15)]"
                    >
                      <span className="text-3xl sm:text-4xl">💳</span>
                      <span className="font-bold text-sm uppercase tracking-wider">Online Payment</span>
                      <span className="text-[11px] text-muted-foreground text-center">
                        Secure payment powered by Razorpay
                      </span>
                    </button>
                  </div>

                  {showPartialOption && (
                    <div className="space-y-3 pt-4 border-t border-border/60">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Choose payment option
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setUsePartialPayment(false)}
                          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all text-xs sm:text-sm ${!usePartialPayment ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/20 hover:bg-muted/30'}`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${!usePartialPayment ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                            {!usePartialPayment && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[11px] sm:text-xs uppercase tracking-[0.15em]">
                              Full Payment
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-primary leading-tight">
                              ₹{orderTotal.toFixed(0)}
                            </span>
                            <span className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                              Pay full amount now
                            </span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUsePartialPayment(true)}
                          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all text-xs sm:text-sm ${usePartialPayment ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/20 hover:bg-muted/30'}`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${usePartialPayment ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                            {usePartialPayment && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[11px] sm:text-xs uppercase tracking-[0.15em]">
                              Partial Payment
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-primary leading-tight">
                              ₹{PARTIAL_PAYMENT_AMOUNT}
                            </span>
                            <span className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                              Pay this now, remaining later
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border bg-muted/40 p-4 space-y-2 text-xs text-muted-foreground">
                    <p className="font-semibold text-[11px] uppercase tracking-[0.2em]">Shipping To</p>
                    <p className="text-sm font-medium leading-relaxed">
                      {formData.fullName && <>{formData.fullName}<br /></>}
                      {formData.address && <>{formData.address}<br /></>}
                      {(formData.pinCode || formData.phoneNumber) && (
                        <>
                          {formData.pinCode && `PIN: ${formData.pinCode}`}{" "}
                          {formData.phoneNumber && <span>• {formData.phoneNumber}</span>}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t mt-4">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="rounded-full px-10 font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-primary/20 scale-105 transition-all"
                >
                  {loading ? "Processing..." : "Place Order & Pay"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-none shadow-xl bg-card rounded-3xl overflow-hidden border border-border/50">
            <CardHeader className="bg-primary/10 dark:bg-primary/20 py-6 border-b border-border/50">
              <CardTitle className="text-lg font-bold text-primary uppercase tracking-widest">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-black">₹<AnimatedNumber value={cartTotal} decimals={2} /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Shipping Fee</span>
                  <span className="font-black text-primary">
                    {shippingLoading ? "..." : selectedShipping
                      ? (shippingFee === 0 ? "FREE" : `₹${Number(shippingFee).toFixed(2)}`)
                      : "—"}
                  </span>
                </div>
                {deliveryEstimate && (
                  <div className="flex justify-between items-center text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 p-3 rounded-xl border border-green-200 dark:border-green-800/50">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider">Est. Delivery</span>
                    </div>
                    <span className="text-xs font-bold">{typeof deliveryEstimate === 'number' ? `${deliveryEstimate} days` : deliveryEstimate}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-black">₹<AnimatedNumber value={cartTotal * 0.1} decimals={2} /></span>
                </div>
              </div>
              <Separator className="opacity-50" />
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    {paymentMethod === 'online' && usePartialPayment ? 'Pay now' : 'Total Amount'}
                  </span>
                  <span className="text-3xl font-black text-primary leading-none">
                    ₹<AnimatedNumber
                      value={paymentMethod === 'online' && usePartialPayment ? PARTIAL_PAYMENT_AMOUNT : orderTotal}
                      decimals={2}
                    />
                  </span>
                  {paymentMethod === 'online' && usePartialPayment && (
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Full order total: ₹<AnimatedNumber value={orderTotal} decimals={2} />
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
