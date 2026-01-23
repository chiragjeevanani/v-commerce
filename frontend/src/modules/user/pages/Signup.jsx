import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
    Eye,
    EyeOff,
    User,
    Mail,
    Phone,
    Lock,
    ArrowRight,
    Check,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/utils';

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const [passwordStrength, setPasswordStrength] = useState(0);
    const { signup } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Basic password strength logic
        let strength = 0;
        if (formData.password.length > 0) {
            if (formData.password.length >= 6) strength += 1;
            if (/[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
        }
        setPasswordStrength(strength);
    }, [formData.password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Validation Error",
                description: "Passwords do not match!",
                variant: "destructive",
            });
            return;
        }

        if (!formData.agreeTerms) {
            toast({
                title: "Terms & Conditions",
                description: "Please agree to the terms and conditions.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await signup(formData);
            toast({
                title: "Account Created!",
                description: "Verify your phone number with the OTP sent.",
            });
            navigate('/verify-otp');
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthConfig = () => {
        switch (passwordStrength) {
            case 1: return { color: 'bg-red-500', label: 'Weak', width: '33%' };
            case 2: return { color: 'bg-yellow-500', label: 'Medium', width: '66%' };
            case 3: return { color: 'bg-green-500', label: 'Strong', width: '100%' };
            default: return { color: 'bg-muted', label: 'Very Weak', width: '10%' };
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 lg:bg-background p-4 lg:p-0 overflow-y-auto overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[1100px] lg:h-[750px] grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-card border my-8"
            >
                {/* Left Column - Hero (Desktop Only) */}
                <div className="hidden lg:flex relative bg-black flex-col justify-between p-12 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&q=80')] bg-cover bg-center opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-black/90 mix-blend-multiply" />

                    <div className="relative z-10 flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                            <span className="text-primary font-logo text-2xl">V</span>
                        </div>
                        <span className="text-2xl font-logo uppercase tracking-widest">V-Commerce</span>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-primary-foreground">
                            <ShieldCheck className="h-3 w-3" /> 100% Genuine Products
                        </div>
                        <h1 className="text-5xl font-black leading-tight text-pretty">
                            Join the Future <br />
                            <span className="text-white/70 italic text-4xl">of E-Commerce.</span>
                        </h1>
                        <p className="text-lg text-white/60 max-w-sm">
                            Create an account and get personalized recommendations, express checkout, and exclusive deals.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-8 text-xs font-medium text-white/40 uppercase tracking-widest">
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-black text-lg">10k+</span>
                            <span>Active Users</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-black text-lg">50+</span>
                            <span>Categories</span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Signup Form */}
                <div className="flex flex-col justify-center p-8 lg:p-12 overflow-y-auto">
                    <div className="space-y-2 mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-black tracking-tight">Create Account</h2>
                        <p className="text-muted-foreground font-medium">Step into a world of curated shopping.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        className="pl-10 h-11 rounded-xl focus:ring-primary border-muted"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="phone"
                                        placeholder="9876543210"
                                        className="pl-10 h-11 rounded-xl focus:ring-primary border-muted"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    className="pl-10 h-11 rounded-xl focus:ring-primary border-muted"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 h-11 rounded-xl focus:ring-primary border-muted"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {/* Strength Indicator */}
                                <div className="space-y-1 px-1">
                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: getStrengthConfig().width }}
                                            className={cn("h-full transition-all duration-500", getStrengthConfig().color)}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Strength: <span className={cn("italic", getStrengthConfig().color.replace('bg-', 'text-'))}>{getStrengthConfig().label}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative group">
                                    <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        className="pl-10 h-11 rounded-xl focus:ring-primary border-muted"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2 pt-2">
                            <Checkbox
                                id="terms"
                                className="mt-0.5 rounded-md border-muted data-[state=checked]:bg-primary"
                                checked={formData.agreeTerms}
                                onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: !!checked })}
                            />
                            <label htmlFor="terms" className="text-xs font-medium leading-normal text-muted-foreground">
                                I agree to the{' '}
                                <Link to="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 transition-all gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="h-5 w-5" /></>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline">
                            Sign In Instead
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
