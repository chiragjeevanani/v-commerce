import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../../../services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const storedUser = authService.getCurrentUser();
            const token = authService.getToken();
            if (storedUser && token) {
                setUser(storedUser);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const signup = async (userData) => {
        try {
            const response = await authService.signup(userData);
            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                signup,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
