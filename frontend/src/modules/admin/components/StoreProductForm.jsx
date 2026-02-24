import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import { storeProductService } from '../services/storeProduct.service';
import { categoryService } from '../services/category.service';
import { useToast } from '@/hooks/use-toast';

const StoreProductForm = ({ product, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Image handling
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingImages, setExistingImages] = useState(product?.images || []);
    const [previewUrls, setPreviewUrls] = useState(product?.images || []);

    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        shortDescription: product?.shortDescription || '',
        price: product?.price || '',
        compareAtPrice: product?.compareAtPrice || '',
        sku: product?.sku || '',
        categoryId: product?.categoryId?._id || product?.categoryId || '',
        subcategoryId: product?.subcategoryId?._id || product?.subcategoryId || '',
        stock: product?.stock || 0,
        trackInventory: product?.trackInventory !== undefined ? product.trackInventory : true,
        isActive: product?.isActive !== undefined ? product.isActive : true,
        tags: product?.tags?.join(', ') || '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (formData.categoryId) {
            fetchSubcategories(formData.categoryId);
        } else {
            setSubcategories([]);
        }
    }, [formData.categoryId]);

    const fetchCategories = async () => {
        try {
            const result = await categoryService.getAllCategories();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load categories.",
                variant: "destructive",
            });
        } finally {
            setLoadingCategories(false);
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'categoryId') next.subcategoryId = '';
            return next;
        });
    };

    // Find selected category and check if it allows partial payment
    const selectedCategory = categories.find((c) => String(c._id) === String(formData.categoryId));
    const showPartialPaymentOption = selectedCategory?.allowPartialPayment === true;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);

        // Create preview URLs for new files
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        // Check if it's an existing image or a new file
        if (index < existingImages.length) {
            // Remove from existing images
            const newExisting = existingImages.filter((_, i) => i !== index);
            setExistingImages(newExisting);
            setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        } else {
            // Remove from new files
            const fileIndex = index - existingImages.length;
            const newFiles = selectedFiles.filter((_, i) => i !== fileIndex);
            const newPreviews = previewUrls.filter((_, i) => i !== index);
            setSelectedFiles(newFiles);
            setPreviewUrls(newPreviews);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        // Must have at least one image
        if (previewUrls.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please add at least one product image.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            if (formData.shortDescription) data.append('shortDescription', formData.shortDescription);
            data.append('price', formData.price);
            if (formData.compareAtPrice) data.append('compareAtPrice', formData.compareAtPrice);
            if (formData.sku) data.append('sku', formData.sku);
            data.append('categoryId', formData.categoryId);
            if (formData.subcategoryId) data.append('subcategoryId', formData.subcategoryId);
            data.append('stock', formData.stock);
            data.append('trackInventory', formData.trackInventory);
            data.append('isActive', formData.isActive);
            // Auto-set allowPartialPayment from category: all products in partial-payment category get it
            data.append('allowPartialPayment', showPartialPaymentOption);
            if (formData.tags) data.append('tags', formData.tags);

            // Append existing images if editing
            if (product && existingImages.length > 0) {
                data.append('existingImages', JSON.stringify(existingImages));
            }

            // Append new image files
            selectedFiles.forEach(file => {
                data.append('images', file);
            });

            let result;
            if (product) {
                result = await storeProductService.updateProduct(product._id, data);
            } else {
                result = await storeProductService.createProduct(data);
            }

            if (result.success) {
                toast({
                    title: "Success",
                    description: product ? "Product updated successfully." : "Product created successfully.",
                });
                onSuccess();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || (product ? "Failed to update product." : "Failed to create product.");
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Wireless Bluetooth Headphones"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input
                        id="shortDescription"
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        placeholder="Brief product summary"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Detailed product description"
                        rows={4}
                        required
                    />
                </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="compareAtPrice">Compare at Price (₹)</Label>
                        <Input
                            id="compareAtPrice"
                            name="compareAtPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.compareAtPrice}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Category & Subcategory */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Category</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="categoryId">Category *</Label>
                        {loadingCategories ? (
                            <div className="h-10 w-full border rounded-md flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : (
                            <Select
                                value={formData.categoryId || undefined}
                                onValueChange={(value) => handleSelectChange('categoryId', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subcategoryId">Subcategory</Label>
                        <Select
                            value={formData.subcategoryId || undefined}
                            onValueChange={(value) => handleSelectChange('subcategoryId', value)}
                            disabled={!formData.categoryId || subcategories.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select subcategory (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {subcategories.map((subcat) => (
                                    <SelectItem key={subcat._id} value={subcat._id}>
                                        {subcat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Partial Payment (auto when category allows) */}
            {showPartialPaymentOption && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary">
                        This category allows partial payment. Customers can pay ₹500 now and the rest later.
                    </p>
                </div>
            )}

            {/* Images */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Images</h3>
                
                <div className="space-y-2">
                    <Label htmlFor="images">Add Images *</Label>
                    <Input
                        id="images"
                        name="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">You can select multiple images. First image will be the primary image.</p>
                </div>

                {previewUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border bg-muted/20">
                                    <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Inventory */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            placeholder="e.g., PROD-001"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                            id="stock"
                            name="stock"
                            type="number"
                            min="0"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2 h-10">
                        <Checkbox
                            id="trackInventory"
                            name="trackInventory"
                            checked={formData.trackInventory}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, trackInventory: checked }))}
                        />
                        <label
                            htmlFor="trackInventory"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Track inventory
                        </label>
                    </div>
                </div>
            </div>

            {/* SEO */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status</h3>
                
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 h-10">
                        <Checkbox
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                        <label
                            htmlFor="isActive"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Active (visible to customers)
                        </label>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {product ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        product ? 'Update Product' : 'Create Product'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default StoreProductForm;
