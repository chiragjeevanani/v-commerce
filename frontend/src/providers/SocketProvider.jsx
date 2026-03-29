import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { authService } from "../services/auth.service";
import { toast } from "../hooks/use-toast";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        // NOTE for APK: If you use 'localhost' in your build, it will not connect on a physical device.
        const SOCKET_URL = apiBase.split('/api')[0];
        
        console.log("WebSocket: Initializing connecting to", SOCKET_URL);

        const socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"], // Ensure both are allowed for fallback
            reconnection: true,
            reconnectionAttempts: Infinity, // Keep trying on mobile as connection drops are common
            reconnectionDelay: 1000,
            autoConnect: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("WebSocket: Connected! ID:", socket.id);
            setIsConnected(true);
            
            // Join user-specific AND role-specific rooms if logged in
            const user = authService.getCurrentUser();
            if (user && user._id) {
                console.log("WebSocket: Joining user room", user._id);
                socket.emit("join", user._id);
                
                if (user.role) {
                    console.log("WebSocket: Joining role room", user.role);
                    socket.emit("join", user.role);
                }
            }
        });

        socket.on("disconnect", () => {
            console.warn("WebSocket: Disconnected");
            setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.error("WebSocket Connection Error:", err.message);
        });

        socket.on("forceLogout", (data) => {
            console.warn("WebSocket: FORCE LOGOUT RECEIVED", data);
            
            // Clear identity
            authService.logout();
            
            // Show notification
            toast({
                title: "Session Terminated",
                description: data.message || "Your session has been terminated by the administrator.",
                variant: "destructive",
                duration: 5000,
            });

            // Redirect to login page immediately
            // Using window.location.href to ensure full app state reset
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Watch for login/logout to ensure room subscription stays current
    useEffect(() => {
        const interval = setInterval(() => {
            const user = authService.getCurrentUser();
            if (socketRef.current?.connected && user && user._id) {
                socketRef.current.emit("join", user._id);
                if (user.role) socketRef.current.emit("join", user.role);
            }
        }, 5000); // Verify room membership every 5s

        return () => clearInterval(interval);
    }, []);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
