import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load pages
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const StoreProducts = lazy(() => import('../pages/StoreProducts'));
const StoreProductDetail = lazy(() => import('../pages/StoreProductDetail'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const TrackOrder = lazy(() => import('../pages/TrackOrder'));
const OrderHistory = lazy(() => import('../pages/OrderHistory'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const Account = lazy(() => import('../pages/Account'));
const AddAddress = lazy(() => import('../pages/AddAddress'));

// Policy & Info Pages
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('../pages/RefundPolicy'));
const Contact = lazy(() => import('../pages/Contact'));
const About = lazy(() => import('../pages/About'));


// Auth Pages
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const VerifyOTP = lazy(() => import('../pages/VerifyOTP'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const UserRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="store-products" element={<StoreProducts />} />
          <Route path="store-product/:id" element={<StoreProductDetail />} />

          {/* Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-otp" element={<VerifyOTP />} />

          {/* Protected Routes */}
          <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="track-order" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
          <Route path="track-order/:orderId" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="account/address/new" element={<ProtectedRoute><AddAddress /></ProtectedRoute>} />

          {/* Policy & Info Pages */}
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
