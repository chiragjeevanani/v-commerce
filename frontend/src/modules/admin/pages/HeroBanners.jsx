import React, { useState, useEffect } from 'react';
import {
    Image,
    Search,
    MoreHorizontal,
    Trash2,
    Edit,
    Plus,
    Loader2,
    Eye,
    EyeOff,
    ArrowUpDown
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
import { motion } from 'framer-motion';
import { heroBannerService } from '../services/heroBanner.service';
import { useToast } from '@/hooks/use-toast';
import HeroBannerForm from '../components/HeroBannerForm';

const HeroBanners = () => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const result = await heroBannerService.getAdminHeroBanners();
            if (result.success) {
                setBanners(result.data);
            }
        } catch (error) {
            console.error("Fetch Banners Error:", error);
            toast({
                title: "Error",
                description: "Failed to load hero banners.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleCreate = () => {
        setEditingBanner(null);
        setIsFormOpen(true);
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingBanner(null);
        fetchBanners();
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            const result = await heroBannerService.deleteBanner(deleteConfirm._id);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Banner deleted successfully.",
                });
                fetchBanners();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete banner.",
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
            setDeleteConfirm(null);
        }
    };

    const handleToggleActive = async (banner) => {
        try {
            const result = await heroBannerService.updateHeroBanner(banner._id, {
                isActive: !banner.isActive
            });
            if (result.success) {
                toast({
                    title: "Success",
                    description: `Banner ${!banner.isActive ? 'activated' : 'deactivated'} successfully.`,
                });
                fetchBanners();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update banner status.",
                variant: "destructive",
            });
        }
    };

    const filteredBanners = banners.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.cta.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = banners.filter(b => b.isActive).length;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hero Banners</h1>
                    <p className="text-muted-foreground mt-1">Manage homepage hero section banners.</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Banner
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Image className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Banners</p>
                            <p className="text-2xl font-bold">{banners.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600 dark:text-green-400">
                            <Eye className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Active Banners</p>
                            <p className="text-2xl font-bold">{activeCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-900/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-900/40 rounded-xl text-slate-600 dark:text-slate-400">
                            <EyeOff className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Inactive Banners</p>
                            <p className="text-2xl font-bold">{banners.length - activeCount}</p>
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
                                placeholder="Search by title or CTA..."
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
                                <p className="text-muted-foreground">Loading banners...</p>
                            </div>
                        ) : banners.length === 0 ? (
                            <div className="text-center py-20">
                                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-bold">No banners found</h3>
                                <p className="text-muted-foreground mb-4">Create your first hero banner to get started.</p>
                                <Button onClick={handleCreate} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New Banner
                                </Button>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Order</th>
                                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Banner</th>
                                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">CTA</th>
                                        <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBanners.map((banner, i) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={banner._id}
                                            className="border-b hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-bold">{banner.order}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-20 rounded-lg overflow-hidden bg-muted">
                                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{banner.title}</span>
                                                        <span className="text-xs text-muted-foreground line-clamp-1">{banner.description}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium">{banner.cta}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={
                                                    banner.isActive ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-slate-50 text-slate-700 border-slate-200'
                                                }>
                                                    {banner.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleEdit(banner)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit Banner
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleActive(banner)}>
                                                            {banner.isActive ? (
                                                                <><EyeOff className="mr-2 h-4 w-4" /> Deactivate</>
                                                            ) : (
                                                                <><Eye className="mr-2 h-4 w-4" /> Activate</>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-500" onClick={() => setDeleteConfirm(banner)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Banner
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingBanner ? 'Edit Hero Banner' : 'Create New Hero Banner'}</DialogTitle>
                        <DialogDescription>
                            {editingBanner ? 'Update the hero banner details below.' : 'Fill in the details to create a new hero banner.'}
                        </DialogDescription>
                    </DialogHeader>
                    <HeroBannerForm
                        banner={editingBanner}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Hero Banner</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HeroBanners;
