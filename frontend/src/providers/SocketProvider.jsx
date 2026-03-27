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
        const SOCKET_URL = apiBase.split('/api')[0];
        
        console.log("WebSocket: Attempting connection to", SOCKET_URL);

        const socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("WebSocket: Connected! ID:", socket.id);
            setIsConnected(true);
            
            // Join user room if logged in
            const user = authService.getCurrentUser();
            if (user && user._id) {
                console.log("WebSocket: Joining user room", user._id);
                socket.emit("join", user._id);
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
                duration: 10000,
            });

            // Redirect home
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
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
