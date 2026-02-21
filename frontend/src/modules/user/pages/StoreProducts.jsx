import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Filter, Loader2, ArrowLeft, Search } from "lucide-react";
import { storeProductService } from "@/modules/admin/services/storeProduct.service";
import { categoryService } from "@/modules/admin/services/category.service";
import StoreProductCard from "@/modules/user/components/StoreProductCard";
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

const StoreProducts = () => {
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
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [sliderValue, setSliderValue] = useState([0, 100000]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [sortOption, setSortOption] = useState("newest");
    const debounceTimer = useRef(null);

    useEffect(() => {
        fetchCategories();
    }, [location.key]);

    useEffect(() => {
        if (selectedCategories.length > 0) {
            fetchSubcategories(selectedCategories[0]);
        } else {
            setSubcategories([]);
            setSelectedSubcategories([]);
        }
    }, [selectedCategories]);

    useEffect(() => {
        setPage(1);
        fetchProducts(1, true);
    }, [searchParams, location.key]);

    useEffect(() => {
        if (page > 1) {
            fetchProducts(page, false);
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
                setPage(prev => prev + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, loadingMore, hasMore, page]);

    const fetchCategories = async () => {
        try {
            const result = await categoryService.getActiveCategories();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const fetchSubcategories = async (categoryId) => {
        try {
            const result = await categoryService.getSubcategoriesByCategory(categoryId);
            if (result.success) {
                setSubcategories(result.data.filter(sub => sub.isActive));
            }
        } catch (error) {
            console.error("Error fetching subcategories", error);
            setSubcategories([]);
        }
    };

    const fetchProducts = async (pageNumber, isInitial = false) => {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            const categoryParam = searchParams.get("category");
            const subcategoryParam = searchParams.get("subcategory");
            const searchParam = searchParams.get("search");

            const params = {
                page: pageNumber,
                limit: 20,
            };

            if (searchParam) params.search = searchParam;
            if (categoryParam) params.categoryId = categoryParam;
            if (subcategoryParam) params.subcategoryId = subcategoryParam;

            const result = await storeProductService.getActiveProducts(params);

            if (result.success) {
                if (pageNumber === 1) {
                    setProducts(result.data);
                } else {
                    setProducts(prev => [...prev, ...result.data]);
                }
                setHasMore(result.data.length === 20);
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

    const toggleCategory = (categoryId) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedCategories.includes(categoryId)) {
            newParams.delete("category");
            setSelectedCategories([]);
            setSelectedSubcategories([]);
        } else {
            newParams.set("category", categoryId);
            setSelectedCategories([categoryId]);
            setSelectedSubcategories([]);
        }
        setSearchParams(newParams);
    };

    const toggleSubcategory = (subcategoryId) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedSubcategories.includes(subcategoryId)) {
            newParams.delete("subcategory");
            setSelectedSubcategories(prev => prev.filter(id => id !== subcategoryId));
        } else {
            newParams.set("subcategory", subcategoryId);
            setSelectedSubcategories(prev => [...prev, subcategoryId]);
        }
        setSearchParams(newParams);
    };

    // Apply local filtering to the products we have (Price & Sort) - Optimized for performance
    const filteredProducts = React.useMemo(() => {
        if (products.length === 0) return [];

        const [minPrice, maxPrice] = priceRange;
        
        // Pre-compute prices to avoid repeated calculations
        const productsWithPrice = products.map(p => ({
            ...p,
            _computedPrice: p.price || 0
        }));

        // Price Filter - optimized
        let result = productsWithPrice.filter(p => {
            return p._computedPrice >= minPrice && p._computedPrice <= maxPrice;
        });

        // Sorting - optimized
        if (sortOption === "price-low") {
            result.sort((a, b) => a._computedPrice - b._computedPrice);
        } else if (sortOption === "price-high") {
            result.sort((a, b) => b._computedPrice - a._computedPrice);
        } else if (sortOption === "name") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        // Remove computed price before returning
        return result.map(({ _computedPrice, ...rest }) => rest);
    }, [products, priceRange, sortOption]);

    // Calculate max price for slider
    const maxPrice = React.useMemo(() => {
        if (products.length === 0) return 100000;
        return Math.max(...products.map(p => p.price || 0), 100000);
    }, [products]);

    // Update priceRange when sliderValue changes (with optimized debounce for smooth performance)
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        // Use requestAnimationFrame for immediate visual feedback, then debounce the filter
        const rafId = requestAnimationFrame(() => {
            debounceTimer.current = setTimeout(() => {
                setPriceRange(sliderValue);
            }, 100); // Reduced to 100ms for smoother feel
        });

        return () => {
            cancelAnimationFrame(rafId);
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [sliderValue]);

    // Update sliderValue when maxPrice changes
    useEffect(() => {
        if (maxPrice > 0) {
            const currentMax = sliderValue[1];
            if (currentMax > maxPrice || currentMax === 0) {
                const newValue = [sliderValue[0], maxPrice];
                setSliderValue(newValue);
                setPriceRange(newValue);
            }
        }
    }, [maxPrice]);

    const FilterContent = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                    {categories.map((cat) => (
                        <div key={cat._id} className="space-y-1">
                            <div className="flex items-center space-x-2 py-1">
                                <Checkbox
                                    id={`cat-${cat._id}`}
                                    checked={selectedCategories.includes(cat._id)}
                                    onCheckedChange={() => toggleCategory(cat._id)}
                                />
                                <label htmlFor={`cat-${cat._id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                    {cat.name}
                                </label>
                            </div>
                            {selectedCategories.includes(cat._id) && subcategories.length > 0 && (
                                <div className="ml-6 space-y-1">
                                    {subcategories.map((subcat) => (
                                        <div key={subcat._id} className="flex items-center space-x-2 py-1">
                                            <Checkbox
                                                id={`subcat-${subcat._id}`}
                                                checked={selectedSubcategories.includes(subcat._id)}
                                                onCheckedChange={() => toggleSubcategory(subcat._id)}
                                            />
                                            <label htmlFor={`subcat-${subcat._id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                {subcat.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                <Slider
                    max={maxPrice}
                    min={0}
                    step={Math.max(100, Math.floor(maxPrice / 200))}
                    value={sliderValue}
                    onValueChange={(value) => {
                        // Immediate update for smooth UI
                        setSliderValue(value);
                    }}
                    className="mb-4"
                />
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">₹{Math.round(sliderValue[0]).toLocaleString('en-IN')}</span>
                    <span className="font-medium">₹{Math.round(sliderValue[1]).toLocaleString('en-IN')}</span>
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
                                placeholder="Search store products..."
                                className="w-full md:max-w-sm h-11 pl-11 pr-4 rounded-xl bg-muted/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </form>
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Store Products</h1>
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
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="name">Name: A-Z</SelectItem>
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
                                            key={product._id || i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: i % 20 * 0.05 }}
                                        >
                                            <StoreProductCard product={product} />
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
                                    setSelectedSubcategories([]);
                                    setPriceRange([0, maxPrice]);
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

export default StoreProducts;
