import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authService } from '../../../services/auth.service';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(timer - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
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
        if (data.length > 0) {
            inputRefs.current[Math.min(data.length, 5)].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length < 6) {
            toast({
                title: "Incomplete Code",
                description: "Please enter all 6 digits.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOTP(otpString);
            toast({
                title: "Verification Successful",
                description: "Your account is now fully active!",
            });
            navigate('/');
        } catch (error) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid OTP code. Try 123456",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        const email = localStorage.getItem("pending_email");
        if (!email) {
            toast({
                title: "Error",
                description: "Email not found. Please signup again.",
                variant: "destructive",
            });
            return;
        }

        try {
            await authService.resendOTP(email);
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
            toast({
                title: "OTP Resent",
                description: "A new verification code has been sent to your email.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to resend OTP.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md mb-4 flex justify-start">
                <Button
                    variant="ghost"
                    className="hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all rounded-full px-4 group"
                    onClick={() => navigate("/signup")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Signup
                </Button>
            </div>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-2xl space-y-8"
            >
                <div className="text-center space-y-2">
                    <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Verify Your Account</h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        We've sent a 6-digit verification code to <br />
                        <span className="font-bold text-foreground">
                            {localStorage.getItem("pending_email") || "your email address"}
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2 max-w-sm mx-auto">
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
                                className="w-full h-14 text-center text-2xl font-black rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                            />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 transition-all gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Verify & Continue <ArrowRight className="h-5 w-5" /></>
                            )}
                        </Button>

                        <div className="flex items-center justify-between px-2">
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-3 w-3" /> Change Details
                            </button>

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={timer > 0}
                                className="flex items-center gap-1 text-xs font-bold text-primary disabled:text-muted-foreground hover:underline transition-all"
                            >
                                <RefreshCw className={`h-3 w-3 ${timer > 0 ? '' : 'animate-spin-once'}`} />
                                {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code Now'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="p-4 bg-muted/50 rounded-2xl text-center space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Security Tip</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Never share your OTP with anyone. V-Commerce will never call you asking for your verification code.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;
