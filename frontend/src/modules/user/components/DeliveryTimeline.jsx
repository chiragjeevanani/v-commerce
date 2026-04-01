import React from "react";
import { motion } from "framer-motion";
import { Truck } from "lucide-react";

const DeliveryTimeline = () => {
    const today = new Date();
    
    // Delivery Logic:
    // Order done: Current date
    // Order in process: Current date + 1 day
    // Order delivered: Current date + 3 days
    // Example format: "30 March"
    const formatDate = (date) => {
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long" });
    };

    const processDate = new Date(today); 
    processDate.setDate(today.getDate() + 1);
    
    const deliveryDateStart = new Date(today); 
    deliveryDateStart.setDate(today.getDate() + 3);

    const deliveryDateEnd = new Date(today); 
    deliveryDateEnd.setDate(today.getDate() + 5);

    const steps = [
        { label: "Order done", date: formatDate(today) },
        { label: "Order in process", date: formatDate(processDate) },
        { label: "Order delivered", date: `${formatDate(deliveryDateStart).split(' ')[0]} to ${formatDate(deliveryDateEnd)}` },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full mt-6 bg-muted/20 p-5 rounded-3xl border border-border/50"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="truck-circle relative flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary/10 rounded-full">
                    <span className="absolute inset-0 rounded-full pulse-ring opacity-30" />
                    <span className="absolute inset-0 rounded-full pulse-ring-2 opacity-20" />
                    <Truck className="h-6 w-6 text-primary truck-anim truck-glow" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Estimated Delivery
                </span>
            </div>

            <div className="relative border-l-2 border-primary/20 ml-2.5 space-y-6">
                {steps.map((step, idx) => {
                    const isLast = idx === steps.length - 1;
                    const isFirst = idx === 0;
                    return (
                        <div key={idx} className="relative pl-6">
                            {/* Dot */}
                            <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 transition-all duration-300 ${
                                isLast 
                                    ? "bg-background border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                                    : "bg-primary border-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                                }`} 
                            />
                            
                            <div className="flex flex-col gap-0.5">
                                <span className={`text-sm font-bold ${isLast ? "text-primary" : "text-foreground"}`}>
                                    {step.date}
                                </span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default DeliveryTimeline;
