import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import {
    Phone,
    ArrowRight,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const isSubmittingRef = useRef(false);

    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmittingRef.current) return;
        if (phoneNumber.length !== 10) {
            toast({
                title: "Validation Error",
                description: "Please enter a valid 10-digit mobile number.",
                variant: "destructive",
            });
            return;
        }
        isSubmittingRef.current = true;
        setIsLoading(true);

        try {
            await authService.sendOTPLogin(phoneNumber);
            toast({
                title: "OTP Sent",
                description: "Check your mobile for the verification code.",
            });
            navigate('/verify-otp', { state: { mode: 'login', from }, replace: true });
        } catch (error) {
            toast({
                title: "Failed",
                description: error.message || "Could not send OTP.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-muted/30 lg:bg-background p-4 overflow-hidden">
            {/* Background Decorative Elements - Subtle */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />

            <div className="z-10 w-full max-w-[1000px] flex flex-col gap-4">
                {/* Back Button Container */}
                <div className="flex justify-start px-2">
                    <Button
                        variant="ghost"
                        className="hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-300 rounded-full px-4 group"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-bold tracking-tight">Back to Home</span>
                    </Button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full min-h-[600px] grid lg:grid-cols-2 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card border border-border/50 backdrop-blur-sm"
                >
                    {/* Left Column - Hero/Branding */}
                    <div className="hidden lg:flex relative bg-primary flex-col justify-between p-12 text-primary-foreground overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />

                        {/* Decorative Patterns */}
                        <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid)" />
                        </svg>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10">
                                <span className="text-primary font-logo text-2xl">V</span>
                            </div>
                            <span className="text-xl font-logo uppercase tracking-widest font-black">V-Commerce</span>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <h1 className="text-5xl xl:text-6xl font-black leading-tight tracking-tighter">
                                Step into <br />
                                <span className="text-white/60 italic">Luxury Workspace.</span>
                            </h1>
                            <p className="text-lg text-primary-foreground/70 max-w-sm font-medium leading-relaxed">
                                Experience a new standard of dropshipping where quality meets convenience.
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-white" />
                                <span>Premium Quality</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-white" />
                                <span>Global Shipping</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Login Form */}
                    <div className="flex flex-col justify-center p-8 lg:p-14 bg-card">
                        <div className="space-y-3 mb-10">
                            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                                Welcome Back
                            </h2>
                            <p className="text-muted-foreground text-base font-medium">
                                Please enter your details to sign in
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Mobile Number</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="9876543210"
                                        className="pl-12 h-14 rounded-2xl bg-muted/50 border-muted focus:bg-background transition-all"
                                        required
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        maxLength={10}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground ml-1">OTP will be sent to this number for verification</p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/95 text-white transition-all shadow-xl shadow-primary/20 group relative overflow-hidden mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Send OTP</span>
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-4 border-t border-muted/50 space-y-2">
                            <p className="text-center text-sm font-medium text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-primary font-black hover:underline transition-all underline-offset-4 tracking-tight">
                                    Create Account
                                </Link>
                            </p>
                          
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
