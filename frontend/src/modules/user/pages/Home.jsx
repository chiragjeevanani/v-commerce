import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, Zap, Search } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "@/lib/axios";
import { productsService } from "@/modules/admin/services/products.service";
import { categoryService } from "@/modules/admin/services/category.service";
import { storeProductService } from "@/modules/admin/services/storeProduct.service";
import ProductCard from "@/modules/user/components/ProductCard";
import StoreProductCard from "@/modules/user/components/StoreProductCard";
import SkeletonCard from "@/modules/user/components/SkeletonCard";
import { Button } from "@/components/ui/button";

// Use a module-level variable to track if initial fetch has been ATTEMPTED
// This persists across component remounts in development
let initialFetchAttempted = false;

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedStoreCategoryId, setSelectedStoreCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  const loadingRef = useRef(false);
  const lastRequestTime = useRef(0);
  const minRequestInterval = 1500; // 1.5 seconds between requests

  // Fetch hero banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/hero-banners`);
        const data = await response.json();
        if (data.success && data.data) {
          setBanners(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setBannersLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Fetch initial store products and store categories (no CJ categories/products)
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!initialFetchAttempted) {
        setLoading(true);
      }

      try {
        const [storeProductsResult, storeCategoriesResult] = await Promise.all([
          storeProductService.getActiveProducts({ limit: 8 }),
          categoryService.getActiveCategories(),
        ]);

        if (!isMounted) return;

        // Store products
        if (storeProductsResult?.success) {
          setProducts(storeProductsResult.data || []);
        } else if (Array.isArray(storeProductsResult?.data)) {
          setProducts(storeProductsResult.data);
        }

        // Store categories
        const catsPayload = storeCategoriesResult?.data ?? storeCategoriesResult;
        const catsArray = Array.isArray(catsPayload?.data)
          ? catsPayload.data
          : (Array.isArray(catsPayload) ? catsPayload : []);
        setCategories(catsArray);

        // Infinite scroll disabled for now
        setHasMore(false);
      } catch (error) {
        console.error("Failed to fetch store data for home:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          initialFetchAttempted = true;
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [location.key]);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Search (still navigates to shop for now; can be wired to store-products if needed)
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/shop");
    }
  };

  const loadMoreProducts = useCallback(async () => {
    // Prevent concurrent calls
    if (loadingRef.current) {
      console.log("[LoadMore] Already loading, skipping...");
      return;
    }
    
    // Don't load if we've confirmed there are no more products
    if (!hasMore) {
      console.log("[LoadMore] No more products available");
      return;
    }

    // Rate limiting - ensure at least 1.5 seconds between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < minRequestInterval) {
      const waitTime = minRequestInterval - timeSinceLastRequest;
      console.log(`[LoadMore] Rate limiting: waiting ${waitTime}ms before next request`);
      setTimeout(() => {
        if (!loadingRef.current && hasMore) {
          loadMoreProducts();
        }
      }, waitTime);
      return;
    }

    loadingRef.current = true;
    lastRequestTime.current = now;
    setLoadingMore(true);
    const nextPage = page + 1;

    console.log(`[LoadMore] Loading store products page ${nextPage}...`);

    try {
      const response = await storeProductService.getActiveProducts({
        page: nextPage,
        limit: 20,
        ...(selectedStoreCategoryId ? { categoryId: selectedStoreCategoryId } : {}),
      });

      if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
        setProducts(prev => [...prev, ...response.data]);
        setPage(nextPage);
        const totalPages = response.pagination?.pages;
        const hasMoreProducts = totalPages ? nextPage < totalPages : response.data.length >= 20;
        setHasMore(hasMoreProducts);
        console.log(`[LoadMore] Store page ${nextPage}/${totalPages || "?"}, hasMore: ${hasMoreProducts}`);
      } else {
        console.log("[LoadMore] No more store products available");
        setHasMore(false);
      }
    } catch (error) {
      console.error("[LoadMore] Failed to load more store products:", error);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [hasMore, page, selectedStoreCategoryId]);

  // Infinite scroll for store products
  useEffect(() => {
    const handleScroll = () => {
      if (loadingRef.current || !hasMore || loadingMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 400) {
        loadMoreProducts();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, loadMoreProducts]);

  const nextBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Derived store category slices
  const storePartialCategories = categories.filter((c) => c.allowPartialPayment === true);
  const storeNormalCategories = categories.filter((c) => !c.allowPartialPayment);

  const handleStoreCategoryClick = (categoryId) => {
    setSelectedStoreCategoryId(categoryId);
    navigate(`/store-products?category=${encodeURIComponent(categoryId)}`);
  };

  return (
    <div className="flex flex-col min-h-screen gap-10 pb-10">
      {/* Search Bar - Visible on all screens */}
      <section className="container pt-4">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full h-14 pl-14 pr-6 rounded-2xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl">
              Search
            </Button>
          </div>
        </form>
      </section>

      {/* Hero Section */}
      {banners.length > 0 && (
        <section className="relative h-[600px] w-full overflow-hidden bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear scale-110"
                style={{
                  backgroundImage: `url(${banners[currentBanner].image})`,
                  backgroundColor: "hsl(var(--muted))",
                  animation: "kenburns 20s infinite alternate"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
              </div>
              <div className="relative container h-full flex flex-col justify-center items-start p-6 md:p-12">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="max-w-2xl"
                >
                  <motion.span
                    className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    New Arrival
                  </motion.span>
                  <motion.h1
                    className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight"
                  >
                    {banners[currentBanner].title.split(' ').map((word, i) => (
                      <motion.span
                        key={i}
                        className="inline-block mr-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-lg md:text-xl mb-10 text-muted-foreground max-w-lg leading-relaxed"
                  >
                    {banners[currentBanner].description}
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex gap-4"
                  >
                    <Link to="/shop">
                      <Button size="lg" className="text-lg px-8 py-7 rounded-full shadow-lg hover:shadow-primary/20 transition-all active:scale-95 group">
                        {banners[currentBanner].cta}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-8 right-12 flex gap-4 z-10">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/20 backdrop-blur-md border-white/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              onClick={prevBanner}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/20 backdrop-blur-md border-white/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              onClick={nextBanner}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Banner Indicators */}
          <div className="absolute bottom-8 left-12 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${i === currentBanner ? "w-8 bg-primary" : "w-2 bg-primary/20"
                  }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Store Categories Section (replaces CJ Browse Categories) */}
      <section className="container py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-primary blur-2xl opacity-20" />
              <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 ring-1 ring-white/20">
                <LayoutGrid className="h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Browse Store Categories
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Apne store ki local categories se products discover karein.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {storeNormalCategories.length === 0 && loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
            ))
          ) : storeNormalCategories.length > 0 ? (
            storeNormalCategories.map((cat) => {
              const name = cat.name || "Category";
              const firstLetter = (name[0] || "C").toUpperCase();
              const isSelected = selectedStoreCategoryId === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleStoreCategoryClick(cat._id)}
                  className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-card shadow-sm shadow-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <div className="relative h-28 w-full overflow-hidden">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                        <span className="text-2xl font-black text-primary">{firstLetter}</span>
                      </div>
                    )}
                    {cat.allowPartialPayment && (
                      <span className="absolute top-2 left-2 rounded-full bg-amber-500/90 text-[9px] font-black uppercase tracking-[0.18em] text-white px-2 py-0.5 shadow-sm">
                        Partial
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-semibold line-clamp-1">{name}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {cat.description || "Store category"}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground col-span-full">
              Abhi tak koi normal (non‑partial) store category create nahi hui hai.
            </p>
          )}
        </div>
      </section>

      {/* Partial payment categories (separate section) */}
      {storePartialCategories.length > 0 && (
        <section className="container pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-lg font-bold">
                Partial Payment Categories
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                In categories me customers ₹500 partial payment kar sakte hain.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {storePartialCategories.map((cat) => {
              const name = cat.name || "Category";
              const firstLetter = (name[0] || "C").toUpperCase();
              const isSelected = selectedStoreCategoryId === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleStoreCategoryClick(cat._id)}
                  className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-amber-500 bg-card shadow-sm shadow-amber-300/40"
                      : "border-border bg-card hover:border-amber-400 hover:bg-amber-50/10"
                  }`}
                >
                  <div className="relative h-28 w-full overflow-hidden">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-amber-400/40 to-amber-300/20 flex items-center justify-center">
                        <span className="text-2xl font-black text-amber-700">{firstLetter}</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded-full bg-amber-500/95 text-[9px] font-black uppercase tracking-[0.18em] text-white px-2 py-0.5 shadow-sm">
                      Partial
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-semibold line-clamp-1">{name}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {cat.description || "Partial payment enabled category"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Store Products grid (no dropshipping) */}
      <section className="container py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {selectedStoreCategoryId ? "Store Products in this Category" : "Store Products"}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading && products.length === 0
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length > 0
            ? products.map((product) => (
                <StoreProductCard key={product._id} product={product} />
              ))
            : (
              <p className="text-sm text-muted-foreground col-span-full">
                Is selection ke liye koi store product nahi mila.
              </p>
            )}
        </div>
      </section>

      {/* Hierarchical Categories Section (CJ) - hidden */}
      {false && (
      <section className="container relative overflow-hidden">
        {/* Ambient background glows for dark mode depth */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000" />

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-6 md:gap-8 relative z-10 px-1">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative group/title-icon">
              <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover/title-icon:opacity-40 transition-opacity" />
              <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 ring-1 ring-white/20">
                <LayoutGrid className="h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <h2 className="text-2xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 leading-tight">
                Browse Categories
              </h2>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-0.5 md:h-1 w-8 md:w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
                <p className="text-primary text-[10px] md:text-xs uppercase font-black tracking-[0.2em] md:tracking-[0.3em] opacity-90">Discover by subcategory</p>
              </div>
            </div>
          </div>
          <Link to="/shop" className="group flex items-center gap-3 md:gap-4 text-xs md:text-sm font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-primary hover:text-foreground transition-all">
            <span className="relative">
              Explore All
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </span>
            <div className="flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-primary/30">
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        {/* Mobile: Horizontal scroll category cards */}
        <div className="md:hidden relative z-10 -mx-4 px-4 overflow-x-auto scrollbar-none snap-x snap-mandatory touch-pan-x" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex gap-4 pb-2" style={{ minWidth: "min-content" }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[72vw] max-w-[320px] h-52 rounded-2xl bg-muted/40 animate-pulse border border-border/50 snap-center" />
              ))
            ) : categories && categories.length > 0 ? (
              categories.slice(0, 8).map((cat, i) => {
                const name = cat.categoryFirstName || cat.name || "Category";
                const firstLetter = (name.charAt(0) || "C").toUpperCase();
                const avatarColors = [
                  "from-primary/90 to-primary/40",
                  "from-indigo-500/90 to-indigo-400/50",
                  "from-emerald-500/90 to-emerald-400/50",
                  "from-amber-500/90 to-amber-400/50",
                  "from-rose-500/90 to-rose-400/50",
                  "from-violet-500/90 to-violet-400/50",
                ];
                const gradient = avatarColors[i % avatarColors.length];
                return (
                  <Link
                    key={cat.categoryFirstId || cat.id || i}
                    to={`/shop?category=${cat.categoryFirstId || cat.id}`}
                    className="flex-shrink-0 w-[72vw] max-w-[320px] snap-center snap-always block"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                      className="group relative overflow-hidden h-full min-h-[200px] rounded-2xl border border-border/40 dark:border-white/10 bg-card/80 dark:bg-card/90 backdrop-blur-sm p-5 flex flex-col shadow-lg active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg bg-gradient-to-br ${gradient}`}>
                          {firstLetter}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <span>{cat.categoryFirstList?.length || 0}</span>
                          <span>sub</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-foreground group-active:text-primary leading-tight line-clamp-2 mb-auto">
                        {name}
                      </h3>
                      {cat.categoryFirstList && cat.categoryFirstList.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                          {cat.categoryFirstList.slice(0, 3).map((sub, idx) => (
                            <Link
                              key={sub.categorySecondId || sub.id || idx}
                              to={`/shop?category=${sub.categorySecondId || sub.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-muted/60 dark:bg-white/5 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              {sub.categorySecondName || sub.name}
                            </Link>
                          ))}
                          {cat.categoryFirstList.length > 3 && (
                            <Link
                              to={`/shop?category=${cat.categoryFirstId || cat.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 px-2 py-1.5 text-[11px] font-bold text-primary"
                            >
                              +{cat.categoryFirstList.length - 3}
                            </Link>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                );
              })
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[72vw] max-w-[320px] h-52 rounded-2xl bg-muted/40 animate-pulse border border-border/50 snap-center" />
              ))
            )}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-10 relative z-10 min-h-[600px]">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-[3.5rem] bg-muted/40 animate-pulse border border-border/50" />
            ))
          ) : categories && categories.length > 0 ? (
            categories.slice(0, 6).map((cat, i) => {
              const name = cat.categoryFirstName || cat.name || "Category";
              const firstLetter = (name.charAt(0) || "C").toUpperCase();
              const avatarColors = [
                "from-primary/90 to-primary/40",
                "from-indigo-500/90 to-indigo-400/50",
                "from-emerald-500/90 to-emerald-400/50",
                "from-amber-500/90 to-amber-400/50",
                "from-rose-500/90 to-rose-400/50",
                "from-violet-500/90 to-violet-400/50",
              ];
              const gradient = avatarColors[i % avatarColors.length];
              return (
              <motion.div
                key={cat.categoryFirstId || cat.id || i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 80,
                  damping: 18
                }}
                className="group relative overflow-hidden bg-gradient-to-br from-card/60 to-card/20 dark:from-card/90 dark:to-background/40 backdrop-blur-3xl border border-border/40 dark:border-white/10 rounded-[3.5rem] p-10 transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_30px_100px_-20px_rgba(var(--primary),0.15)] hover:-translate-y-3 cursor-pointer"
              >
                {/* Visual Enhancers for Dark Mode Elevation */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />

                {/* Category avatar (placeholder when no image) */}
                <div className={`absolute top-10 right-10 h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl bg-gradient-to-br ${gradient} ring-2 ring-white/20`}>
                  {firstLetter}
                </div>

                {/* Precise Top Rim Light */}
                <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 dark:via-white/20 to-transparent" />

                <div className="flex justify-between items-start mb-10 relative z-10 pr-24">
                  <div className="space-y-3">
                    <Link to={`/shop?category=${cat.categoryFirstId || cat.id}`}>
                      <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-all duration-300 uppercase italic tracking-tighter leading-[0.85] flex flex-col">
                        <span className="text-primary/50 text-[10px] italic normal-case tracking-[0.2em] mb-2 font-black">PREMIUM SERIES</span>
                        {name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3">
                      <div className="h-[2px] w-6 bg-primary/40 rounded-full group-hover:w-10 group-hover:bg-primary transition-all" />
                      <p className="text-[10px] text-muted-foreground font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                        {cat.categoryFirstList?.length || 0} Subcategories
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 relative z-10">
                  {cat.categoryFirstList && cat.categoryFirstList.length > 0 ? (
                    <>
                      {cat.categoryFirstList.slice(0, 5).map((sub, idx) => (
                        <Link
                          key={sub.categorySecondId || sub.id || idx}
                          to={`/shop?category=${sub.categorySecondId || sub.id}`}
                          className="px-5 py-2.5 rounded-2xl bg-secondary/20 dark:bg-white/[0.03] border border-border/40 dark:border-white/5 text-[12px] font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-transparent hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 backdrop-blur-md"
                        >
                          {sub.categorySecondName || sub.name}
                        </Link>
                      ))}
                      {cat.categoryFirstList.length > 5 && (
                        <Link
                          to={`/shop?category=${cat.categoryFirstId || cat.id}`}
                          className="px-4 py-2 text-[12px] font-black text-primary hover:text-foreground transition-all flex items-center gap-2 group/more"
                        >
                          <span>+{cat.categoryFirstList.length - 5} More</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/more:translate-x-1.5" />
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link
                      to={`/shop?category=${cat.categoryFirstId || cat.id}`}
                      className="px-5 py-2.5 rounded-2xl bg-secondary/20 dark:bg-white/[0.03] border border-border/40 dark:border-white/5 text-[12px] font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-transparent hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 backdrop-blur-md"
                    >
                      Explore Products
                    </Link>
                  )}
                </div>

                {/* Cyber-Line Accent */}
                <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-[0.5px]" />
              </motion.div>
              );
            })
          ) : (
            // Empty State - Show placeholder categories
            Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 80,
                    damping: 18
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-card/60 to-card/20 dark:from-card/90 dark:to-background/40 backdrop-blur-3xl border border-border/40 dark:border-white/10 rounded-[3.5rem] p-10 transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_30px_100px_-20px_rgba(var(--primary),0.15)] hover:-translate-y-3 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
                  <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 dark:via-white/20 to-transparent" />
                  
                  <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="space-y-3">
                      <Link to="/shop">
                        <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-all duration-300 uppercase italic tracking-tighter leading-[0.85] flex flex-col">
                          <span className="text-primary/50 text-[10px] italic normal-case tracking-[0.2em] mb-2 font-black">COMING SOON</span>
                          Category {i + 1}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3">
                        <div className="h-[2px] w-6 bg-primary/40 rounded-full group-hover:w-10 group-hover:bg-primary transition-all" />
                        <p className="text-[10px] text-muted-foreground font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">Loading Categories</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                      <div className="relative h-16 w-16 rounded-2xl bg-secondary/50 dark:bg-white/5 backdrop-blur-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all duration-700 border border-border/50 dark:border-white/10 ring-1 ring-white/5">
                        <Zap className="h-8 w-8 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 relative z-10">
                    <Link
                      to="/shop"
                      className="px-5 py-2.5 rounded-2xl bg-secondary/20 dark:bg-white/[0.03] border border-border/40 dark:border-white/5 text-[12px] font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-transparent hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 backdrop-blur-md"
                    >
                      Explore Shop
                    </Link>
                  </div>

                  <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-[0.5px]" />
                </motion.div>
              ))
          )}
        </div>
      </section>
      )}
    </div>
  );
};

export default Home;
