import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../../user/context/AuthContext";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const { user, logout: authLogout } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: "New Order", message: "Order #ORD-98765 received", time: "5m ago", read: false },
        { id: 2, title: "Stock Alert", message: "Minimalist Desk Lamp is low on stock", time: "1h ago", read: false },
    ]);

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    const logout = () => {
        authLogout();
    };

    const markNotificationRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <AdminContext.Provider
            value={{
                adminUser: user,
                sidebarCollapsed,
                notifications,
                toggleSidebar,
                logout,
                markNotificationRead
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};

