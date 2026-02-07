import React, { useState, useEffect } from "react";
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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(20);

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryParam = searchParams.get("category");
        const searchParam = searchParams.get("search");

        // Update local state if URL contains category
        if (categoryParam && !selectedCategories.includes(categoryParam)) {
          setSelectedCategories([categoryParam]);
        } else if (!categoryParam && selectedCategories.length > 0) {
          // If category param is removed from URL, clear selected categories
          setSelectedCategories([]);
        }

        const params = {
          page: 1,
          size: 60,
          categoryId: categoryParam || undefined,
          keyWord: searchParam || undefined
        };

        const productsResult = await productsService.getSupplierProducts(params);

        if (productsResult && productsResult.products) {
          setProducts(productsResult.products);
        }
      } catch (error) {
        console.error("Error fetching products", error);
        toast({
          title: "Network Error",
          description: "Unable to load products.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]); // Re-fetch when URL params change

  useEffect(() => {
    let result = [...products];
    const searchParam = searchParams.get("search");

    // Search
    if (searchParam) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.productNameEn.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.description.toLowerCase().includes(searchParam.toLowerCase())
      );
    }

    // Category Filter
    // If we have a category in the URL, the backend already filtered it.
    // We only apply local filtering if multiple categories are selected manually in the sidebar
    // AND we are not already filtered by a specific parent category from the URL.
    const urlCategory = searchParams.get("category");
    if (selectedCategories.length > 0 && !urlCategory) {
      result = result.filter(p => selectedCategories.includes(p.categoryId));
    }

    // Price Filter
    result = result.filter(p => {
      // Handle potential price range strings from CJ
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
    // "featured" is default order

    setFilteredProducts(result);
    setVisibleCount(20); // Reset visible count on filter change
  }, [products, selectedCategories, priceRange, sortOption, searchParams]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

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
                  {filteredProducts.slice(0, visibleCount).map((product, i) => (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: i < 20 ? i * 0.05 : 0 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              {visibleCount < filteredProducts.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="mt-12 text-center"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 hover:bg-primary hover:text-white transition-all"
                    onClick={loadMore}
                  >
                    Explore More
                  </Button>
                </motion.div>
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
