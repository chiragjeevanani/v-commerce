import React, { useState, useEffect } from 'react';
import {
    Folder,
    Search,
    MoreHorizontal,
    Trash2,
    Edit,
    Plus,
    Loader2,
    Eye,
    EyeOff,
    ChevronRight,
    FolderOpen,
    X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryService } from '../services/category.service';
import { useToast } from '@/hooks/use-toast';
import CategoryForm from '../components/CategoryForm';

const Categories = () => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(false);
    
    // Subcategory states
    const [isSubcategoryFormOpen, setIsSubcategoryFormOpen] = useState(false);
    const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState(null);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [deleteSubcategoryConfirm, setDeleteSubcategoryConfirm] = useState(null);
    const [deletingSubcategory, setDeletingSubcategory] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const result = await categoryService.getAllCategories();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error("Fetch Categories Error:", error);
            toast({
                title: "Error",
                description: "Failed to load categories.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreateCategory = () => {
        setEditingCategory(null);
        setIsCategoryFormOpen(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setIsCategoryFormOpen(true);
    };

    const handleCategoryFormSuccess = () => {
        setIsCategoryFormOpen(false);
        setEditingCategory(null);
        fetchCategories();
    };

    const handleDeleteCategory = async () => {
        if (!deleteCategoryConfirm) return;
        setDeletingCategory(true);
        try {
            const result = await categoryService.deleteCategory(deleteCategoryConfirm._id);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Category deleted successfully.",
                });
                fetchCategories();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to delete category.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setDeletingCategory(false);
            setDeleteCategoryConfirm(null);
        }
    };

    const handleToggleCategoryActive = async (category) => {
        try {
            const result = await categoryService.updateCategory(category._id, {
                name: category.name,
                description: category.description,
                isActive: !category.isActive
            });
            if (result.success) {
                toast({
                    title: "Success",
                    description: `Category ${!category.isActive ? 'activated' : 'deactivated'} successfully.`,
                });
                fetchCategories();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update category status.",
                variant: "destructive",
            });
        }
    };

    const handleCreateSubcategory = (category) => {
        setSelectedCategoryForSubcategory(category);
        setEditingSubcategory(null);
        setIsSubcategoryFormOpen(true);
    };

    const handleEditSubcategory = (subcategory, category) => {
        setSelectedCategoryForSubcategory(category);
        setEditingSubcategory(subcategory);
        setIsSubcategoryFormOpen(true);
    };

    const handleSubcategoryFormSuccess = () => {
        setIsSubcategoryFormOpen(false);
        setEditingSubcategory(null);
        setSelectedCategoryForSubcategory(null);
        fetchCategories();
    };

    const handleDeleteSubcategory = async () => {
        if (!deleteSubcategoryConfirm) return;
        setDeletingSubcategory(true);
        try {
            const result = await categoryService.deleteSubcategory(deleteSubcategoryConfirm._id);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Subcategory deleted successfully.",
                });
                fetchCategories();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete subcategory.",
                variant: "destructive",
            });
        } finally {
            setDeletingSubcategory(false);
            setDeleteSubcategoryConfirm(null);
        }
    };

    const handleToggleSubcategoryActive = async (subcategory) => {
        try {
            const result = await categoryService.updateSubcategory(subcategory._id, {
                name: subcategory.name,
                isActive: !subcategory.isActive
            });
            if (result.success) {
                toast({
                    title: "Success",
                    description: `Subcategory ${!subcategory.isActive ? 'activated' : 'deactivated'} successfully.`,
                });
                fetchCategories();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update subcategory status.",
                variant: "destructive",
            });
        }
    };

    const toggleCategoryExpansion = (categoryId) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCategoriesCount = categories.filter(c => c.isActive).length;
    const totalSubcategoriesCount = categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0);

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories & Subcategories</h1>
                    <p className="text-muted-foreground mt-1">Manage product categories and their subcategories.</p>
                </div>
                <Button onClick={handleCreateCategory} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Folder className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Categories</p>
                            <p className="text-2xl font-bold">{categories.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600 dark:text-green-400">
                            <Eye className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Active Categories</p>
                            <p className="text-2xl font-bold">{activeCategoriesCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                            <FolderOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Subcategories</p>
                            <p className="text-2xl font-bold">{totalSubcategoriesCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-muted-foreground">Loading categories...</p>
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="text-center py-20">
                                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-bold">No categories found</h3>
                                <p className="text-muted-foreground mb-4">Create your first category to get started.</p>
                                <Button onClick={handleCreateCategory} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New Category
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredCategories.map((category, i) => (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={category._id}
                                        className="hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-lg">{category.name}</h3>
                                                            <Badge variant="outline" className={
                                                                category.isActive ? 'bg-green-50 text-green-700 border-green-200' :
                                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                                            }>
                                                                {category.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                {category.subcategories?.length || 0} subcategories
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleCategoryExpansion(category._id)}
                                                        className="gap-2"
                                                    >
                                                        {expandedCategories.has(category._id) ? (
                                                            <>
                                                                <X className="h-4 w-4" />
                                                                Hide Subcategories
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronRight className="h-4 w-4" />
                                                                View Subcategories
                                                            </>
                                                        )}
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Category
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleCreateSubcategory(category)}>
                                                                <Plus className="mr-2 h-4 w-4" /> Add Subcategory
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleCategoryActive(category)}>
                                                                {category.isActive ? (
                                                                    <><EyeOff className="mr-2 h-4 w-4" /> Deactivate</>
                                                                ) : (
                                                                    <><Eye className="mr-2 h-4 w-4" /> Activate</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-500" onClick={() => setDeleteCategoryConfirm(category)}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Category
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            {/* Subcategories Section */}
                                            <AnimatePresence>
                                                {expandedCategories.has(category._id) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="mt-4 pt-4 border-t"
                                                    >
                                                        {category.subcategories && category.subcategories.length > 0 ? (
                                                            <div className="space-y-2">
                                                                <h4 className="font-semibold text-sm mb-3">Subcategories</h4>
                                                                {category.subcategories.map((subcategory) => (
                                                                    <div key={subcategory._id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="font-medium">{subcategory.name}</span>
                                                                            <Badge variant="outline" className={
                                                                                subcategory.isActive ? 'bg-green-50 text-green-700 border-green-200' :
                                                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                                                            }>
                                                                                {subcategory.isActive ? 'Active' : 'Inactive'}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                        <MoreHorizontal className="h-3 w-3" />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end" className="w-48">
                                                                                    <DropdownMenuItem onClick={() => handleEditSubcategory(subcategory, category)}>
                                                                                        <Edit className="mr-2 h-4 w-4" /> Edit Subcategory
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem onClick={() => handleToggleSubcategoryActive(subcategory)}>
                                                                                        {subcategory.isActive ? (
                                                                                            <><EyeOff className="mr-2 h-4 w-4" /> Deactivate</>
                                                                                        ) : (
                                                                                            <><Eye className="mr-2 h-4 w-4" /> Activate</>
                                                                                        )}
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem className="text-red-500" onClick={() => setDeleteSubcategoryConfirm(subcategory)}>
                                                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Subcategory
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <p className="text-sm text-muted-foreground mb-3">No subcategories yet</p>
                                                                <Button size="sm" variant="outline" onClick={() => handleCreateSubcategory(category)} className="gap-2">
                                                                    <Plus className="h-3 w-3" />
                                                                    Add Subcategory
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Category Form Dialog */}
            <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Update the category details below.' : 'Fill in the details to create a new category.'}
                        </DialogDescription>
                    </DialogHeader>
                    <CategoryForm
                        category={editingCategory}
                        onSuccess={handleCategoryFormSuccess}
                        onCancel={() => setIsCategoryFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Subcategory Form Dialog */}
            <Dialog open={isSubcategoryFormOpen} onOpenChange={setIsSubcategoryFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSubcategory ? 'Edit Subcategory' : 'Create New Subcategory'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedCategoryForSubcategory && (
                                <span>For category: <strong>{selectedCategoryForSubcategory.name}</strong></span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <SubcategoryForm
                        category={selectedCategoryForSubcategory}
                        subcategory={editingSubcategory}
                        onSuccess={handleSubcategoryFormSuccess}
                        onCancel={() => {
                            setIsSubcategoryFormOpen(false);
                            setEditingSubcategory(null);
                            setSelectedCategoryForSubcategory(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Category Confirmation Dialog */}
            <Dialog open={!!deleteCategoryConfirm} onOpenChange={() => setDeleteCategoryConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteCategoryConfirm?.name}"? This action cannot be undone.
                            {deleteCategoryConfirm?.subcategories?.length > 0 && (
                                <span className="block mt-2 text-red-500">
                                    Warning: This category has {deleteCategoryConfirm.subcategories.length} subcategory(ies). Please delete them first.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteCategoryConfirm(null)} disabled={deletingCategory}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCategory} disabled={deletingCategory}>
                            {deletingCategory ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Subcategory Confirmation Dialog */}
            <Dialog open={!!deleteSubcategoryConfirm} onOpenChange={() => setDeleteSubcategoryConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Subcategory</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteSubcategoryConfirm?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteSubcategoryConfirm(null)} disabled={deletingSubcategory}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteSubcategory} disabled={deletingSubcategory}>
                            {deletingSubcategory ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Subcategory Form Component
const SubcategoryForm = ({ category, subcategory, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: subcategory?.name || '',
        isActive: subcategory?.isActive !== undefined ? subcategory.isActive : true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast({
                title: "Validation Error",
                description: "Please enter a subcategory name.",
                variant: "destructive",
            });
            return;
        }

        if (!category) {
            toast({
                title: "Error",
                description: "Category not selected.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            let result;
            if (subcategory) {
                result = await categoryService.updateSubcategory(subcategory._id, formData);
            } else {
                result = await categoryService.createSubcategory({
                    categoryId: category._id,
                    name: formData.name,
                    isActive: formData.isActive
                });
            }

            if (result.success) {
                toast({
                    title: "Success",
                    description: subcategory ? "Subcategory updated successfully." : "Subcategory created successfully.",
                });
                onSuccess();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || (subcategory ? "Failed to update subcategory." : "Failed to create subcategory.");
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="subcategoryName">Subcategory Name *</Label>
                <Input
                    id="subcategoryName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Smartphones"
                    required
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                        id="subcategoryIsActive"
                        name="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <label
                        htmlFor="subcategoryIsActive"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Active (visible to customers)
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {subcategory ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        subcategory ? 'Update Subcategory' : 'Create Subcategory'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default Categories;
