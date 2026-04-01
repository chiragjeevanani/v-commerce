import React, { useEffect, useState, useMemo } from "react";
import { Star, X } from "lucide-react";
import { useAuth } from "@/modules/user/context/AuthContext";
import { authService } from "@/services/auth.service";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/utils/utils";

const StarIcon = ({ filled, size = 18, className }) => (
  <Star
    size={size}
    className={cn(
      "transition-all duration-200",
      filled ? "fill-[#FBBF24] text-[#FBBF24]" : "text-muted-foreground/20",
      className
    )}
  />
);

const BigStarIcon = ({ filled, size = 32, className }) => (
  <Star
    size={size}
    className={cn(
      "transition-all duration-300 transform",
      filled ? "fill-[#FBBF24] text-[#FBBF24] drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" : "text-muted-foreground/20",
      className
    )}
  />
);

const ProductReviews = ({ productId, product }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  };

  const distribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rating = Math.round(r.rating);
      if (dist[rating] !== undefined) dist[rating]++;
    });
    return dist;
  }, [reviews]);

  useEffect(() => {
    if (!productId) return;
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/store-products/${productId}/reviews`);
      if (res.data?.success) {
        const { reviews = [], averageRating = 0, reviewCount = 0 } = res.data.data || {};
        setReviews(reviews);
        setAverageRating(averageRating);
        setReviewCount(reviewCount);

        if (isAuthenticated && user?._id) {
          const mine = reviews.find((r) => r.user?._id === user._id || r.user === user._id);
          if (mine) {
            setMyRating(mine.rating);
            setMyComment(mine.comment || "");
          }
        }
      }
    } catch (error) {
      console.error("Failed to load reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please login", description: "Login to write a review." });
      return;
    }
    if (!myRating) {
      toast({ title: "Rating required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const token = authService.getToken();
      const res = await apiClient.post(
        `/store-products/${productId}/reviews`,
        { rating: myRating, comment: myComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast({ title: "Review saved", description: "Thank you for your feedback!" });
        setIsModalOpen(false);
        fetchReviews();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Could not save review.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-12 py-10 border-t">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-10 md:items-center">
        {/* Left: Overall Rating */}
        <div className="flex flex-col items-center justify-center p-6 bg-card rounded-3xl border shadow-sm min-w-[200px]">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mr-auto mb-4">Reviews</h2>
          <div className="flex flex-col items-center">
            <span className="text-7xl font-black tracking-tighter">{averageRating.toFixed(1)}</span>
            <div className="flex gap-1 mt-2 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} filled={s <= Math.round(averageRating)} size={20} />
              ))}
            </div>
            <span className="text-sm font-black text-muted-foreground uppercase">{reviewCount} reviews</span>
          </div>
        </div>

        {/* Middle: Distribution Bars */}
        <div className="flex-1 space-y-3 max-w-md">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-4 group">
              <span className="text-sm font-bold w-6 flex items-center gap-1">
                {rating} <Star className="h-3 w-3 fill-[#FBBF24] text-[#FBBF24]" />
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${reviewCount > 0 ? (distribution[rating] / reviewCount) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="absolute inset-0 bg-black rounded-full"
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground min-w-[30px] text-right">
                {distribution[rating]}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Call to Action */}
        <div className="flex flex-col items-center md:items-end gap-4 p-4 border-l-0 md:border-l border-dashed md:pl-10">
          <span className="text-sm font-bold text-muted-foreground">Click to review</span>
          <div className="flex gap-1 cursor-pointer" onClick={() => setIsModalOpen(true)}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={34}
                className="text-muted-foreground/20 hover:text-[#FBBF24] hover:fill-[#FBBF24] transition-all duration-300 hover:scale-110"
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid gap-6">
        <h3 className="text-xl font-black">Community Feedback</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.length === 0 ? (
            <div className="col-span-full py-10 text-center bg-muted/20 rounded-3xl border border-dashed">
              <p className="text-muted-foreground font-medium italic">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <motion.div
                key={rev._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon key={s} filled={s <= rev.rating} size={14} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-GB') : ""}
                  </span>
                </div>
                <p className="text-sm font-bold leading-none mt-1">{rev.name || rev.user?.fullName || "Verified Buyer"}</p>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{rev.comment || "Great product!"}"</p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[32px] p-0 overflow-hidden outline-none">
          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-xl font-bold">How do you like this item?</h2>
              
              {/* Product Snippet */}
              <div className="flex items-center gap-4 w-full p-4 rounded-2xl bg-muted/30">
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-white border shrink-0">
                  <img 
                    src={product?.images?.[0] || "/placeholder-product.png"} 
                    alt={product?.name} 
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-sm font-bold line-clamp-2 leading-snug">
                  {product?.name}
                </span>
              </div>

              {/* Big Interactive Stars */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setMyRating(s)}
                      className="transition-transform active:scale-90"
                    >
                      <BigStarIcon filled={s <= (hoverRating || myRating)} size={40} />
                    </button>
                  ))}
                </div>
                <span className={cn(
                  "text-sm font-black uppercase tracking-widest transition-opacity duration-300",
                  (myRating || hoverRating) ? "opacity-100" : "opacity-0"
                )}>
                  {ratingLabels[hoverRating || myRating]}
                </span>
              </div>
            </div>

            {/* Feedback Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-muted-foreground flex justify-between">
                Feedback <span className="text-destructive font-black">*</span>
              </label>
              <Textarea
                placeholder="Write your feedback..."
                className="min-h-[120px] rounded-2xl bg-muted/20 border-border focus:ring-0 focus:border-black transition-all resize-none p-4"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
              />
            </div>

            <Button 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-4"
              onClick={handleSubmit}
              disabled={submitting || !myRating}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductReviews;

