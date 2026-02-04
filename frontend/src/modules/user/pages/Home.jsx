import React, { useEffect, useState } from "react";
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
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch hero banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('https://v-commerce.onrender.com/api/v1/hero-banners');
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

  useEffect(() => {
    // Rely on productsService's atomic deduplication as the primary shield
    // But also prevent state setting on unmounted components
    let isMounted = true;

    const fetchData = async () => {
      if (!initialFetchAttempted) {
        setLoading(true);
      }

      try {
        const [productsResult, categoriesResult] = await Promise.all([
          productsService.getSupplierProducts({ page: 1, size: 24 }),
          productsService.fetchCategories(),
        ]);

        if (isMounted) {
          if (productsResult?.products) setProducts(productsResult.products);
          if (categoriesResult) setCategories(categoriesResult);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
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

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || visibleProducts >= products.length) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 500;

      if (scrollPosition >= threshold) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleProducts(prev => Math.min(prev + 8, products.length));
          setLoadingMore(false);
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, visibleProducts, products.length]);

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
      <section className="container py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Browse Categories</h2>
              <p className="text-muted-foreground text-sm uppercase font-bold tracking-tighter opacity-50">Discover by subcategory</p>
            </div>
          </div>
          <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-indigo-600 hover:opacity-70 transition-opacity flex items-center gap-2">
            Explore All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
            ))
            : categories.slice(0, 6).map((cat, i) => (
              <motion.div
                key={cat.categoryFirstId}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden bg-white hover:bg-indigo-50/30 border border-slate-100 rounded-[2rem] p-6 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <Link to={`/shop?category=${cat.categoryFirstId}`}>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">
                        {cat.categoryFirstName}
                      </h3>
                    </Link>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Popular Subcategories</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <Zap className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cat.categoryFirstList?.slice(0, 5).map((sub, idx) => (
                    <Link
                      key={sub.categorySecondId}
                      to={`/shop?category=${sub.categorySecondId}`}
                      className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-300"
                    >
                      {sub.categorySecondName}
                    </Link>
                  ))}
                  {cat.categoryFirstList?.length > 5 && (
                    <span className="text-[11px] font-bold text-indigo-600 py-1.5 px-2">
                      +{cat.categoryFirstList.length - 5} More
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
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
            ? Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
            : products.slice(0, visibleProducts).map((product, i) => (
              <motion.div
                key={product.pid || product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
        </div>

        {/* Loading indicator for infinite scroll */}
        {loadingMore && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading more products...</span>
            </div>
          </div>
        )}

        {/* End message when all products are shown */}
        {!loading && visibleProducts >= products.length && products.length > 8 && (
          <p className="text-center text-muted-foreground text-sm mt-8">
            You've reached the end of our collection
          </p>
        )}
      </section>
    </div>
  );
};

export default Home;
