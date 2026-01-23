import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const { sidebarCollapsed } = useAdmin();
    const location = useLocation();

    React.useEffect(() => {
        const path = location.pathname.split('/').pop() || 'Dashboard';
        const title = path.charAt(0).toUpperCase() + path.slice(1);
        document.title = `${title} | Admin Panel | V-Commerce`;
    }, [location]);

    return (
        <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                <Header />

                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
