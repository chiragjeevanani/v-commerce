import React from 'react';
import { cn } from '@/utils/utils';

const SkeletonCard = ({ className, aspectRatio = 'square' }) => {
    const aspectClasses = {
        square: 'aspect-square',
        wide: 'aspect-video',
        portrait: 'aspect-[3/4]',
    };

    return (
        <div className={cn('animate-pulse space-y-3', className)}>
            {/* Image skeleton with shimmer */}
            <div
                className={cn(
                    'bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-xl overflow-hidden',
                    aspectClasses[aspectRatio]
                )}
            />

            {/* Content skeletons */}
            <div className="space-y-2 px-1">
                <div className="h-4 bg-muted rounded-md w-3/4" />
                <div className="h-3 bg-muted rounded-md w-1/2" />
                <div className="flex items-center justify-between mt-3">
                    <div className="h-5 bg-muted rounded-md w-1/3" />
                    <div className="h-7 w-7 bg-muted rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
