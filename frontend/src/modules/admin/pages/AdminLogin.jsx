import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../user/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
    Loader2,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: 'admin@gmail.com', password: '123' });

    const { adminLogin } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const from = "/admin";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await adminLogin(formData.email, formData.password);
            toast({
                title: "Admin Access Granted",
                description: "Welcome to the V-Commerce Control Center.",
            });
            navigate(from, { replace: true });
        } catch (error) {
            toast({
                title: "Authentication Failed",
                description: error.message || "Invalid admin credentials.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-primary/5 rounded-full blur-[80px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[450px] z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3 bg-card/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-border shadow-2xl">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShieldCheck className="text-primary-foreground h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-logo text-foreground tracking-widest leading-none">V-COMMERCE</span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Admin Central</span>
                        </div>
                    </div>
                </div>

                <Card className="bg-card/50 backdrop-blur-xl border-border shadow-2xl overflow-hidden rounded-3xl">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/50 to-primary" />
                    <CardContent className="p-8 lg:p-10">
                        <div className="space-y-2 mb-8">
                            <h2 className="text-2xl font-black tracking-tight text-foreground">System Login</h2>
                            <p className="text-muted-foreground text-sm">Enter authorized credentials to access management modules.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground text-xs font-bold uppercase tracking-wider">Admin ID / Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@vcommerce.com"
                                        className="bg-background/50 border-input text-foreground pl-10 h-12 rounded-xl focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-foreground text-xs font-bold uppercase tracking-wider">Security Key</Label>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="bg-background/50 border-input text-foreground pl-10 h-12 rounded-xl focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <p className="text-[11px] text-primary/70 leading-relaxed font-medium">
                                    This system is restricted to authorized V-Commerce personnel. All login attempts and session activities are logged for security auditing.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all text-base gap-2 border-0"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>Authorize Session <ArrowRight className="h-5 w-5" /></>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                Secure Token Service v1.0.4
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center mt-6 text-muted-foreground text-xs font-medium">
                    Lost your key? Contact system administrator.
                </p>
            </motion.div>
        </div>
    );
};


export default AdminLogin;
