import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/modules/user/components/ThemeProvider";
import { AuthProvider } from "@/modules/user/context/AuthContext";
import { CartProvider } from "@/modules/user/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
import UserRoutes from './modules/user/routes';
import AdminRoutes from './modules/admin/routes';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="/*" element={<UserRoutes />} />
            </Routes>
          </Router>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

