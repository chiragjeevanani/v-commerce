import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
};

const PageTransition = ({ children, className = '' }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
