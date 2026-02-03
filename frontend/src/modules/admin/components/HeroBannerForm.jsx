import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { heroBannerService } from '../services/heroBanner.service';
import { useToast } from '@/hooks/use-toast';

const HeroBannerForm = ({ banner, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Separate state for file handling
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(banner?.image || '');

    const [formData, setFormData] = useState({
        title: banner?.title || '',
        description: banner?.description || '',
        cta: banner?.cta || '',
        order: banner?.order || 0,
        isActive: banner?.isActive !== undefined ? banner.isActive : true,
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
        if (!formData.title || !formData.description || !formData.cta) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        // Must have a file on create, or an existing image on update
        if (!selectedFile && !banner?.image) {
            toast({
                title: "Validation Error",
                description: "Please select an image for the banner.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            // Create FormData object
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('cta', formData.cta);
            data.append('order', formData.order);
            data.append('isActive', formData.isActive);

            if (selectedFile) {
                data.append('image', selectedFile);
            }

            let result;
            if (banner) {
                result = await heroBannerService.updateHeroBanner(banner._id, data);
            } else {
                result = await heroBannerService.createHeroBanner(data);
            }

            if (result.success) {
                toast({
                    title: "Success",
                    description: banner ? "Banner updated successfully." : "Banner created successfully.",
                });
                onSuccess();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: banner ? "Failed to update banner." : "Failed to create banner.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Summer Collection 2024"
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
                    placeholder="e.g., Discover the hottest trends for the season."
                    rows={3}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Banner Image *</Label>
                <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    required={!banner} // Required only on create
                />
                <p className="text-xs text-muted-foreground">Recommended size: 1920x600px</p>

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

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cta">Call to Action *</Label>
                    <Input
                        id="cta"
                        name="cta"
                        value={formData.cta}
                        onChange={handleChange}
                        placeholder="e.g., Shop Now"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                        id="order"
                        name="order"
                        type="number"
                        value={formData.order}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                </div>
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
                        Active (visible on homepage)
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
                            {banner ? 'Updating...' : 'Uploading...'}
                        </>
                    ) : (
                        banner ? 'Update Banner' : 'Create Banner'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default HeroBannerForm;
