import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    LayoutGrid,
    List,
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
    TrendingUp,
    AlertTriangle,
    ExternalLink,
    Eye,
    ArrowLeft,
    FolderOpen
} from 'lucide-react';
import { productsService } from '../services/products.service';
import PriceMarginModal from '../components/PriceMarginModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [viewState, setViewState] = useState('products'); // Default to products view
    const [categoryPath, setCategoryPath] = useState([]); // Track hierarchy: [Level1Obj, Level2Obj]
    const [products, setProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]); // Raw nested data from API
    const [displayCategories, setDisplayCategories] = useState([]); // Categories to show in current view
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use refs to prevent concurrent duplicate API calls
    const fetchingProductsRef = useRef(false);
    const fetchingCategoriesRef = useRef(false);

    const fetchProducts = async () => {
        if (fetchingProductsRef.current) return;
        fetchingProductsRef.current = true;
        setLoading(true);
        try {
            const data = await productsService.getSupplierProducts({
                page,
                size: 20,
                keyWord: searchQuery,
                categoryId: selectedCategory
            });
            setProducts(data.products);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast({
                title: "Error",
                description: "Failed to fetch products from CJ API.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            fetchingProductsRef.current = false;
        }
    };

    const fetchCategories = async () => {
        if (fetchingCategoriesRef.current) return;
        fetchingCategoriesRef.current = true;
        setLoading(true);
        try {
            const data = await productsService.fetchCategories();
            setAllCategories(data);
            setDisplayCategories(data.map(c => ({
                id: c.categoryFirstId,
                name: c.categoryFirstName,
                subList: c.categoryFirstList,
                level: 1
            })));
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
            fetchingCategoriesRef.current = false;
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, selectedCategory]);

    const handleCategorySelect = (cat) => {
        if (cat.level === 1) {
            // Drill into Level 2
            setCategoryPath([cat]);
            setDisplayCategories(cat.subList.map(s => ({
                id: s.categorySecondId,
                name: s.categorySecondName,
                subList: s.categorySecondList,
                level: 2
            })));
        } else if (cat.level === 2) {
            // Drill into Level 3
            setCategoryPath(prev => [...prev, cat]);
            setDisplayCategories(cat.subList.map(t => ({
                id: t.categoryId,
                name: t.categoryName,
                level: 3
            })));
        } else {
            // Level 3 selected - show products
            setSelectedCategory(cat.id);
            setPage(1);
            setViewState('products');
        }
    };

    const handleBackCategory = () => {
        if (categoryPath.length === 2) {
            // From Level 3 back to Level 2
            const level1 = categoryPath[0];
            setCategoryPath([level1]);
            setDisplayCategories(level1.subList.map(s => ({
                id: s.categorySecondId,
                name: s.categorySecondName,
                subList: s.categorySecondList,
                level: 2
            })));
        } else if (categoryPath.length === 1) {
            // From Level 2 back to Level 1
            resetToCategories();
        }
    };

    const resetToCategories = () => {
        setCategoryPath([]);
        setSelectedCategory("");
        setViewState('categories');
        setSearchQuery("");
        // Reset to Level 1
        setDisplayCategories(allCategories.map(c => ({
            id: c.categoryFirstId,
            name: c.categoryFirstName,
            subList: c.categoryFirstList,
            level: 1
        })));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProducts();
    };

    const handleEditPricing = (product) => {
        navigate(`/admin/products/${product.id}`);
    };

    const handleSavePricing = async (settings) => {
        try {
            await productsService.updateProductMargin(selectedProduct.id, settings.margin);
            toast({
                title: "Pricing updated",
                description: "Product markup and visibility saved successfully.",
            });
            setIsModalOpen(false);
        } catch (err) {
            toast({
                title: "Update failed",
                description: "There was an error saving pricing settings.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Supplied Products</h1>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 border-indigo-200">API Synced</Badge>
                    </div>
                    <p className="text-muted-foreground">Manage markups for products synced from the global dropship network.</p>
                </div>
                {viewState === 'products' && (
                    <div className="flex items-center gap-2">
                        <div className="flex bg-muted rounded-lg p-1 border">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters Bar */}
            <Card className="border-none bg-muted/40 shadow-none">
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by product name or global ID..."
                            className="pl-10 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit" className="hidden">Search</Button>
                    </form>

                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Categories</option>
                        {allCategories.map((first) => (
                            <optgroup key={first.categoryFirstId} label={first.categoryFirstName}>
                                {first.categoryFirstList?.map(second => (
                                    <React.Fragment key={second.categorySecondId}>
                                        <option value={second.categorySecondId}>-- {second.categorySecondName}</option>
                                        {second.categorySecondList?.map(third => (
                                            <option key={third.categoryId} value={third.categoryId}>
                                                &nbsp;&nbsp;&nbsp;&nbsp;{third.categoryName}
                                            </option>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                    {/* <Button className="gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700">
                        <TrendingUp className="h-4 w-4" /> Bulk Margin Editor
                    </Button> */}
                </CardContent>
            </Card>

            {/* Products Display */}
            {loading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-80 bg-card rounded-xl border animate-pulse" />
                    ))}
                </div>
            ) : (
                <AnimatePresence>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product, i) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={product.id}
                                    className="group relative bg-card rounded-2xl border hover:shadow-xl transition-all overflow-hidden flex flex-col"
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                                            <Badge className="bg-green-500 hover:bg-green-600 border-none">
                                                In Stock: {product.stock}
                                            </Badge>
                                            <Badge variant="secondary" className="backdrop-blur-md bg-white/50 border-white/20">
                                                {product.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col gap-4">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] leading-tight">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                <ShieldCheck className="h-3 w-3 text-indigo-500" />
                                                Verified Supplier
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-xl border border-muted-foreground/10 text-xs">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Supplier Price</span>
                                                <span className="font-medium text-muted-foreground">₹{product.supplierPrice}</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5 border-l pl-3 border-muted-foreground/20">
                                                <span className="text-[10px] text-primary uppercase font-bold tracking-tighter italic">Your Price</span>
                                                <span className="font-bold text-primary">₹{product.price}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground font-medium">Profit Margin</span>
                                                <span className="text-xs font-bold text-green-600">+{product.margin}%</span>
                                            </div>
                                            <Button size="sm" className="gap-2 rounded-full px-4" onClick={() => handleEditPricing(product)}>
                                                <Eye className="h-3 w-3" /> View Product
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/30">
                                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Product</th>
                                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Category</th>
                                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Supplier Cost</th>
                                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Markup</th>
                                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground text-primary font-bold italic">Selling Price</th>
                                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Stock</th>
                                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product, i) => (
                                                <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded border overflow-hidden shrink-0">
                                                                <img src={product.image} className="h-full w-full object-cover" />
                                                            </div>
                                                            <span className="font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">{product.category}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">₹{product.supplierPrice}</td>
                                                    <td className="px-6 py-4 text-green-600 font-medium">+{product.margin}%</td>
                                                    <td className="px-6 py-4 font-bold text-primary">₹{product.price}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Badge variant={product.stock > 10 ? "outline" : "destructive"} className="rounded-full">
                                                            {product.stock}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => handleEditPricing(product)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </AnimatePresence>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (page <= 3) pageNum = i + 1;
                            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = page - 2 + i;

                            return (
                                <Button
                                    key={pageNum}
                                    variant={page === pageNum ? "primary" : "outline"}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setPage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Sync Disclaimer */}
            <div className="flex items-center justify-center gap-4 py-8 opacity-40 hover:opacity-100 transition-opacity">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-xs max-w-lg text-center font-medium">
                    As a dropshipping platform, product details are automatically managed by the supplier API.
                    V-COMMERCE admins can only control markup percentages and storefront visibility.
                </p>
            </div>

            <PriceMarginModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePricing}
            />
        </div>
    );
};

export default Products;
