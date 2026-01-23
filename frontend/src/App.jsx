import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/modules/user/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import UserRoutes from './modules/user/routes';
import AdminRoutes from './modules/admin/routes';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<UserRoutes />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
