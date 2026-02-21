import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, CreditCard, ArrowLeft, Info } from "lucide-react";
import { productsService } from "@/modules/admin/services/products.service";
import { useCart } from "@/modules/user/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AnimatedNumber from "@/modules/user/components/AnimatedNumber";
import SkeletonCard from "@/modules/user/components/SkeletonCard";
import ProductCard from "@/modules/user/components/ProductCard";


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cartCount } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const touchStartX = useRef(0);
  const swipeDirection = useRef(0); // -1 = left/prev, 1 = right/next

  const images = (product?.images || product?.image) ? (product.images || [product.image]) : [];
  const imagesCount = images.length;

  // Autoscroll images every 4 seconds
  useEffect(() => {
    if (imagesCount <= 1) return;
    const timer = setInterval(() => {
      swipeDirection.current = 1;
      setActiveImage((prev) => (prev + 1) % imagesCount);
    }, 4000);
    return () => clearInterval(timer);
  }, [imagesCount]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (imagesCount <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      swipeDirection.current = diff > 0 ? 1 : -1;
      setActiveImage((prev) => {
        if (diff > 0) return (prev + 1) % imagesCount;
        return (prev - 1 + imagesCount) % imagesCount;
      });
    }
  };

  const handlePrevImage = () => {
    if (imagesCount <= 1) return;
    swipeDirection.current = -1;
    setActiveImage((prev) => (prev - 1 + imagesCount) % imagesCount);
  };

  const handleNextImage = () => {
    if (imagesCount <= 1) return;
    swipeDirection.current = 1;
    setActiveImage((prev) => (prev + 1) % imagesCount);
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0.8 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0.8 }),
  };
  const [activeTab, setActiveTab] = useState("description");
  const [hasAddedToCartOnThisPage, setHasAddedToCartOnThisPage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const result = await productsService.getProductDetails(id);

        if ((result.success || result.result || result.code === 200) && result.data) {
          const detail = result.data;

          // Normalize CJ product data
          const parseImages = (imgData) => {
            if (!imgData) return [];
            if (Array.isArray(imgData)) return imgData;
            try {
              const parsed = JSON.parse(imgData);
              return Array.isArray(parsed) ? parsed : [imgData];
            } catch (e) {
              return [imgData];
            }
          };

          const allImages = detail.productImageSet || parseImages(detail.productImage);

          const USD_TO_INR = 83;
          const SELLING_MARGIN = 1.3; // 30% profit markup
          const MRP_MARGIN = 1.8; // 80% markup for MRP display

          const getBasePrice = (priceStr) => {
            if (!priceStr) return 0;
            const s = String(priceStr);
            if (s.includes('--')) {
              return parseFloat(s.split('--')[0].trim());
            }
            return parseFloat(s);
          };

          const basePrice = getBasePrice(detail.sellPrice);

          const normalizedProduct = {
            id: detail.pid,
            pid: detail.pid,
            name: detail.productNameEn,
            image: allImages[0] || "",
            images: allImages,
            price: Math.round(basePrice * MRP_MARGIN * USD_TO_INR),
            discountPrice: Math.round(basePrice * SELLING_MARGIN * USD_TO_INR),
            description: detail.productHtmlDescription || detail.productRemarks || "No description available.",
            category: detail.categoryName || "General",
            stock: detail.warehouseInventoryNum || 100,
            sku: detail.productSku,
            weight: detail.productWeight,
            material: detail.material || "High Quality"
          };

          setProduct(normalizedProduct);

          // Fetch secondary data concurrently without blocking the main product display
          // Use try-catch for each so one failure doesn't kill the whole page
          try {
            const relatedResult = await productsService.getSupplierProducts({
              categoryId: detail.categoryId,
              size: 4
            });
            if (relatedResult?.products) {
              setRelatedProducts(relatedResult.products.filter(p => p.pid !== id));
            }
          } catch (e) {
            console.error("Related products fetch failed", e);
          }

          try {
            const recommendedResult = await productsService.getSupplierProducts({ size: 8 });
            if (recommendedResult?.products) {
              setRecommendedProducts(recommendedResult.products.filter(p => p.pid !== id).slice(0, 4));
            }
          } catch (e) {
            console.error("Recommended products fetch failed", e);
          }
        } else {
          // Handle case where API returns 200 but success/result is false
          throw new Error(result.message || "Product data not found");
        }
      } catch (error) {
        console.error("Failed to load product", error);
        toast({
          title: "Error",
          description: "Could not load product details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, location.key]);

  const handleQuantityChange = (type) => {
    if (type === "dec" && quantity > 1) setQuantity(quantity - 1);
    if (type === "inc" && quantity < (product?.stock || 10)) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    setHasAddedToCartOnThisPage(true);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, quantity });
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-8 min-h-screen">
        <div className="h-6 w-24 bg-muted animate-pulse rounded-md" />
        <div className="grid md:grid-cols-2 gap-12">
          <SkeletonCard className="h-[500px]" aspectRatio="square" />
          <div className="space-y-6">
            <div className="h-10 bg-muted animate-pulse rounded-lg w-3/4" />
            <div className="h-20 bg-muted animate-pulse rounded-lg w-full" />
            <div className="h-12 bg-muted animate-pulse rounded-lg w-1/3" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-muted animate-pulse rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 text-center min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Product not found</h2>
        <Button onClick={() => navigate("/shop")} className="mt-6 rounded-full px-8">
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Mobile-Only Immersive Hero */}
      <div className="md:hidden">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full w-12 h-12 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 border-0"
            aria-label="Back"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        {/* Hero Image Section - Swipe & Autoscroll */}
        <section
          className="relative w-full h-[70vh] overflow-hidden bg-card touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait" initial={false} custom={swipeDirection.current}>
            <motion.img
              key={activeImage}
              custom={swipeDirection.current}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeOut", duration: 0.35 }}
              src={images[activeImage]}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover select-none"
              draggable={false}
            />
          </AnimatePresence>
          {imagesCount > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 z-10"
                aria-label="Previous image"
              >
                <span className="text-2xl">‹</span>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 z-10"
                aria-label="Next image"
              >
                <span className="text-2xl">›</span>
              </button>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

          {/* Floating Badges */}
          <div className="absolute top-6 right-6 flex gap-4 z-20">
            {product.discountPrice && (
              <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold text-xs shadow-xl">
                - {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
              </Badge>
            )}
          </div>
        </section>

        {/* Mobile Content Overlay */}
        <div className="container relative -mt-20 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8 bg-card p-8 rounded-[40px] shadow-2xl border border-border/50"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-primary uppercase tracking-[0.2em]">{product.category}</span>
                {product.discountPrice && (
                  <span className="text-destructive font-black text-xs uppercase tracking-widest animate-pulse">Limited Deal</span>
                )}
              </div>
              <h1 className="text-2xl font-black text-foreground tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Mobile Thumbnails (Moved Here) */}
              <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${i === activeImage
                      ? "border-primary shadow-md scale-105"
                      : "border-muted hover:border-primary/50"
                      }`}
                    onClick={() => {
                      swipeDirection.current = i > activeImage ? 1 : -1;
                      setActiveImage(i);
                    }}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"} shadow-[0_0_10px_rgba(34,197,94,0.5)]`} />
                <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} Units in stock` : "Unavailable"}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Pricing</span>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-primary">
                  ₹<AnimatedNumber value={product.discountPrice || product.price} />
                </span>
                {product.discountPrice && (
                  <span className="text-xl line-through text-muted-foreground opacity-50">₹{product.price}</span>
                )}
              </div>
            </div>

            <p className="text-base text-muted-foreground leading-relaxed font-medium line-clamp-3">
              {product.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Desktop-Only Standard Layout */}
      <div className="hidden md:block container py-8">
        <Button variant="ghost" className="mb-8 hover:bg-transparent hover:text-primary transition-colors group" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to result
        </Button>

        <div className="grid grid-cols-12 gap-12 lg:gap-16">
          {/* Desktop Left: Image Sticky */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <motion.div
              layoutId="product-image"
              className="aspect-square overflow-hidden rounded-[40px] border bg-muted shadow-lg group relative"
            >
              <img
                src={images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 select-none"
                draggable={false}
              />
              {imagesCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Previous image"
                  >
                    <span className="text-2xl font-bold">‹</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Next image"
                  >
                    <span className="text-2xl font-bold">›</span>
                  </button>
                </>
              )}
              {product.discountPrice && (
                <div className="absolute top-8 left-8">
                  <Badge className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-black text-sm shadow-xl">
                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </Badge>
                </div>
              )}
            </motion.div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {images.slice(0, 6).map((img, i) => (
                <button
                  key={i}
                  className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-3xl border-2 transition-all duration-300 ${i === activeImage
                    ? "border-primary shadow-lg scale-105"
                    : "border-border hover:border-primary/50"
                    }`}
                  onClick={() => {
                      swipeDirection.current = i > activeImage ? 1 : -1;
                      setActiveImage(i);
                    }}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Right: Content Info */}
          <div className="col-span-12 lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
                {product.category}
              </span>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-foreground tracking-tight break-words">
                {product.name}
              </h1>
              <div className="flex items-center gap-6 py-4">
                <div className="flex flex-col">
                  <span className="text-3xl xl:text-4xl font-black text-primary">
                    ₹<AnimatedNumber value={product.discountPrice || product.price} />
                  </span>
                  {product.discountPrice && (
                    <span className="text-2xl text-muted-foreground line-through opacity-40">
                      ₹{product.price}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              className="text-base text-muted-foreground leading-relaxed font-medium border-l-4 border-primary/20 pl-6 product-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            <div className="space-y-8 pt-6 border-t">
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Quantity</span>
                  <div className="flex items-center bg-muted rounded-2xl p-1 w-fit border shadow-inner">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-xl hover:bg-background shadow-sm transition-all"
                      onClick={() => handleQuantityChange("dec")}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="w-16 text-center font-black text-2xl">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-xl hover:bg-background shadow-sm transition-all"
                      onClick={() => handleQuantityChange("inc")}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Status</span>
                  <div className="flex items-center gap-3 h-[52px] bg-muted px-6 rounded-2xl border">
                    <div className={`h-3 w-3 rounded-full animate-pulse ${product.stock > 0 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500"}`} />
                    <span className="font-black uppercase tracking-tighter">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg font-black rounded-[20px] shadow-xl hover:shadow-primary/30 transition-all active:scale-95 px-8"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-3 h-5 w-5" /> Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 h-14 text-lg font-black rounded-[20px] border shadow-sm hover:bg-muted transition-all active:scale-95"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  <CreditCard className="mr-3 h-5 w-5" /> Buy Now
                </Button>
              </div>
            </div>


          </div>
        </div>
      </div>

      <div className="container">

        {/* Detailed Content Tabs */}
        <section className="mt-24">
          <div className="flex gap-8 border-b border-border/50 mb-10 overflow-x-auto scrollbar-none">
            {["description", "specifications", "shipping & returns"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl"
            >
              {activeTab === "description" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Product Experience</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {product.description}. This premium {product.category} is designed for those who value quality and performance. Our team has meticulously selected materials that ensure durability while maintaining a sleek, modern aesthetic.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-8 mt-10">
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" /> Key Features
                      </h4>
                      <ul className="space-y-3 text-muted-foreground list-disc list-inside">
                        <li>Professional grade construction</li>
                        <li>Ergonomic design for maximum comfort</li>
                        <li>Highly durable and long-lasting material</li>
                        <li>Sustainably sourced and eco-friendly</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" /> What's in the box
                      </h4>
                      <ul className="space-y-3 text-muted-foreground list-disc list-inside">
                        <li>1x {product.name}</li>
                        <li>User Manual & Setup Guide</li>
                        <li>Premium Packaging Box</li>
                        <li>Warranty Card (1 Year)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid gap-4">
                  {[
                    { label: "Material", value: "Premium Composite" },
                    { label: "Weight", value: "450g" },
                    { label: "Dimensions", value: "24 x 18 x 5 cm" },
                    { label: "Origin", value: "Handcrafted in India" },
                    { label: "Warranty", value: "12 Months Limited" },
                  ].map((spec, i) => (
                    <div key={i} className="flex justify-between py-4 border-b border-border/30 last:border-none">
                      <span className="text-muted-foreground font-medium">{spec.label}</span>
                      <span className="font-bold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "shipping & returns" && (
                <div className="grid sm:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Fast Shipping</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          We offer trackable shipping on all orders. Usually takes 3-5 business days for delivery within major cities.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Plus className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Secure Packaging</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Every product is sanitized and packed with bubble wrap in high-quality boxes to ensure zero damage during transit.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <ArrowLeft className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Easy Returns</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Not happy with your product? We offer a 7-day no-questions-asked return policy for all manufacturing defects.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <Minus className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Replacement Policy</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Free replacement if the product is found damaged or incorrect at the time of delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-32">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Related Products</h2>
                <p className="text-muted-foreground mt-2">More items from the {product.category} collection.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <section className="mt-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black tracking-tight">You May Also Like</h2>
                <p className="text-muted-foreground mt-2">Personalized recommendations just for you.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Mobile Sticky - Cart icon (only show after add to cart on this page) */}
        {hasAddedToCartOnThisPage && cartCount > 0 && (
          <div className="fixed right-6 bottom-28 md:hidden z-50">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl relative shadow-lg border-2 ring-2 ring-primary/50 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20" onClick={() => navigate("/cart")}>
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {cartCount}
              </span>
            </Button>
          </div>
        )}
        {/* Mobile Sticky Action Bar - Buttons only */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t md:hidden z-40 flex gap-3">
          <Button className="flex-1 h-12 font-bold rounded-xl shadow-lg" onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Button variant="secondary" className="flex-1 h-12 font-bold rounded-xl border" onClick={handleBuyNow}>
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
