import React, { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    LayoutGrid,
    List,
    ChevronRight,
    ShieldCheck,
    TrendingUp,
    AlertTriangle,
    ExternalLink,
    Edit2
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
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productsService.getSupplierProducts();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        setFilteredProducts(
            products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
        );
    }, [searchQuery, products]);

    const handleEditPricing = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
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
            </div>

            {/* Filters Bar */}
            <Card className="border-none bg-muted/40 shadow-none">
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by product name or global ID..."
                            className="pl-10 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2 shrink-0">
                        <Filter className="h-4 w-4" /> Categories
                    </Button>
                    <Button className="gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700">
                        <TrendingUp className="h-4 w-4" /> Bulk Margin Editor
                    </Button>
                </CardContent>
            </Card>

            {/* Products Display */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-80 bg-card rounded-xl border animate-pulse" />
                    ))}
                </div>
            ) : (
                <AnimatePresence>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product, i) => (
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
                                                <span className="font-medium text-muted-foreground">${product.supplierPrice}</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5 border-l pl-3 border-muted-foreground/20">
                                                <span className="text-[10px] text-primary uppercase font-bold tracking-tighter italic">Your Price</span>
                                                <span className="font-bold text-primary">${product.price}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground font-medium">Profit Margin</span>
                                                <span className="text-xs font-bold text-green-600">+{product.margin}%</span>
                                            </div>
                                            <Button size="sm" className="gap-2 rounded-full px-4" onClick={() => handleEditPricing(product)}>
                                                <Edit2 className="h-3 w-3" /> Edit Pricing
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
                                            {filteredProducts.map((product) => (
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
                                                    <td className="px-6 py-4 text-muted-foreground">${product.supplierPrice}</td>
                                                    <td className="px-6 py-4 text-green-600 font-medium">+{product.margin}%</td>
                                                    <td className="px-6 py-4 font-bold text-primary">${product.price}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Badge variant={product.stock > 10 ? "outline" : "destructive"} className="rounded-full">
                                                            {product.stock}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditPricing(product)}>
                                                            <Edit2 className="h-4 w-4" />
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
