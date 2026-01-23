import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

const AnimatedNumber = ({
    value,
    format = 'number',
    prefix = '',
    suffix = '',
    decimals = 0,
    className = ''
}) => {
    const nodeRef = useRef();
    const springValue = useSpring(value, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", latest => {
            if (nodeRef.current) {
                const formatted = format === 'currency'
                    ? latest.toFixed(decimals)
                    : format === 'integer'
                        ? Math.round(latest)
                        : latest.toFixed(decimals);

                nodeRef.current.textContent = `${prefix}${formatted}${suffix}`;
            }
        });

        return () => unsubscribe();
    }, [springValue, format, prefix, suffix, decimals]);

    return (
        <span ref={nodeRef} className={className}>
            {prefix}{value.toFixed(decimals)}{suffix}
        </span>
    );
};

export default AnimatedNumber;
