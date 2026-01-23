import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    Chrome,
    Apple,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            toast({
                title: "Login Successful",
                description: "Welcome back to V-Commerce!",
            });
            navigate(from, { replace: true });
        } catch (error) {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid credentials. Try test@vcommerce.com / password123",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 lg:bg-background p-4 lg:p-0 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[1000px] lg:h-[600px] grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-card border"
            >
                {/* Left Column - Hero/Branding (Desktop Only) */}
                <div className="hidden lg:flex relative bg-primary flex-col justify-between p-12 text-primary-foreground overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-black/20" />

                    {/* Decorative Elements */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-black/20 blur-3xl" />

                    <div className="relative z-10 flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                            <span className="text-primary font-logo text-2xl">V</span>
                        </div>
                        <span className="text-2xl font-logo uppercase tracking-widest">V-Commerce</span>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <h1 className="text-5xl font-black leading-tight text-pretty">
                            Smart Shopping <br />
                            <span className="text-white/70 italic">Starts Here.</span>
                        </h1>
                        <p className="text-lg text-primary-foreground/80 max-w-sm">
                            Discover a curated collection of lifestyle essentials and electronics with global shipping.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-4 text-xs font-medium text-primary-foreground/60 uppercase tracking-tighter">
                        <span>Verified Dropshipping</span>
                        <div className="h-1 w-1 rounded-full bg-white/40" />
                        <span>Secure Checkout</span>
                    </div>
                </div>

                {/* Right Column - Login Form */}
                <div className="flex flex-col justify-center p-8 lg:p-12">
                    <div className="space-y-2 mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-black tracking-tight">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in to your account to continue shopping.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email or Phone</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="email"
                                    type="text"
                                    placeholder="name@example.com"
                                    className="pl-10 h-12 rounded-xl focus:ring-primary transition-all border-muted"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="pl-10 h-12 rounded-xl focus:ring-primary transition-all border-muted"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" className="rounded-md h-5 w-5 border-muted" />
                            <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Remember me for 30 days
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 transition-all text-base gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="h-5 w-5" /></>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground font-medium italic">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-12 rounded-xl gap-2 hover:bg-muted/50 border-muted">
                            <Chrome className="h-5 w-5 text-red-500" /> Google
                        </Button>
                        <Button variant="outline" className="h-12 rounded-xl gap-2 hover:bg-muted/50 border-muted">
                            <Apple className="h-5 w-5" /> Apple
                        </Button>
                    </div>

                    <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary font-bold hover:underline">
                            Create one for free
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
