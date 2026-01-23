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
                    const isActive = !isCompleted && (index === 0 || steps[index - 1].completed);

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
                                        scale: isCompleted || isActive ? 1 : 0.8,
                                        backgroundColor: isCompleted ? "var(--primary)" : isActive ? "transparent" : "var(--muted)"
                                    }}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                                        isCompleted ? "border-primary text-primary-foreground" :
                                            isActive ? "border-primary text-primary" : "border-muted text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : isActive ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <Circle className="w-5 h-5 fill-current" />
                                        </motion.div>
                                    ) : (
                                        <Circle className="w-5 h-5" />
                                    )}
                                </motion.div>
                            </div>

                            <div className="flex flex-col pb-2">
                                <h4 className={cn(
                                    "font-bold text-lg leading-none mb-1",
                                    isCompleted ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </h4>
                                {step.date && (
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {step.date}
                                    </p>
                                )}
                                {isActive && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-xs font-semibold text-primary mt-1 uppercase tracking-wider"
                                    >
                                        Current Status
                                    </motion.p>
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
