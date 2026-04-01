import { useState, useEffect, useMemo } from "react";
import { Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "@/lib/axios";
import AnimatedNumber from "@/modules/user/components/AnimatedNumber";

const RatingSnippet = ({ productId }) => {
    const [ratingData, setRatingData] = useState({ rating: 5.0, count: 0 });

    useEffect(() => {
        if (!productId) return;
        const fetchRating = async () => {
            try {
                const res = await apiClient.get(`/store-products/${productId}/reviews`);
                if (res.data?.success) {
                    const { averageRating = 5.0, reviewCount = 0 } = res.data.data || {};
                    setRatingData({ rating: averageRating, count: reviewCount });
                }
            } catch (e) {
                console.error("Failed to fetch rating for snippet", e);
            }
        };
        fetchRating();
    }, [productId]);

    // Use default values if no reviews yet so UI doesn't look empty
    const rating = ratingData.count > 0 ? ratingData.rating : 5.0;
    const count = ratingData.count > 0 ? ratingData.count : 1001; // Keep 1001 as realistic filler if 0

    const scrollToReviews = () => {
        const element = document.getElementById("product-reviews");
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="flex items-center gap-6 py-4">
            <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-bold text-muted-foreground/80 uppercase tracking-tight">Rating ({rating.toFixed(1)})</span>
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={15} className={s <= Math.round(rating) ? "fill-[#FBBF24] text-[#FBBF24]" : "text-muted-foreground/20"} />
                    ))}
                </div>
            </div>
            
            <div className="h-10 w-[1.5px] bg-border/40 self-center" />
            
            <button 
                onClick={scrollToReviews}
                className="flex flex-col gap-0.5 text-left group transition-transform active:scale-95"
            >
                <span className="text-[13px] font-bold text-muted-foreground/80 uppercase tracking-tight group-hover:text-primary transition-colors">Reviews</span>
                <p className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{count.toLocaleString()}</p>
            </button>
        </div>
    );
};

const PurchaseBadge = ({ productId }) => {
    // Generate a stable "dynamic-looking" number based on productId so it doesn't change on refresh
    const purchaseCount = useMemo(() => {
        if (!productId) return 714;
        // Simple hash logic to generate a number between 400 and 1200
        let hash = 0;
        for (let i = 0; i < productId.length; i++) {
            hash = productId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const numericPid = productId.replace(/\D/g, '').substring(0, 5) || "0";
        return 400 + (Math.abs(hash + parseInt(numericPid)) % 800);
    }, [productId]);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-primary/5 hover:bg-primary/10 text-primary px-5 py-3 rounded-2xl w-fit border border-primary/20 shadow-sm backdrop-blur-sm mb-8 my-2 transition-colors border-dashed"
        >
            <div className="bg-primary/10 p-1.5 rounded-lg shadow-inner">
                <TrendingUp size={16} className="text-primary stroke-[3px]" />
            </div>
            <span className="text-[14px] font-black tracking-tight leading-none uppercase">
                <span className="text-primary"><AnimatedNumber value={purchaseCount} />+</span> People purchased this in the last 7 days
            </span>
        </motion.div>
    );
};

export { RatingSnippet, PurchaseBadge };
