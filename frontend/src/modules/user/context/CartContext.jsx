import React, { createContext, useContext, useState, useEffect } from "react";
import { cartService } from "../../../services/cart.service";
import { authService } from "../../../services/auth.service";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync authentication state from token
  useEffect(() => {
    const checkToken = () => {
      setIsAuthenticated(!!authService.getToken());
    };
    checkToken();

    // Simple way to listen to storage changes for token (optional enhancement)
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  // Sync auth state if login/logout happens in the app
  useEffect(() => {
    setIsAuthenticated(!!authService.getToken());
  }, [authService.getCurrentUser()]);

  // Load cart on mount or when auth status changes
  useEffect(() => {
    const initCart = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          // 1. Check if we have guest items in local storage to sync
          const localCart = localStorage.getItem("cart");
          if (localCart) {
            const items = JSON.parse(localCart);
            if (items.length > 0) {
              const syncedCart = await cartService.syncCart(items);
              setCart(syncedCart.items);
              localStorage.removeItem("cart"); // Clear guest items after sync
              setLoading(false);
              return;
            }
          }

          // 2. Otherwise just fetch from backend
          const remoteCart = await cartService.getCart();
          setCart(remoteCart.items);
        } else {
          // 3. Guest user: load from local storage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }
        }
      } catch (error) {
        console.error("Cart init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initCart();
  }, [isAuthenticated]);

  // Save guest cart to local storage whenever it changes
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (product) => {
    // Standardize input for CJ and local data
    const cartItem = {
      pid: product.pid || product.id,
      name: product.productNameEn || product.name,
      image: product.productImage || product.image,
      price: product.discountPrice || product.price,
      quantity: product.quantity || 1,
      category: product.categoryName || product.category,
      sku: product.productSku || product.sku
    };

    if (isAuthenticated) {
      try {
        const updatedCart = await cartService.addToCart(cartItem);
        setCart(updatedCart.items);
      } catch (error) {
        console.error("Add to cart error:", error);
      }
    } else {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.pid === cartItem.pid);
        if (existingItem) {
          return prevCart.map((item) =>
            item.pid === cartItem.pid
              ? { ...item, quantity: item.quantity + cartItem.quantity }
              : item
          );
        }
        return [...prevCart, cartItem];
      });
    }
  };

  const removeFromCart = async (pid) => {
    if (isAuthenticated) {
      try {
        const updatedCart = await cartService.removeFromCart(pid);
        setCart(updatedCart.items);
      } catch (error) {
        console.error("Remove from cart error:", error);
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.pid !== pid));
    }
  };

  const updateQuantity = async (pid, quantity) => {
    if (quantity < 1) return;

    if (isAuthenticated) {
      try {
        const updatedCart = await cartService.updateQuantity(pid, quantity);
        setCart(updatedCart.items);
      } catch (error) {
        console.error("Update quantity error:", error);
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.pid === pid ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
        setCart([]);
      } catch (error) {
        console.error("Clear cart error:", error);
      }
    } else {
      setCart([]);
    }
  };

  // Safe parsing for decimals
  const cartTotal = cart.reduce(
    (total, item) => total + (parseFloat(item.price || 0)) * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
