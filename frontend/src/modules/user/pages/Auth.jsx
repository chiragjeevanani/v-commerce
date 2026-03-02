import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { Phone, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Auth = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const isSubmittingRef = useRef(false);

    const { signup } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const isSignup = location.pathname === '/signup';

    React.useEffect(() => {
        setActiveTab(isSignup ? 'signup' : 'login');
    }, [isSignup]);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(value);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isSubmittingRef.current) return;
        if (phoneNumber.length !== 10) {
            toast({ title: "Error", description: "Enter valid 10-digit mobile number.", variant: "destructive" });
            return;
        }
        isSubmittingRef.current = true;
        setIsLoading(true);
        try {
            await authService.sendOTPLogin(phoneNumber);
            toast({ title: "OTP Sent", description: "Check your mobile for the code." });
            navigate('/verify-otp', { state: { mode: 'login', from }, replace: true });
        } catch (error) {
            toast({ title: "Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (phoneNumber.length !== 10) {
            toast({ title: "Error", description: "Enter valid 10-digit mobile number.", variant: "destructive" });
            return;
        }
        if (!agreeTerms) {
            toast({ title: "Terms", description: "Please agree to terms and privacy policy.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const result = await signup({ phoneNumber });
            if (result?.pending_phone) {
                toast({ title: "OTP Sent", description: "Check your mobile for the code." });
                navigate('/verify-otp', { state: { mode: 'signup' }, replace: true });
            } else if (result?.user) {
                toast({ title: "Welcome!", description: "Account created." });
                navigate('/');
            }
        } catch (error) {
            toast({ title: "Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Top bar - Flipkart style: Back + Logo (mobile-friendly) */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 -ml-1 h-10 w-10 rounded-full"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-xl font-logo font-black tracking-tight">V-Commerce</span>
                </Link>
                <div className="w-10" />
            </div>

            {/* Content - starts from top on mobile */}
            <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-8 sm:pt-8 sm:pb-12">
                <div className="w-full max-w-[400px]">
                    <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">
                        {activeTab === 'login' ? 'Login' : 'Sign Up'}
                    </h1>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-12 mb-6 rounded-xl bg-muted p-1">
                            <TabsTrigger value="login" className="rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Login
                            </TabsTrigger>
                            <TabsTrigger value="signup" className="rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Sign Up
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="mt-0">
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="phone-login">Enter Mobile Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone-login"
                                            type="tel"
                                            inputMode="numeric"
                                            placeholder="10-digit mobile number"
                                            className="pl-10 h-12 rounded-xl"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-12 rounded-xl font-semibold" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Request OTP'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup" className="mt-0">
                            <form onSubmit={handleSignup} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="phone-signup">Enter Mobile Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone-signup"
                                            type="tel"
                                            inputMode="numeric"
                                            placeholder="10-digit mobile number"
                                            className="pl-10 h-12 rounded-xl"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="terms"
                                        className="mt-0.5 rounded"
                                        checked={agreeTerms}
                                        onCheckedChange={(c) => setAgreeTerms(!!c)}
                                    />
                                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                                        By continuing, you agree to our{' '}
                                        <Link to="/terms" className="text-primary font-medium underline">Terms of Use</Link> &{' '}
                                        <Link to="/privacy" className="text-primary font-medium underline">Privacy Policy</Link>
                                    </label>
                                </div>
                                <Button type="submit" className="w-full h-12 rounded-xl font-semibold" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Request OTP'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                   
                </div>
            </div>
        </div>
    );
};

export default Auth;
