import React from "react";
import { motion } from "framer-motion";
import { Check, Package, Truck, MapPin, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/utils/utils";

const OrderTimeline = ({ steps, currentStatus }) => {
    return (
        <div className="relative">
            <div className="flex flex-col space-y-8">
                {steps.map((step, index) => {
                    const isCompleted = step.completed;
                    const isLast = index === steps.length - 1;
                    // Current status is the last completed step or the currentStatus from props
                    const isCurrent = step.status === currentStatus;

                    const formatDate = (dateStr) => {
                        if (!dateStr) return null;
                        try {
                            return new Date(dateStr).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        } catch (e) {
                            return dateStr;
                        }
                    };

                    return (
                        <div key={step.status} className="relative flex gap-4">
                            {!isLast && (
                                <div
                                    className={cn(
                                        "absolute left-[15px] top-[30px] w-[2px] h-[calc(100%+8px)]",
                                        isCompleted ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            )}

                            <div className="relative z-10">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isCompleted || isCurrent ? 1 : 0.8,
                                        backgroundColor: isCompleted ? "hsl(var(--primary))" : isCurrent ? "transparent" : "hsl(var(--muted))"
                                    }}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                                        isCompleted ? "border-primary text-primary-foreground" :
                                            isCurrent ? "border-primary text-primary" : "border-muted text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5 mx-auto" />
                                    ) : (
                                        <Circle className="w-4 h-4 mx-auto fill-current opacity-20" />
                                    )}
                                </motion.div>
                            </div>

                            <div className="flex flex-col pb-2">
                                <h4 className={cn(
                                    "font-bold text-lg leading-none mb-1",
                                    isCompleted ? "text-foreground" : isCurrent ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </h4>
                                {step.date && (
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {formatDate(step.date)}
                                    </p>
                                )}
                                {isCurrent && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-1.5 mt-1"
                                    >
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                            Current Status
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTimeline;
