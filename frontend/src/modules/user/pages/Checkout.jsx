import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {Plus} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, MapPin, Truck } from "lucide-react";
import { useCart } from "@/modules/user/context/CartContext";
import { api } from "@/services/api";
import { addressService } from "@/services/address.service";
import { useAuth } from "@/modules/user/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AnimatedNumber from "@/modules/user/components/AnimatedNumber";

const steps = [
  { id: 1, name: "Shipping", icon: MapPin },
  { id: 2, name: "Payment", icon: CreditCard },
  { id: 3, name: "Review", icon: Check },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const isOrderPlaced = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.fullName?.split(' ')[0] || "",
    lastName: user?.fullName?.split(' ')[1] || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  useEffect(() => {
    if (cart.length === 0 && !isOrderPlaced.current) {
      navigate("/cart");
    }

    const fetchAddresses = async () => {
      try {
        const data = await addressService.getAddresses();
        setAddresses(data);
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (error) {
        console.error("Failed to load addresses", error);
      }
    };
    fetchAddresses();
  }, [cart, navigate]);

  if (cart.length === 0) {
    return null;
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      let shippingAddress = null;

      if (showNewAddressForm) {
        // Validation
        if (!formData.address || !formData.city || !formData.zip) {
          toast({ title: "Error", description: "Please fill all shipping details", variant: "destructive" });
          setLoading(false);
          return;
        }

        // Save new address to backend
        const addrResponse = await addressService.addAddress({
          fullName: `${formData.firstName} ${formData.lastName}`,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zip,
          phoneNumber: formData.phoneNumber,
          isDefault: addresses.length === 0
        });

        // Find the newly created address ID or use the last one in the returned data
        const newAddresses = addrResponse.data;
        shippingAddress = newAddresses[newAddresses.length - 1];
      } else {
        shippingAddress = addresses.find(a => a._id === selectedAddressId);
      }

      if (!shippingAddress) {
        toast({ title: "Error", description: "Please select a shipping address", variant: "destructive" });
        setLoading(false);
        return;
      }

      const res = await api.placeOrder({
        items: cart,
        total: cartTotal,
        shipping: shippingAddress,
        paymentMethod: paymentMethod,
      });

      isOrderPlaced.current = true;
      clearCart();
      navigate("/order-success", {
        state: {
          orderId: res.orderId,
          total: cartTotal * 1.1,
          paymentMethod: paymentMethod === 'card' ? `Card ending in ${formData.cardNumber.slice(-4) || '****'}` : paymentMethod.toUpperCase(),
          orderData: res.orderData
        }
      });
    } catch (error) {
      console.error("Order failed", error);
      toast({ title: "Order Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl min-h-screen">
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -translate-y-1/2 -z-10" />
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center bg-background px-4">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive || isCompleted ? "hsl(var(--primary))" : "hsl(var(--background))",
                    borderColor: isActive || isCompleted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    color: isActive || isCompleted ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                    scale: isActive ? 1.2 : 1
                  }}
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 shadow-lg"
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
                <span
                  className={`mt-3 text-xs md:text-sm font-bold uppercase tracking-widest ${isActive || isCompleted ? "text-primary" : "text-muted-foreground opacity-50"
                    }`}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-2xl bg-card rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-6">
              <CardTitle className="text-2xl font-black text-primary">
                {currentStep === 1 && "Shipping Details"}
                {currentStep === 2 && "Payment Method"}
                {currentStep === 3 && "Review Order"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {/* Address Selection */}
                    {!showNewAddressForm && addresses.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Select Shipping Address</h3>
                        <div className="grid gap-4">
                          {addresses.map((addr) => (
                            <button
                              key={addr._id}
                              onClick={() => setSelectedAddressId(addr._id)}
                              className={`flex items-start gap-4 p-5 rounded-3xl border-2 text-left transition-all ${selectedAddressId === addr._id ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:border-primary/20'}`}
                            >
                              <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr._id ? 'border-primary' : 'border-muted-foreground/30'}`}>
                                {selectedAddressId === addr._id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-black text-sm">{addr.fullName}</span>
                                  <Badge variant="outline" className="text-[9px] py-0">{addr.addressType}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-tight">
                                  {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full rounded-2xl border-dashed h-14 font-bold" onClick={() => setShowNewAddressForm(true)}>
                          <Plus className="h-4 w-4 mr-2" /> Add New Address
                        </Button>
                      </div>
                    )}

                    {(showNewAddressForm || addresses.length === 0) && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">New Shipping Address</h3>
                          {addresses.length > 0 && (
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase" onClick={() => setShowNewAddressForm(false)}>Use Saved Address</Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="font-bold uppercase text-[10px] tracking-widest opacity-70">First Name</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                              placeholder="John"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="font-bold uppercase text-[10px] tracking-widest opacity-70">Last Name</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="font-bold uppercase text-[10px] tracking-widest opacity-70">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                            placeholder="+91 98765-43210"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address" className="font-bold uppercase text-[10px] tracking-widest opacity-70">Street Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                            placeholder="123 Main St"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="font-bold uppercase text-[10px] tracking-widest opacity-70">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                              placeholder="Mumbai"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip" className="font-bold uppercase text-[10px] tracking-widest opacity-70">ZIP Code</Label>
                            <Input
                              id="zip"
                              name="zip"
                              value={formData.zip}
                              onChange={handleInputChange}
                              className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                              placeholder="400001"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: "upi", name: "UPI", icon: "📱" },
                        { id: "card", name: "Card", icon: "💳" },
                        { id: "cod", name: "Cash on Delivery", icon: "💵" },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${paymentMethod === method.id
                            ? "border-primary bg-primary/5 shadow-inner scale-105"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <span className="text-3xl">{method.icon}</span>
                          <span className="font-black text-xs uppercase tracking-widest">{method.name}</span>
                          {paymentMethod === method.id && (
                            <motion.div layoutId="active" className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-dashed">
                      <AnimatePresence mode="wait">
                        {paymentMethod === "card" && (
                          <motion.div
                            key="card-info"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber" className="font-bold uppercase text-[10px] tracking-widest opacity-70">Card Number</Label>
                              <Input
                                id="cardNumber"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                                placeholder="0000 0000 0000 0000"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry" className="font-bold uppercase text-[10px] tracking-widest opacity-70">Expiry Date</Label>
                                <Input
                                  id="expiry"
                                  name="expiry"
                                  value={formData.expiry}
                                  onChange={handleInputChange}
                                  className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                                  placeholder="MM/YY"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cvc" className="font-bold uppercase text-[10px] tracking-widest opacity-70">CVC</Label>
                                <Input
                                  id="cvc"
                                  name="cvc"
                                  value={formData.cvc}
                                  onChange={handleInputChange}
                                  className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                                  placeholder="123"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {paymentMethod === "upi" && (
                          <motion.div
                            key="upi-info"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-8 rounded-[40px] bg-primary/5 flex flex-col items-center text-center space-y-4"
                          >
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl">📱</div>
                            <div className="space-y-2">
                              <h4 className="font-black text-xl">Pay via Any UPI App</h4>
                              <p className="text-sm text-muted-foreground">Scan the QR code or enter your VPA on the review page to complete the payment.</p>
                            </div>
                          </motion.div>
                        )}

                        {paymentMethod === "cod" && (
                          <motion.div
                            key="cod-info"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-8 rounded-[40px] bg-secondary/20 flex flex-col items-center text-center space-y-4"
                          >
                            <div className="h-20 w-20 rounded-full bg-secondary/30 flex items-center justify-center text-3xl">💵</div>
                            <div className="space-y-2">
                              <h4 className="font-black text-xl">Confirm Delivery Address</h4>
                              <p className="text-sm text-muted-foreground">You will pay the amount to the delivery associate when your package arrives. Small COD fee might apply.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border bg-muted/30 p-6 space-y-3">
                        <h4 className="font-black uppercase text-xs tracking-widest text-primary">Shipping To:</h4>
                        <p className="text-sm font-medium leading-relaxed">
                          {showNewAddressForm ? (
                            <>
                              {formData.firstName} {formData.lastName}<br />
                              {formData.address}<br />
                              {formData.city}, {formData.zip}
                            </>
                          ) : (
                            <>
                              {addresses.find(a => a._id === selectedAddressId)?.fullName}<br />
                              {addresses.find(a => a._id === selectedAddressId)?.street}<br />
                              {addresses.find(a => a._id === selectedAddressId)?.city}, {addresses.find(a => a._id === selectedAddressId)?.zipCode}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="rounded-2xl border bg-muted/30 p-6 space-y-3">
                        <h4 className="font-black uppercase text-xs tracking-widest text-primary">Payment Via:</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {paymentMethod === "upi" && "📱"}
                            {paymentMethod === "card" && "💳"}
                            {paymentMethod === "cod" && "💵"}
                          </span>
                          <p className="text-sm font-black uppercase tracking-widest">
                            {paymentMethod === "upi" && "UPI / Net Banking"}
                            {paymentMethod === "card" && `Card ending in ${formData.cardNumber.slice(-4) || "****"}`}
                            {paymentMethod === "cod" && "Cash on Delivery"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black uppercase text-xs tracking-widest text-primary">Items in Order:</h4>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-xl">
                            <span className="font-medium">
                              <span className="text-primary font-black mr-2">{item.quantity}x</span> {item.name}
                            </span>
                            <span className="font-black">
                              ₹<AnimatedNumber value={(item.discountPrice || item.price) * item.quantity} decimals={2} />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-10 border-t mt-10">
                {currentStep > 1 ? (
                  <Button variant="ghost" onClick={prevStep} className="rounded-full px-8 hover:bg-muted font-bold uppercase tracking-widest text-xs">
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <Button onClick={nextStep} className="rounded-full px-12 font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-primary/20 scale-105 transition-all">
                    Next Step
                  </Button>
                ) : (
                  <Button onClick={handlePlaceOrder} disabled={loading} className="rounded-full px-12 font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-primary/20 scale-105 transition-all">
                    {loading ? "Processing..." : "Place Order"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-none shadow-xl bg-card rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary py-6">
              <CardTitle className="text-xl font-black text-primary-foreground uppercase tracking-widest">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-black">₹<AnimatedNumber value={cartTotal} decimals={2} /></span>
                </div>
                <div className="flex justify-between items-center text-primary">
                  <span className="text-muted-foreground font-medium">Shipping</span>
                  <span className="font-black">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-black">₹<AnimatedNumber value={cartTotal * 0.1} decimals={2} /></span>
                </div>
              </div>
              <Separator className="opacity-50" />
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Amount</span>
                  <span className="text-3xl font-black text-primary leading-none">
                    ₹<AnimatedNumber value={cartTotal * 1.1} decimals={2} />
                  </span>
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
