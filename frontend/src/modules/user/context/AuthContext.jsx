import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../../../services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = () => {
        const storedUser = authService.getCurrentUser();
        const token = authService.getToken();
        if (storedUser && token) {
            setUser(storedUser);
        }
    };

    useEffect(() => {
        const verifySession = async () => {
            const storedUser = authService.getCurrentUser();
            const token = authService.getToken();
            
            if (storedUser && token) {
                try {
                    // Call backend to verify token is still valid (checks tokenVersion)
                    const result = await authService.userProfile();
                    if (result.success) {
                        setUser(result.data);
                        setIsAuthenticated(true);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error("Session verification failed:", error);
                    // If error is 401 or invalid token, logout
                    if (error.message.includes("401") || error.message.includes("Session expired")) {
                        logout();
                    }
                }
            }
            setIsLoading(false);
        };

        verifySession();
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

    const adminLogin = async (email, password) => {
        try {
            const response = await authService.adminLogin(email, password);
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
            if (response.user) {
                setUser(response.user);
                setIsAuthenticated(true);
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const loginWithOTP = async (phoneNumber, otp) => {
        try {
            const response = await authService.verifyOTPLogin(phoneNumber, otp);
            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const verifySignupWithOTP = async (phoneNumber, otp) => {
        try {
            const response = await authService.verifySignupOTP(phoneNumber, otp);
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
                adminLogin,
                signup,
                loginWithOTP,
                verifySignupWithOTP,
                refreshUser,
                logout,
                deleteAccount: async () => {
                    await authService.deleteAccount();
                    logout();
                }
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
