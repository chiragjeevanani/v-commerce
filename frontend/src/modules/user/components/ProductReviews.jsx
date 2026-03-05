import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/modules/user/context/AuthContext";
import { authService } from "@/services/auth.service";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const StarRating = ({ value, onChange, readOnly = false, size = 18 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          className="text-yellow-400 disabled:cursor-default"
        >
          <Star
            className={`transition-transform ${star <= value ? "fill-yellow-400" : "fill-transparent"} ${
              !readOnly ? "hover:scale-110" : ""
            }`}
            size={size}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviews = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
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
    fetchReviews();
  }, [productId, isAuthenticated, user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      // Ensure token is present (AuthProvider already handles on login)
      const token = authService.getToken();
      const res = await apiClient.post(
      `/store-products/${productId}/reviews`,
        { rating: myRating, comment: myComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data?.success) {
        const { reviews = [], averageRating = 0, reviewCount = 0 } = res.data.data || {};
        setReviews(reviews);
        setAverageRating(averageRating);
        setReviewCount(reviewCount);
        toast({ title: "Review saved", description: "Thank you for your feedback!" });
      }
    } catch (error) {
      console.error("Review submit failed", error);
      toast({
        title: "Could not save review",
        description: error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hasReviews = reviewCount > 0 && reviews.length > 0;

  return (
    <section className="mt-10 lg:mt-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Customer Reviews</h2>
          <p className="text-xs text-muted-foreground">
            {hasReviews
              ? `${averageRating.toFixed(1)} / 5 · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
              : "No reviews yet. Be the first to review this product."}
          </p>
        </div>
        {hasReviews && (
          <div className="flex items-center gap-2">
            <StarRating value={averageRating} readOnly size={18} />
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="rounded-2xl border bg-muted/40 p-4 sm:p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Your Review
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-3">
              <StarRating value={myRating} onChange={setMyRating} size={20} />
              {myRating ? (
                <span className="text-xs text-muted-foreground">
                  You rated this <span className="font-semibold">{myRating} / 5</span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Tap to rate</span>
              )}
            </div>
            <Textarea
              placeholder="Share your experience with this product (optional)..."
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              className="min-h-[70px] text-sm rounded-xl"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                className="rounded-full px-5 text-xs font-semibold"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {loading && <p className="text-xs text-muted-foreground">Loading reviews...</p>}
        {!loading && !hasReviews && (
          <p className="text-sm text-muted-foreground">
            No reviews yet. Once customers buy this product, their feedback will appear here.
          </p>
        )}
        {!loading &&
          hasReviews &&
          reviews.slice(0, 6).map((rev) => (
            <div
              key={rev._id}
              className="rounded-xl border bg-card/60 px-4 py-3 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold leading-snug">
                    {rev.name || rev.user?.fullName || "Customer"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <StarRating value={rev.rating} readOnly size={14} />
                  <span className="text-xs font-semibold">{rev.rating.toFixed(1)}</span>
                </div>
              </div>
              {rev.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {rev.comment}
                </p>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

export default ProductReviews;

