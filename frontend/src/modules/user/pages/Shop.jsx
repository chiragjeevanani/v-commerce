import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal, Loader2 } from "lucide-react";
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
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const categoryParam = searchParams.get("category");
      const searchParam = searchParams.get("search");

      const params = {
        page: pageNumber,
        size: 20,
        categoryId: categoryParam || undefined,
        keyWord: searchParam || undefined
      };

      const result = await productsService.getSupplierProducts(params);

      if (result && result.products) {
        if (pageNumber === 1) {
          setProducts(result.products);
        } else {
          setProducts(prev => [...prev, ...result.products]);
        }
        setHasMore(result.products.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching products", error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [searchParams]);

  useEffect(() => {
    if (page > 1) {
      fetchProducts(page);
    }
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const bodyHeight = document.documentElement.scrollHeight;

      // When within 500px of bottom
      if (windowHeight + scrollY >= bodyHeight - 500) {
        console.log("Triggering next page", page + 1);
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore, page]);

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
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0 space-y-8">
          <FilterContent />
        </div>

        {/* Mobile Filter & Content */}
        <div className="flex-1">
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
              {(hasMore || loadingMore) && (
                <div className="h-20 flex items-center justify-center mt-8 mb-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading more products...</span>
                </div>
              )}
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
