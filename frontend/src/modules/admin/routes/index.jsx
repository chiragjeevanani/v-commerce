import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from '../context/AdminContext';
import AdminLayout from '../layouts/AdminLayout';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Orders = lazy(() => import('../pages/Orders'));
const Products = lazy(() => import('../pages/Products'));
const Customers = lazy(() => import('../pages/Customers'));
const Payments = lazy(() => import('../pages/Payments'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Settings = lazy(() => import('../pages/Settings'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
);

const AdminRoutes = () => {
    return (
        <AdminProvider>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="products" element={<Products />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="payments" element={<Payments />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Route>
                </Routes>
            </Suspense>
        </AdminProvider>
    );
};

export default AdminRoutes;
