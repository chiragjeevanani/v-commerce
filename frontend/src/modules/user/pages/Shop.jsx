import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal } from "lucide-react";
import { api } from "@/services/api";
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
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);

        // Initial filter from URL
        const categoryParam = searchParams.get("category");
        if (categoryParam) {
          setSelectedCategories([categoryParam]);
        }

        const searchParam = searchParams.get("search");
        // Search logic handled in filtering effect

      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...products];
    const searchParam = searchParams.get("search");

    // Search
    if (searchParam) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.description.toLowerCase().includes(searchParam.toLowerCase())
      );
    }

    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Price Filter
    result = result.filter(p => {
      const price = p.discountPrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    if (sortOption === "price-asc") {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    }
    // "featured" is default order

    setFilteredProducts(result);
    setVisibleCount(6); // Reset visible count on filter change
  }, [products, selectedCategories, priceRange, sortOption, searchParams]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const toggleCategory = (categoryName) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.name)}
                onCheckedChange={() => toggleCategory(cat.name)}
              />
              <label htmlFor={`cat-${cat.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
              {Array.from({ length: 8 }).map((_, i) => (
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
                      transition={{ duration: 0.3, delay: i < 6 ? i * 0.05 : 0 }}
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
