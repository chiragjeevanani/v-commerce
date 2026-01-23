import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/utils';

const KPICard = ({ title, value, icon: Icon, trend, trendValue, index }) => {
    const isPositive = trend === 'up';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
        >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">{title}</span>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Icon className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{value}</h2>
                            <div className="flex items-center gap-1 mt-1">
                                {isPositive ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={cn(
                                    "text-[10px] font-medium",
                                    isPositive ? "text-green-500" : "text-red-500"
                                )}>
                                    {trendValue}
                                </span>
                                <span className="text-[10px] text-muted-foreground ml-1">vs last month</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default KPICard;
