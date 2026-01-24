import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../user/context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        // Redirect to admin login but save the current location
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminProtectedRoute;
