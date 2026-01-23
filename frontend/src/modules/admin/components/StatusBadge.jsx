import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';

const statusVariants = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-900/50",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 border-blue-200 dark:border-blue-900/50",
    shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 border-purple-200 dark:border-purple-900/50",
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 border-green-200 dark:border-green-900/50",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 border-red-200 dark:border-red-900/50",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 border-green-200 dark:border-green-900/50",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 border-red-200 dark:border-red-900/50",
};

const StatusBadge = ({ status, className }) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const variantClass = statusVariants[normalizedStatus] || statusVariants.pending;

    return (
        <Badge
            variant="outline"
            className={cn("capitalize px-2.5 py-0.5 font-medium rounded-full", variantClass, className)}
        >
            {status}
        </Badge>
    );
};

export default StatusBadge;
