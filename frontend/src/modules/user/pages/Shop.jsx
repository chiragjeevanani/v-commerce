import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Filter, SlidersHorizontal, Loader2, ArrowLeft, Search } from "lucide-react";
import { productsService } from "@/modules/admin/services/products.service";
import ProductCard from "@/modules/user/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonCard from "@/modules/user/components/SkeletonCard";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set("search", searchInput.trim());
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(20);
  const observerTarget = useRef(null);
  
  // Refs for infinite scroll control
  const loadingRef = useRef(false);
  const lastRequestTime = useRef(0);
  const minRequestInterval = 1500; // 1.5 seconds between requests

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoriesResult = await productsService.fetchCategories();
        if (categoriesResult) {
          const flattened = [];
          categoriesResult.forEach(c1 => {
            flattened.push({ id: c1.categoryFirstId, name: c1.categoryFirstName, level: 1 });
            c1.categoryFirstList?.forEach(c2 => {
              flattened.push({ id: c2.categorySecondId, name: c2.categorySecondName, level: 2 });
              c2.categorySecondList?.forEach(c3 => {
                flattened.push({ id: c3.categoryId, name: c3.categoryName, level: 3 });
              });
            });
          });
          setCategories(flattened);
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchInitialData();
  }, []);

  const fetchProducts = async (pageNumber, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      loadingRef.current = true;
    } else {
      // Rate limiting for infinite scroll
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < minRequestInterval) {
        const waitTime = minRequestInterval - timeSinceLastRequest;
        console.log(`[Shop LoadMore] Rate limiting: waiting ${waitTime}ms before next request`);
        setTimeout(() => {
          if (!loadingRef.current && hasMore) {
            fetchProducts(pageNumber, isInitial);
          }
        }, waitTime);
        return;
      }
      setLoadingMore(true);
      loadingRef.current = true;
      lastRequestTime.current = now;
    }

    try {
      const categoryParam = searchParams.get("category");
      const searchParam = searchParams.get("search");

      const params = {
        page: pageNumber,
        size: 20,
        categoryId: categoryParam || undefined,
        keyWord: searchParam || undefined,
        skipCache: !isInitial // Skip cache for infinite scroll
      };

      console.log(`[Shop] Fetching page ${pageNumber}...`);
      const result = await productsService.getSupplierProducts(params);

      if (result && result.products) {
        if (pageNumber === 1) {
          setProducts(result.products);
          // Set hasMore based on totalPages
          const totalPages = result.totalPages;
          const hasMoreProducts = totalPages 
            ? pageNumber < totalPages 
            : result.products.length >= 20;
          setHasMore(hasMoreProducts);
          console.log(`[Shop InitialLoad] Loaded ${result.products.length} products, Page ${pageNumber}/${totalPages || '?'}, hasMore: ${hasMoreProducts}`);
        } else {
          setProducts(prev => {
            // Filter out duplicates
            const existingIds = new Set();
            const existingPids = new Set();
            
            prev.forEach(p => {
              if (p.id) existingIds.add(String(p.id));
              if (p.pid) existingPids.add(String(p.pid));
            });
            
            const uniqueNewProducts = result.products.filter(
              p => {
                const productId = p.id;
                const productPid = p.pid;
                
                const existsById = productId && existingIds.has(String(productId));
                const existsByPid = productPid && existingPids.has(String(productPid));
                
                if (existsById || existsByPid) {
                  return false; // Duplicate
                }
                
                if (productId) existingIds.add(String(productId));
                if (productPid) existingPids.add(String(productPid));
                
                return true; // New product
              }
            );
            
            if (uniqueNewProducts.length === 0 && result.products.length > 0) {
              console.warn(`[Shop LoadMore] ⚠️ All ${result.products.length} products from page ${pageNumber} are duplicates!`);
              if (pageNumber > 2) {
                console.warn(`[Shop LoadMore] ⛔ Stopping infinite scroll - CJ API returning duplicates (page ${pageNumber})`);
                setHasMore(false);
                return prev;
              }
            }
            
            const newProducts = [...prev, ...uniqueNewProducts];
            console.log(`[Shop LoadMore] ✅ Added ${uniqueNewProducts.length} new products (${result.products.length - uniqueNewProducts.length} duplicates filtered), Total: ${newProducts.length}`);
            return newProducts;
          });
          
          // Set hasMore based on totalPages
          const totalPages = result.totalPages;
          const hasMoreProducts = totalPages 
            ? pageNumber < totalPages 
            : result.products.length >= 20;
          setHasMore(hasMoreProducts);
          console.log(`[Shop LoadMore] Page ${pageNumber}/${totalPages || '?'}, Has more products: ${hasMoreProducts}`);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("[Shop] Error fetching products", error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    loadingRef.current = false;
    fetchProducts(1, true);
  }, [searchParams, location.key]);

  // Infinite scroll with IntersectionObserver
  const loadMoreProducts = useCallback(async () => {
    if (loadingRef.current || loading || loadingMore || !hasMore) {
      return;
    }

    const nextPage = page + 1;
    console.log(`[Shop LoadMore] Loading page ${nextPage}...`);
    await fetchProducts(nextPage, false);
    setPage(nextPage);
  }, [page, loading, loadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loadingRef.current && !loading && !loadingMore && hasMore) {
          const now = Date.now();
          const timeSinceLastRequest = now - lastRequestTime.current;
          
          if (timeSinceLastRequest >= minRequestInterval) {
            console.log(`[Shop IntersectionObserver] ✅ Triggering loadMoreProducts`);
            loadMoreProducts();
          } else {
            const waitTime = minRequestInterval - timeSinceLastRequest;
            console.log(`[Shop IntersectionObserver] Rate limited: ${waitTime}ms remaining`);
          }
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0.1
      }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [loadMoreProducts, loading, loadingMore, hasMore]);

  // Fallback scroll handler (throttled)
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore || loadingRef.current) return;

      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const bodyHeight = document.documentElement.scrollHeight;
      const threshold = bodyHeight - 400;

      if (windowHeight + scrollY >= threshold) {
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime.current;
        
        if (timeSinceLastRequest >= minRequestInterval) {
          console.log(`[Shop ScrollHandler] ✅ Triggering loadMoreProducts`);
          loadMoreProducts();
        }
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
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [loadMoreProducts, loading, loadingMore, hasMore]);

  // Apply local filtering to the products we have (Price & Sort)
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // Price Filter
    result = result.filter(p => {
      const priceStr = String(p.sellPrice || '0');
      const minPrice = priceStr.includes('-') ? parseFloat(priceStr.split('-')[0]) : parseFloat(priceStr);
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Sorting
    if (sortOption === "price-asc") {
      result.sort((a, b) => {
        const pA = String(a.sellPrice).includes('-') ? parseFloat(a.sellPrice.split('-')[0]) : parseFloat(a.sellPrice);
        const pB = String(b.sellPrice).includes('-') ? parseFloat(b.sellPrice.split('-')[0]) : parseFloat(b.sellPrice);
        return pA - pB;
      });
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => {
        const pA = String(a.sellPrice).includes('-') ? parseFloat(a.sellPrice.split('-')[0]) : parseFloat(a.sellPrice);
        const pB = String(b.sellPrice).includes('-') ? parseFloat(b.sellPrice.split('-')[0]) : parseFloat(b.sellPrice);
        return pB - pA;
      });
    }

    return result;
  }, [products, priceRange, sortOption]);

  const toggleCategory = (categoryId) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategories.includes(categoryId)) {
      newParams.delete("category");
      setSelectedCategories([]);
    } else {
      newParams.set("category", categoryId);
      setSelectedCategories([categoryId]);
    }
    setSearchParams(newParams);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
          {categories.filter(c => c.level === 1).map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2 py-1">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <label htmlFor={`cat-${cat.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                {cat.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <Slider
          defaultValue={[0, 1000]}
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6 -ml-2 hover:bg-transparent hover:text-primary transition-colors group" onClick={() => navigate("/")}>
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
      </Button>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0 space-y-8">
          <FilterContent />
        </div>

        {/* Mobile Filter & Content */}
        <div className="flex-1">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search products..."
                className="w-full md:max-w-sm h-11 pl-11 pr-4 rounded-xl bg-muted/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </form>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shop</h1>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription className="sr-only">
                      Filter products by category and price range.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, i) => (
                    <motion.div
                      layout
                      key={product.id || i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: i % 20 * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              {/* Observer target for infinite scroll */}
              <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8 mb-20">
                {loadingMore ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading more products...</span>
                  </>
                ) : hasMore ? (
                  <span className="text-sm text-muted-foreground">Scroll for more products...</span>
                ) : products.length > 0 ? (
                  <span className="text-sm text-muted-foreground">You've reached the end of our collection</span>
                ) : null}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No products found.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange([0, 1000]);
                  setSearchParams({});
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
