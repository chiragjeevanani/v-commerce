import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../../../services/auth.service';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);

    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { loginWithOTP, verifySignupWithOTP } = useAuth();

    const mode = location.state?.mode || 'login';
    const from = location.state?.from || '/';
    const pendingPhone = localStorage.getItem('pending_phone') || '';

    useEffect(() => {
        if (!pendingPhone) {
            navigate(mode === 'signup' ? '/signup' : '/', { replace: true });
        }
    }, [pendingPhone, mode, navigate]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(timer - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const maskPhone = (p) => (p ? `******${p.slice(-4)}` : '');

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').substring(0, 6).split('');
        const newOtp = [...otp];
        data.forEach((char, i) => {
            if (!isNaN(char)) newOtp[i] = char;
        });
        setOtp(newOtp);
        if (data.length > 0) inputRefs.current[Math.min(data.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length < 6) {
            toast({ title: "Incomplete", description: "Enter all 6 digits.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            if (mode === 'login') {
                await loginWithOTP(pendingPhone, otpString);
            } else {
                await verifySignupWithOTP(pendingPhone, otpString);
            }
            toast({ title: "Success", description: mode === 'login' ? "Welcome back!" : "Account verified!" });
            navigate('/', { replace: true });
        } catch (error) {
            toast({ title: "Failed", description: error.message || "Invalid or expired OTP.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!pendingPhone) return;
        try {
            if (mode === 'signup') {
                await authService.resendSignupOTP(pendingPhone);
            } else {
                await authService.sendOTPLogin(pendingPhone);
            }
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            toast({ title: "OTP Resent", description: "New code sent to your mobile." });
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    if (!pendingPhone) return null;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Top bar - mobile-friendly, safe area for notch */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 -ml-1 h-10 w-10 rounded-full"
                    onClick={() => navigate(mode === 'signup' ? '/signup' : '/')}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <span className="text-lg font-bold">Verify OTP</span>
                <div className="w-10" />
            </div>

            {/* Content - from top on mobile */}
            <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-8 overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="text-center space-y-3 mb-8">
                        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                            <ShieldCheck className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold">Verify Your Mobile</h1>
                        <p className="text-sm text-muted-foreground">
                            OTP sent to <span className="font-semibold text-foreground">{maskPhone(pendingPhone)}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-between gap-1 sm:gap-2 max-w-sm mx-auto">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="h-12 sm:h-14 w-9 sm:w-11 text-center text-xl sm:text-2xl font-bold rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                />
                            ))}
                        </div>

                        <Button type="submit" className="w-full h-12 rounded-xl font-semibold" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify & Continue <ArrowRight className="h-4 w-4 ml-1" /></>}
                        </Button>

                        <div className="flex items-center justify-between px-2">
                            <button
                                type="button"
                                onClick={() => navigate(mode === 'signup' ? '/signup' : '/')}
                                className="text-sm font-medium text-muted-foreground hover:text-primary"
                            >
                                Change Number
                            </button>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={timer > 0}
                                className="text-sm font-medium text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
                            >
                                {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Never share your OTP. V-Commerce will never call asking for your code.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
