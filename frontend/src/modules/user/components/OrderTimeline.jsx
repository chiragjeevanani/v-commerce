import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Truck, MapPin, Clock, Banknote, ShieldCheck, ThumbsUp } from "lucide-react";
import { cn } from "@/utils/utils";

const OrderTimeline = ({ steps, currentStatus, orderDate, deliveryCountdown }) => {
    const getActiveIndex = () => {
        const statusMap = {
            'placed': 0, 'confirmed': 1, 'shipped': 1, 'delivered': 2
        };
        return statusMap[currentStatus.toLowerCase()] ?? 0;
    };

    const activeIndex = getActiveIndex();

    const timelineSteps = [
        { label: "Purchased", icon: ShoppingBag, status: 'placed' },
        { label: "Processing", icon: Truck, status: 'processing' },
        { label: "Delivered", icon: MapPin, status: 'delivered' }
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) { return ""; }
    };

    const getStepDate = (status) => {
        const found = steps.find(s => s.status.toLowerCase() === status.toLowerCase());
        if (found?.date) return formatDate(found.date);
        if (status === 'placed' && orderDate) return formatDate(orderDate);
        return "";
    };

    return (
        <div className="w-full">
            {/* Top Row: Info + Timeline + Features */}
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                
                {/* 1. Timer Section */}
                <div className="flex flex-col gap-2 min-w-[220px]">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-tighter text-muted-foreground/60">
                         <Clock className="w-4 h-4" /> Order today within
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-black tabular-nums tracking-tighter">06 : 28 : 36</span>
                    </div>
                    <div className="text-[11px] font-medium text-muted-foreground">
                        Get it by <span className="text-foreground font-bold underline decoration-primary/30">21 March</span>
                    </div>
                </div>

                <div className="hidden lg:block w-px h-16 bg-muted/30" />

                {/* 2. Timeline Progress */}
                <div className="flex-1 relative w-full px-4 min-h-[80px] flex items-center">
                    <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-muted/20 -translate-y-1/2" />
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(activeIndex / (timelineSteps.length - 1)) * 100}%` }}
                        className="absolute top-1/2 left-4 h-[2px] bg-foreground -translate-y-1/2"
                    />
                    <div className="relative w-full flex justify-between z-10">
                        {timelineSteps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = idx <= activeIndex;
                            return (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center bg-background border-2 transition-all duration-500 shadow-sm",
                                        isActive ? "border-foreground scale-110" : "border-muted-foreground/20 text-muted-foreground"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={cn("text-[11px] font-bold uppercase tracking-tight", isActive ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
                                        <span className="text-[9px] font-medium text-muted-foreground/70">{getStepDate(step.status)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden lg:block w-px h-16 bg-muted/30" />

                {/* 3. Features Row */}
                <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                    {[
                        { icon: Banknote, label: "Cash" },
                        { icon: Truck, label: "Free" },
                        { icon: ShieldCheck, label: "Quality" },
                        { icon: ThumbsUp, label: "Happy" }
                    ].map((f, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 group">
                            <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground/70 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                <f.icon className="w-5 h-5 stroke-1" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/60">{f.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderTimeline;
