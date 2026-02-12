import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { categoryService } from '../services/category.service';
import { useToast } from '@/hooks/use-toast';

const CategoryForm = ({ category, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Separate state for file handling
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(category?.image || '');

    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        isActive: category?.isActive !== undefined ? category.isActive : true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.description) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        // Must have a file on create, or an existing image on update
        if (!selectedFile && !category?.image) {
            toast({
                title: "Validation Error",
                description: "Please select an image for the category.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            // Create FormData object
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('isActive', formData.isActive);

            if (selectedFile) {
                data.append('image', selectedFile);
            }

            let result;
            if (category) {
                result = await categoryService.updateCategory(category._id, data);
            } else {
                result = await categoryService.createCategory(data);
            }

            if (result.success) {
                toast({
                    title: "Success",
                    description: category ? "Category updated successfully." : "Category created successfully.",
                });
                onSuccess();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || (category ? "Failed to update category." : "Failed to create category.");
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
                <Label htmlFor="name">Category Name *</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Electronics"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g., All electronic products and gadgets"
                    rows={3}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Category Image *</Label>
                <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    required={!category} // Required only on create
                />
                <p className="text-xs text-muted-foreground">Recommended size: 400x400px</p>

                {previewUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border bg-muted/20">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-40 object-cover"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-2">
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

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {category ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        category ? 'Update Category' : 'Create Category'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default CategoryForm;
