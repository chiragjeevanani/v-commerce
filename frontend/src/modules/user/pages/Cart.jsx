import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/modules/user/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AnimatedNumber from "@/modules/user/components/AnimatedNumber";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container py-16 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-muted p-6 rounded-full">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button onClick={() => navigate("/shop")}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4 flex gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border rounded-md h-8">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-bold text-primary">
                          ₹<AnimatedNumber value={(item.discountPrice || item.price) * item.quantity} decimals={2} />
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹<AnimatedNumber value={cartTotal} decimals={2} /></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium">₹<AnimatedNumber value={cartTotal * 0.1} decimals={2} /></span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-black text-xl text-primary">
                <span>Total</span>
                <span>₹<AnimatedNumber value={cartTotal * 1.1} decimals={2} /></span>
              </div>

              <Button className="w-full" size="lg" onClick={() => navigate("/checkout")}>
                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
