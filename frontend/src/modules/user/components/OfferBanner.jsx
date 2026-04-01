import React, { useState, useEffect } from "react";
import { Tag } from "lucide-react";

const OfferBanner = ({ price }) => {
    // Session persistent 5 min timer
    const [timeLeft, setTimeLeft] = useState(() => {
        const stored = sessionStorage.getItem("offerTimer");
        if (stored && parseInt(stored) > 0) return parseInt(stored);
        return 300; // 5 mins
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev <= 1 ? 300 : prev - 1;
                sessionStorage.setItem("offerTimer", next.toString());
                return next;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // Dynamic offer price calculation: the user requested to keep it identical to the main price 
    let offerPrice = price || 0;
    const formattedPrice = offerPrice.toLocaleString('en-IN');
    if (!price) return null;

    return (
        <div className="relative mt-12 mb-10 inline-flex w-full md:w-fit group">
            <div className="bg-primary/20 backdrop-blur-md rounded-2xl p-5 pl-5 pr-12 md:pr-20 w-full flex items-center shadow-lg border border-primary/20 transition-all hover:bg-primary/30">
                <div className="bg-white/10 p-2 rounded-xl mr-4 shadow-inner">
                    <Tag className="text-white h-5 w-5 flex-shrink-0 fill-white rotate-[-15deg] group-hover:rotate-0 transition-transform duration-500" />
                </div>
                <span className="text-white font-medium text-sm md:text-[16px] leading-tight flex-1">
                    Get it for <span className="font-black text-white">₹{offerPrice}</span>. <span className="opacity-80">V-Commerce Exclusive Offer applied.</span>
                </span>
            </div>

            <div className="absolute -top-4 right-3 md:right-5 bg-destructive text-destructive-foreground font-black text-[10px] md:text-[11px] px-4 py-1.5 rounded-full shadow-2xl z-10 tracking-[0.1em] border border-white/20 uppercase flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Offer Ends in: {formattedTime}
            </div>
        </div>
    );
};

export default OfferBanner;
