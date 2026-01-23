import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const StatsChart = ({ title, data, type = "bar" }) => {
    if (type === "pie") {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-0">
                    <div className="relative h-48 w-48 mb-6">
                        <svg viewBox="0 0 100 100" className="h-full w-full rotate-[-90deg]">
                            {data.map((item, i) => {
                                let offset = 0;
                                for (let j = 0; j < i; j++) offset += data[j].value;
                                const strokeDasharray = `${item.value} 100`;
                                const strokeDashoffset = -offset;
                                return (
                                    <circle
                                        key={i}
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke={item.color}
                                        strokeWidth="20"
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={strokeDashoffset}
                                        className="transition-all duration-1000"
                                    />
                                );
                            })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-bold">1,248</span>
                            <span className="text-[10px] text-muted-foreground">Total Orders</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {data.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.name} ({item.value}%)</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Default Bar Chart (Mini)
    const maxVal = Math.max(...data.map(d => d.value));

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <select className="bg-transparent text-xs text-muted-foreground border-none outline-none cursor-pointer">
                    <option>Weekly</option>
                    <option>Monthly</option>
                </select>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-64 flex items-end justify-between gap-2 px-2 mt-4">
                    {data.map((item, i) => (
                        <div key={i} className="group relative flex-1 flex flex-col items-center">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.value / maxVal) * 100}%` }}
                                transition={{ delay: i * 0.05, duration: 0.8 }}
                                className="w-full bg-primary/20 hover:bg-primary rounded-t-sm transition-colors relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    ${item.value}k
                                </div>
                            </motion.div>
                            <span className="text-[10px] text-muted-foreground mt-2">{item.label}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default StatsChart;
