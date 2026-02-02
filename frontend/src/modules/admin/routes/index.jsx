import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from '../context/AdminContext';
import AdminLayout from '../layouts/AdminLayout';
import AdminProtectedRoute from '../components/AdminProtectedRoute';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Orders = lazy(() => import('../pages/Orders'));
const Products = lazy(() => import('../pages/Products'));
const Customers = lazy(() => import('../pages/Customers'));
const Payments = lazy(() => import('../pages/Payments'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Settings = lazy(() => import('../pages/Settings'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const AdminLogin = lazy(() => import('../pages/AdminLogin'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen bg-slate-950/20">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
);

const AdminRoutes = () => {
    return (
        <AdminProvider>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* Public Admin Routes */}
                    <Route path="login" element={<AdminLogin />} />

                    {/* Protected Admin Routes */}
                    <Route
                        element={
                            <AdminProtectedRoute>
                                <AdminLayout />
                            </AdminProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="products" element={<Products />} />
                        <Route path="products/:id" element={<ProductDetail />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="payments" element={<Payments />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Redirect unknown routes */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </Suspense>
        </AdminProvider>
    );
};

export default AdminRoutes;

