import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import ProductCard from "@/modules/user/components/ProductCard";
import SkeletonCard from "@/modules/user/components/SkeletonCard";
import { Button } from "@/components/ui/button";

const banners = [
  {
    id: 1,
    title: "Summer Collection 2024",
    description: "Discover the hottest trends for the season.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    cta: "Shop Now",
    link: "/shop",
  },
  {
    id: 2,
    title: "Tech Revolution",
    description: "Upgrade your gear with our latest electronics.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
    cta: "Explore Gadgets",
    link: "/shop?category=Electronics",
  },
  {
    id: 3,
    title: "Home & Living",
    description: "Make your home a sanctuary.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
    cta: "View Collection",
    link: "/shop?category=Home & Living",
  },
];

const Home = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="flex flex-col min-h-screen gap-10 pb-10">
      {/* Hero Section */}
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
                  <Link to={banners[currentBanner].link}>
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

      {/* Categories Section */}
      <section className="container py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground mt-2">Explore our curated collections for every need.</p>
          </div>
          <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity border-b-2 border-primary pb-1">
            Browse All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} aspectRatio="portrait" />
            ))
            : categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/shop?category=${cat.name}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center transform transition-transform duration-500">
                    <span className="text-white font-bold text-xl tracking-wide group-hover:mb-2 transition-all">
                      {cat.name}
                    </span>
                    <span className="text-white/0 group-hover:text-white/80 text-xs font-medium uppercase tracking-widest transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      View Collection
                    </span>
                  </div>
                </Link>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
            : products.slice(0, visibleProducts).map((product, i) => (
              <motion.div
                key={product.id}
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
