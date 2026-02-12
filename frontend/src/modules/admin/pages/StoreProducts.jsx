import React, { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Trash2,
    Edit,
    Plus,
    Loader2,
    Eye,
    EyeOff,
    Filter,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { storeProductService } from '../services/storeProduct.service';
import { categoryService } from '../services/category.service';
import { useToast } from '@/hooks/use-toast';
import StoreProductForm from '../components/StoreProductForm';

const StoreProducts = () => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteProductConfirm, setDeleteProductConfirm] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(false);
    
    // Filters
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [filterActive, setFilterActive] = useState("all"); // all, active, inactive
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchSubcategories(selectedCategory);
        } else {
            setSubcategories([]);
            setSelectedSubcategory("");
        }
    }, [selectedCategory]);

    useEffect(() => {
        fetchProducts();
    }, [page, searchQuery, selectedCategory, selectedSubcategory, filterActive]);

    const fetchCategories = async () => {
        try {
            const result = await categoryService.getAllCategories();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    const fetchSubcategories = async (categoryId) => {
        try {
            const result = await categoryService.getSubcategoriesByCategory(categoryId);
            if (result.success) {
                setSubcategories(result.data);
            }
        } catch (error) {
            console.error("Failed to load subcategories:", error);
            setSubcategories([]);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 20,
            };
            
            if (searchQuery) params.search = searchQuery;
            if (selectedCategory) params.categoryId = selectedCategory;
            if (selectedSubcategory) params.subcategoryId = selectedSubcategory;
            if (filterActive !== 'all') params.isActive = filterActive === 'active';

            const result = await storeProductService.getAllProducts(params);
            if (result.success) {
                setProducts(result.data);
                setTotalPages(result.pagination.pages);
                setTotalProducts(result.pagination.total);
            }
        } catch (error) {
            console.error("Fetch Products Error:", error);
            toast({
                title: "Error",
                description: "Failed to load products.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = () => {
        setEditingProduct(null);
        setIsProductFormOpen(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsProductFormOpen(true);
    };

    const handleProductFormSuccess = () => {
        setIsProductFormOpen(false);
        setEditingProduct(null);
        fetchProducts();
    };

    const handleDeleteProduct = async () => {
        if (!deleteProductConfirm) return;
        setDeletingProduct(true);
        try {
            const result = await storeProductService.deleteProduct(deleteProductConfirm._id);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Product deleted successfully.",
                });
                fetchProducts();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to delete product.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setDeletingProduct(false);
            setDeleteProductConfirm(null);
        }
    };

    const handleToggleProductActive = async (product) => {
        try {
            const formData = new FormData();
            formData.append('name', product.name);
            formData.append('description', product.description);
            if (product.shortDescription) formData.append('shortDescription', product.shortDescription);
            formData.append('price', product.price);
            if (product.compareAtPrice) formData.append('compareAtPrice', product.compareAtPrice);
            if (product.sku) formData.append('sku', product.sku);
            formData.append('categoryId', product.categoryId._id || product.categoryId);
            if (product.subcategoryId) formData.append('subcategoryId', product.subcategoryId._id || product.subcategoryId);
            formData.append('stock', product.stock);
            formData.append('trackInventory', product.trackInventory);
            formData.append('isActive', !product.isActive);
            if (product.tags && product.tags.length > 0) formData.append('tags', product.tags.join(', '));
            formData.append('existingImages', JSON.stringify(product.images));

            const result = await storeProductService.updateProduct(product._id, formData);
            if (result.success) {
                toast({
                    title: "Success",
                    description: `Product ${!product.isActive ? 'activated' : 'deactivated'} successfully.`,
                });
                fetchProducts();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update product status.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const activeProductsCount = products.filter(p => p.isActive).length;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your store products (separate from dropshipping products).</p>
                </div>
                <Button onClick={handleCreateProduct} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Product
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Products</p>
                            <p className="text-2xl font-bold">{totalProducts}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600 dark:text-green-400">
                            <Eye className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Active Products</p>
                            <p className="text-2xl font-bold">{activeProductsCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                            <Filter className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Showing</p>
                            <p className="text-2xl font-bold">{products.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={selectedCategory || "all"} onValueChange={(value) => {
                                setSelectedCategory(value === "all" ? "" : value);
                                setPage(1);
                            }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedSubcategory || "all"} onValueChange={(value) => {
                                setSelectedSubcategory(value === "all" ? "" : value);
                                setPage(1);
                            }} disabled={!selectedCategory}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Subcategories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subcategories</SelectItem>
                                    {subcategories.map((subcat) => (
                                        <SelectItem key={subcat._id} value={subcat._id}>
                                            {subcat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterActive} onValueChange={(value) => {
                                setFilterActive(value);
                                setPage(1);
                            }}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-muted-foreground">Loading products...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-bold">No products found</h3>
                                <p className="text-muted-foreground mb-4">Create your first product to get started.</p>
                                <Button onClick={handleCreateProduct} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New Product
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {products.map((product, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={product._id}
                                        >
                                            <Card className="hover:shadow-lg transition-shadow">
                                                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                                                    <img
                                                        src={product.images[0] || '/placeholder-product.png'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <CardContent className="p-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h3 className="font-bold text-lg line-clamp-1 flex-1">{product.name}</h3>
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-7 w-7 hover:bg-blue-500 hover:text-white"
                                                                    onClick={() => handleEditProduct(product)}
                                                                    title="Edit Product"
                                                                >
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className={`h-7 w-7 ${product.isActive ? 'hover:bg-orange-500 hover:text-white' : 'hover:bg-green-500 hover:text-white'}`}
                                                                    onClick={() => handleToggleProductActive(product)}
                                                                    title={product.isActive ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    {product.isActive ? (
                                                                        <EyeOff className="h-3.5 w-3.5" />
                                                                    ) : (
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                    )}
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-7 w-7 hover:bg-red-500 hover:text-white"
                                                                    onClick={() => setDeleteProductConfirm(product)}
                                                                    title="Delete Product"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{product.shortDescription || product.description}</p>
                                                        <div className="flex items-center justify-between pt-2">
                                                            <div>
                                                                <span className="text-xl font-bold">₹{product.price}</span>
                                                                {product.compareAtPrice && (
                                                                    <span className="text-sm text-muted-foreground line-through ml-2">
                                                                        ₹{product.compareAtPrice}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Badge variant="outline" className={
                                                                product.isActive ? 'bg-green-50 text-green-700 border-green-200' :
                                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                                            }>
                                                                {product.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                                            <span>Stock: {product.stock}</span>
                                                            <span>SKU: {product.sku || 'N/A'}</span>
                                                        </div>
                                                        {product.categoryId && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Category: {product.categoryId.name}
                                                                {product.subcategoryId && ` > ${product.subcategoryId.name}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalProducts)} of {totalProducts} products
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <div className="text-sm">
                                                Page {page} of {totalPages}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Product Form Dialog */}
            <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                    <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                            <DialogDescription>
                                {editingProduct ? 'Update the product details below.' : 'Fill in the details to create a new product.'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 min-h-0">
                        <StoreProductForm
                            product={editingProduct}
                            onSuccess={handleProductFormSuccess}
                            onCancel={() => setIsProductFormOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteProductConfirm} onOpenChange={() => setDeleteProductConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteProductConfirm?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteProductConfirm(null)} disabled={deletingProduct}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProduct} disabled={deletingProduct}>
                            {deletingProduct ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StoreProducts;
