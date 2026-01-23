import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/utils';

const LoadingSpinner = ({ size = 'md', className, label }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <div
                className={cn(
                    'rounded-full border-primary/20 border-t-primary animate-spin',
                    sizeClasses[size]
                )}
                role="status"
                aria-label="Loading"
            />
            {label && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-muted-foreground"
                >
                    {label}
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;
