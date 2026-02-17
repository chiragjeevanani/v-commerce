import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { productsService } from "@/modules/admin/services/products.service";
import ProductCard from "@/modules/user/components/ProductCard";
import SkeletonCard from "@/modules/user/components/SkeletonCard";
import { Button } from "@/components/ui/button";

// Use a module-level variable to track if initial fetch has been ATTEMPTED
// This persists across component remounts in development
let initialFetchAttempted = false;

const Home = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  const loadingRef = useRef(false);
  const lastRequestTime = useRef(0);
  const minRequestInterval = 1500; // 1.5 seconds between requests

  // Fetch hero banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`https://api.vcommerce.shop/api/v1/hero-banners`);
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

  // Fetch initial products and categories
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!initialFetchAttempted) {
        setLoading(true);
      }

      try {
        const [productsResult, categoriesResult] = await Promise.all([
          productsService.getSupplierProducts({ page: 1, size: 20 }),
          productsService.fetchCategories(),
        ]);

        console.log("Categories Result:", categoriesResult);
        console.log("Categories Type:", typeof categoriesResult);
        console.log("Is Array:", Array.isArray(categoriesResult));

        if (isMounted) {
          if (productsResult?.products) {
            const initialProducts = productsResult.products;
            setProducts(initialProducts);
            // Set hasMore based on totalPages - if current page < totalPages, there are more
            const currentPage = 1;
            const totalPages = productsResult.totalPages;
            // If totalPages is available, use it; otherwise check if we got a full page
            const hasMoreProducts = totalPages 
              ? currentPage < totalPages 
              : initialProducts.length >= 20;
            setHasMore(hasMoreProducts);
            console.log(`[InitialLoad] Loaded ${initialProducts.length} products, Page ${currentPage}/${totalPages || '?'}, hasMore: ${hasMoreProducts}`);
          }
          if (categoriesResult && Array.isArray(categoriesResult)) {
            console.log("Setting categories (direct array):", categoriesResult.length);
            setCategories(categoriesResult);
          } else if (categoriesResult && categoriesResult.data && Array.isArray(categoriesResult.data)) {
            console.log("Setting categories (nested data):", categoriesResult.data.length);
            setCategories(categoriesResult.data);
          } else if (categoriesResult && categoriesResult.length !== undefined) {
            console.log("Setting categories (array-like):", categoriesResult.length);
            setCategories(Array.from(categoriesResult));
          } else {
            console.warn("Categories data format unexpected:", categoriesResult);
            setCategories([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        console.error("Error details:", error.response || error.message);
      } finally {
        if (isMounted) {
          setLoading(false);
          initialFetchAttempted = true;
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Infinite scroll logic
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

    console.log(`[LoadMore] Loading page ${nextPage}...`);

    try {
      const response = await productsService.getSupplierProducts({
        page: nextPage,
        size: 20,
        skipCache: true // Skip cache for infinite scroll to ensure fresh data
      });

      console.log(`[LoadMore] Response received for page ${nextPage}:`, response?.products?.length || 0, "products");
      console.log(`[LoadMore] Response totalPages:`, response?.totalPages);
      
      // Debug: Log full response structure
      if (response?.products && response.products.length > 0) {
        console.log(`[LoadMore] First product from API:`, {
          id: response.products[0].id,
          pid: response.products[0].pid,
          name: response.products[0].name?.substring(0, 50)
        });
      }

      if (response?.products && response.products.length > 0) {
        setProducts(prev => {
          // Debug: Log first few product IDs from current and new products
          if (prev.length > 0) {
            console.log(`[LoadMore] Existing product IDs (first 5):`, prev.slice(0, 5).map(p => ({ id: p.id, pid: p.pid })));
          }
          console.log(`[LoadMore] New product IDs (first 5):`, response.products.slice(0, 5).map(p => ({ id: p.id, pid: p.pid })));
          
          // Filter out duplicates based on pid/id - check both
          const existingIds = new Set();
          const existingPids = new Set();
          
          prev.forEach(p => {
            if (p.id) existingIds.add(String(p.id));
            if (p.pid) existingPids.add(String(p.pid));
          });
          
          const uniqueNewProducts = response.products.filter(
            p => {
              const productId = p.id;
              const productPid = p.pid;
              
              // Check if product already exists by id or pid
              const existsById = productId && existingIds.has(String(productId));
              const existsByPid = productPid && existingPids.has(String(productPid));
              
              if (existsById || existsByPid) {
                return false; // Duplicate
              }
              
              // Add to sets for future checks
              if (productId) existingIds.add(String(productId));
              if (productPid) existingPids.add(String(productPid));
              
              return true; // New product
            }
          );
          
          if (uniqueNewProducts.length === 0 && response.products.length > 0) {
            console.warn(`[LoadMore] ⚠️ All ${response.products.length} products from page ${nextPage} are duplicates!`);
            console.warn(`[LoadMore] 🔍 Debugging - API Response Product IDs:`, response.products.map(p => ({ id: p.id, pid: p.pid, name: p.name?.substring(0, 30) })));
            console.warn(`[LoadMore] 🔍 Debugging - Existing Product IDs:`, prev.map(p => ({ id: p.id, pid: p.pid, name: p.name?.substring(0, 30) })));
            
            // Check if API is actually returning different products but our comparison is wrong
            const apiProductIds = response.products.map(p => String(p.id || p.pid)).filter(Boolean);
            const existingProductIds = prev.map(p => String(p.id || p.pid)).filter(Boolean);
            const allMatch = apiProductIds.every(id => existingProductIds.includes(id));
            
            if (allMatch) {
              console.error(`[LoadMore] ❌ CONFIRMED: CJ API is returning EXACTLY the same products for page ${nextPage}!`);
              console.error(`[LoadMore] This is a CJ API issue - they are ignoring the pageNum parameter.`);
            }
            
            // If we're getting duplicates consistently, stop loading more
            // This prevents infinite loop of loading same products
            if (nextPage > 2) {
              console.warn(`[LoadMore] ⛔ Stopping infinite scroll - CJ API returning duplicates (page ${nextPage})`);
              setHasMore(false);
              return prev;
            }
          }
          
          const newProducts = [...prev, ...uniqueNewProducts];
          console.log(`[LoadMore] ✅ Added ${uniqueNewProducts.length} new products (${response.products.length - uniqueNewProducts.length} duplicates filtered), Total: ${newProducts.length}`);
          return newProducts;
        });
        setPage(nextPage);
        // Set hasMore based on totalPages - if current page < totalPages, there are more
        const totalPages = response.totalPages;
        // If totalPages is available, use it; otherwise check if we got a full page
        const hasMoreProducts = totalPages 
          ? nextPage < totalPages 
          : response.products.length >= 20;
        setHasMore(hasMoreProducts);
        console.log(`[LoadMore] Page ${nextPage}/${totalPages || '?'}, Has more products: ${hasMoreProducts}`);
      } else {
        // No more products available
        console.log("[LoadMore] No more products available");
        setHasMore(false);
      }
    } catch (error) {
      console.error("[LoadMore] Failed to load more products:", error);
      // Don't set hasMore to false on error, allow retry
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [hasMore, page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        
        // Only trigger if:
        // 1. Target is intersecting
        // 2. Not currently loading
        // 3. Has more products
        // 4. Not in loading ref (double check)
        // 5. Enough time has passed since last request
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime.current;
        const canMakeRequest = timeSinceLastRequest >= minRequestInterval;
        
        if (target.isIntersecting && !loadingMore && hasMore && !loadingRef.current && canMakeRequest) {
          console.log("[IntersectionObserver] ✅ Triggering loadMoreProducts");
          loadMoreProducts();
        } else if (target.isIntersecting && !canMakeRequest) {
          console.log(`[IntersectionObserver] Rate limited: ${minRequestInterval - timeSinceLastRequest}ms remaining`);
        }
      },
      {
        root: null,
        rootMargin: '300px', // Start loading 300px before reaching the bottom
        threshold: 0.1 // Trigger when 10% visible
      }
    );

    const currentTarget = observerTarget.current;
    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreProducts, loadingMore, hasMore]);

  // Fallback scroll handler (more reliable)
  useEffect(() => {
    const handleScroll = () => {
      if (loadingRef.current || !hasMore || loadingMore) {
        return;
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPosition = scrollTop + windowHeight;
      const threshold = documentHeight - 400; // Trigger 400px before bottom

      console.log("[ScrollHandler] Scroll check:", {
        scrollPosition,
        threshold,
        documentHeight,
        shouldLoad: scrollPosition >= threshold
      });

      if (scrollPosition >= threshold) {
        console.log("[ScrollHandler] ✅ Triggering loadMoreProducts");
        loadMoreProducts();
      }
    };

    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    // Check immediately in case page is already scrolled
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [loadMoreProducts, loadingMore, hasMore]);

  const nextBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="flex flex-col min-h-screen gap-10 pb-10">
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

      {/* Hierarchical Categories Section */}
      <section className="container relative overflow-hidden">
        {/* Ambient background glows for dark mode depth */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000" />

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative group/title-icon">
              <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover/title-icon:opacity-40 transition-opacity" />
              <div className="relative h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 ring-1 ring-white/20">
                <LayoutGrid className="h-8 w-8" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 leading-tight">
                Browse Categories
              </h2>
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
                <p className="text-primary text-xs uppercase font-black tracking-[0.3em] opacity-90">Discover by subcategory</p>
              </div>
            </div>
          </div>
          <Link to="/shop" className="group flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-primary hover:text-foreground transition-all">
            <span className="relative">
              Explore All Collection
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </span>
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-primary/30">
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10 min-h-[600px]">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-[3.5rem] bg-muted/40 animate-pulse border border-border/50" />
            ))
          ) : categories && categories.length > 0 ? (
            categories.slice(0, 6).map((cat, i) => (
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

                {/* Precise Top Rim Light */}
                <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 dark:via-white/20 to-transparent" />

                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="space-y-3">
                    <Link to={`/shop?category=${cat.categoryFirstId || cat.id}`}>
                      <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-all duration-300 uppercase italic tracking-tighter leading-[0.85] flex flex-col">
                        <span className="text-primary/50 text-[10px] italic normal-case tracking-[0.2em] mb-2 font-black">PREMIUM SERIES</span>
                        {cat.categoryFirstName || cat.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3">
                      <div className="h-[2px] w-6 bg-primary/40 rounded-full group-hover:w-10 group-hover:bg-primary transition-all" />
                      <p className="text-[10px] text-muted-foreground font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                        {cat.categoryFirstList?.length || 0} Subcategories
                      </p>
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
            ))
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

      {/* Featured Products Section */}
      <section className="container py-12 mb-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-muted-foreground mt-2">Quality products selected just for you.</p>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div
          key={loading ? 'loading' : 'loaded'}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5"
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
            : products.map((product, i) => (
              <motion.div
                key={`${product.pid || product.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (i % 20) * 0.05, duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
        </div>

        {/* Intersection Observer Target - Invisible element at bottom */}
        <div ref={observerTarget} className="h-20 w-full flex items-center justify-center">
          {hasMore && !loadingMore && (
            <div className="text-xs text-muted-foreground opacity-50">
              Scroll for more products...
            </div>
          )}
        </div>
        
        {/* Loading indicator at bottom for infinite scroll */}
        {loadingMore && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading more products...</span>
            </div>
          </div>
        )}
        
      
        
        {/* End message when all products are shown - Only show after multiple failed attempts */}
        {!loading && !loadingMore && !hasMore && products.length > 0 && page > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8 space-y-2"
          >
            <p className="text-muted-foreground text-sm">
              You've reached the end of our collection
            </p>
            {page <= 3 && (
              <p className="text-xs text-muted-foreground/70">
                Showing {products.length} products
              </p>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Home;
