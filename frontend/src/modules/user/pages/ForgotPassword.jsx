import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            toast({
                title: "OTP Sent",
                description: `Verification code sent to ${email}`,
            });
            setStep(2);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await authService.verifyForgotOTP(email, otp);
            setResetToken(res.data.resetToken);
            toast({
                title: "Verified",
                description: "OTP verified. Now set your new password.",
            });
            setStep(3);
        } catch (error) {
            toast({
                title: "Verification Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
        }
        setIsLoading(true);
        try {
            await authService.resetPassword(email, resetToken, newPassword);
            toast({
                title: "Success",
                description: "Password reset successful. Please login.",
            });
            navigate('/login');
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 font-inter">
            <div className="w-full max-w-md mb-4 flex justify-start">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Login
                </Link>
            </div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card border rounded-[40px] overflow-hidden shadow-2xl relative"
            >
                <div className="p-10">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-3 text-center">
                                    <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Mail className="h-10 w-10 text-primary" />
                                    </div>
                                    <h1 className="text-4xl font-black tracking-tighter">Forgot Password?</h1>
                                    <p className="text-muted-foreground font-medium">Enter your email to receive a 6-digit verification code.</p>
                                </div>

                                <form onSubmit={handleSendOTP} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest ml-1">Email Address</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                className="pl-12 h-14 rounded-2xl focus:ring-primary border-muted text-lg font-medium"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group relative overflow-hidden"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Send Verification OTP</span>
                                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        )}
                                    </Button>
                                </form>

                                <div className="text-center pt-4 border-t border-muted/50">
                                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest group">
                                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Sign In
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-3 text-center">
                                    <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck className="h-10 w-10 text-primary" />
                                    </div>
                                    <h1 className="text-4xl font-black tracking-tighter">Verify OTP</h1>
                                    <p className="text-muted-foreground font-medium">We've sent a code to <span className="text-foreground font-bold">{email}</span></p>
                                </div>

                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp" className="font-black text-xs uppercase tracking-widest ml-1">6-Digit Code</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            maxLength={6}
                                            placeholder="0 0 0 0 0 0"
                                            className="h-16 rounded-2xl border-muted text-center text-3xl font-black tracking-[0.5em] focus:ring-primary"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group relative overflow-hidden"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Verify & Continue</span>
                                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        )}
                                    </Button>
                                </form>

                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full text-sm font-black text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                                >
                                    Resend Code
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-3 text-center">
                                    <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <KeyRound className="h-10 w-10 text-primary" />
                                    </div>
                                    <h1 className="text-4xl font-black tracking-tighter">New Password</h1>
                                    <p className="text-muted-foreground font-medium">Setup a strong password for your account.</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pass" className="font-black text-xs uppercase tracking-widest ml-1">New Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="pass"
                                                type="password"
                                                className="pl-12 h-14 rounded-2xl border-muted"
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm" className="font-black text-xs uppercase tracking-widest ml-1">Confirm Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="confirm"
                                                type="password"
                                                className="pl-12 h-14 rounded-2xl border-muted"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group relative overflow-hidden mt-4"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Secure Account</span>
                                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;

