import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulating API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card border rounded-3xl overflow-hidden shadow-2xl relative"
            >
                {/* Progress Bar (at top) */}
                {isLoading && (
                    <motion.div
                        className="absolute top-0 left-0 h-1 bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5 }}
                    />
                )}

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {!isSent ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2 text-center">
                                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Mail className="h-8 w-8 text-primary" />
                                    </div>
                                    <h1 className="text-3xl font-black tracking-tight">Forgot Password?</h1>
                                    <p className="text-muted-foreground font-medium italic"> No worries! Enter your email and we'll send you a link to reset your password.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-bold">Email Address</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                className="pl-10 h-12 rounded-xl focus:ring-primary border-muted"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 transition-all gap-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>Send Reset Link <Send className="h-4 w-4" /></>
                                        )}
                                    </Button>
                                </form>

                                <div className="text-center">
                                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                                        <ArrowLeft className="h-4 w-4" /> Back to Sign In
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 text-center py-4"
                            >
                                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black tracking-tight">Check Your Inbox</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        We've sent a password reset link to <br />
                                        <span className="font-bold text-foreground">{email}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-2xl text-xs text-muted-foreground border border-dashed text-balance">
                                    Didn't receive the email? Check your spam folder or try another address.
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl border-2 font-bold hover:bg-muted/50"
                                    onClick={() => setIsSent(false)}
                                >
                                    Try Again
                                </Button>
                                <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline">
                                    <ArrowLeft className="h-4 w-4" /> Return to Login
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
