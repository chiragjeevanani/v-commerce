import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ShieldCheck,
    TrendingUp,
    Globe,
    Package,
    Tag,
    Image as ImageIcon,
    Loader2,
    Save,
    ExternalLink,
    Box,
    Layers,
    Info,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { productsService } from '../services/products.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [margin, setMargin] = useState(30);
    const [saving, setSaving] = useState(false);
    const [activeImage, setActiveImage] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const result = await productsService.getProductDetails(id);
                if (result.success && result.code === 200) {
                    const data = result.data;
                    // Handle JSON string fields from CJ API
                    if (typeof data.productImage === 'string' && data.productImage.startsWith('[')) {
                        data.productImageSet = JSON.parse(data.productImage);
                        data.productImage = data.productImageSet[0];
                    }
                    setProduct(data);
                    setActiveImage(data.productImage);
                    setMargin(30);
                } else {
                    throw new Error(result.message || "Failed to fetch product details");
                }
            } catch (error) {
                console.error("Error:", error);
                toast({
                    title: "Error",
                    description: "Could not load product details from CJ API.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await productsService.updateProductMargin(id, margin);
            toast({
                title: "Settings saved",
                description: "Product markup has been updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-40" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-1 h-[400px] rounded-2xl" />
                    <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                <h2 className="text-2xl font-bold">Product Not Found</h2>
                <p className="text-muted-foreground mt-2">The product you're looking for might have been removed from CJ Dropshipping.</p>
                <Button variant="outline" className="mt-6" onClick={() => navigate('/admin/products')}>
                    Go Back to Products
                </Button>
            </div>
        );
    }

    const USD_TO_INR = 83;
    const sellingPrice = (parseFloat(product.sellPrice) * USD_TO_INR * (1 + margin / 100)).toFixed(2);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight line-clamp-1 max-w-xl">{product.productNameEn}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">PID: {product.pid}</Badge>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{product.categoryName}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2" asChild>
                        <a href={`https://cjdropshipping.com/product/${product.productNameEn.replace(/\s+/g, '-')}-p-${product.pid}.html`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" /> View on CJ
                        </a>
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveSettings} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Media & Specs */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="overflow-hidden border-none shadow-premium bg-card">
                        <div className="aspect-square relative group bg-white">
                            <motion.img
                                key={activeImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={activeImage}
                                alt={product.productNameEn}
                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        {product.productImageSet && product.productImageSet.length > 0 && (
                            <CardContent className="p-4">
                                <div className="grid grid-cols-5 gap-2">
                                    {product.productImageSet.slice(0, 10).map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={`aspect-square rounded-md border overflow-hidden transition-all ${activeImage === img ? 'ring-2 ring-indigo-600 border-transparent' : 'opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={img} className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Stats & Source */}
                    <Card className="border-none shadow-premium bg-indigo-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] opacity-70 uppercase font-black tracking-widest">Global Listings</p>
                                    <p className="text-2xl font-black">{product.listedNum?.toLocaleString() || '0'}+</p>
                                </div>
                                <Box className="h-8 w-8 opacity-20" />
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between items-center py-2 border-t border-white/10">
                                    <span className="opacity-70">Inventory Type</span>
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">{product.productType || 'ORDINARY'}</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-t border-white/10">
                                    <span className="opacity-70">Source</span>
                                    <span className="font-bold flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> CJ Official
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Technical Specs */}
                    <Card className="border-none shadow-premium">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                <Info className="h-4 w-4 text-indigo-600" /> Technical Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">Materials</p>
                                    <div className="flex flex-wrap gap-1">
                                        {(product.materialNameEnSet || []).map((m, i) => (
                                            <Badge key={i} variant="secondary" className="text-[10px] py-0">{m}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Weight</p>
                                        <p className="text-sm font-bold">{product.productWeight}g</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Packing</p>
                                        <p className="text-sm font-bold text-indigo-600">{(product.packingNameEnSet || [])[0] || 'Standard'}</p>
                                    </div>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <p className="text-[10px]">Synced since {product.createrTime ? new Date(product.createrTime).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Details & Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pricing Config */}
                    <Card className="border-none shadow-premium bg-gradient-to-br from-card to-indigo-50/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-indigo-600" /> Pricing & Profit Strategy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Base Cost Range</p>
                                    <p className="text-xl font-black text-muted-foreground">₹{(parseFloat(product.sellPrice) * USD_TO_INR).toFixed(2)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-widest">Global Markup</p>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={margin}
                                            onChange={(e) => setMargin(e.target.value)}
                                            className="w-24 font-bold text-lg border-indigo-200"
                                        />
                                        <span className="text-xl font-bold text-indigo-600">%</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20 flex flex-col justify-center">
                                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest mb-1">Estimated Sale Price</p>
                                    <p className="text-2xl font-black italic">
                                        {product.sellPrice.includes('-') ? (
                                            <>
                                                ₹{(parseFloat(product.sellPrice.split('-')[0]) * USD_TO_INR * (1 + margin / 100)).toFixed(2)} -
                                                ₹{(parseFloat(product.sellPrice.split('-')[1]) * USD_TO_INR * (1 + margin / 100)).toFixed(2)}
                                            </>
                                        ) : (
                                            `₹${(parseFloat(product.sellPrice) * USD_TO_INR * (1 + margin / 100)).toFixed(2)}`
                                        )}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Properties</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.productProEnSet?.map((pro, i) => (
                                            <Badge key={i} variant="outline" className="bg-indigo-50/50 border-indigo-100 text-indigo-700">{pro}</Badge>
                                        ))}
                                        {(!product.productProEnSet || product.productProEnSet.length === 0) && (
                                            <Badge variant="outline" className="opacity-50 italic">No special properties</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl space-y-2 border border-dashed border-muted-foreground/20">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <ShieldCheck className="h-3 w-3 text-green-500" /> Admin Note
                                    </h4>
                                    <textarea
                                        className="w-full bg-transparent text-sm resize-none focus:outline-none min-h-[60px] scrollbar-none"
                                        placeholder="Add private internal notes about this product..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Variants Table */}
                    <Card className="border-none shadow-premium overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Layers className="h-4 w-4 text-indigo-600" /> Active Variants ({product.variants?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[400px] overflow-auto scrollbar-thin">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="border-b bg-muted/30">
                                            <th className="h-10 px-6 text-left align-middle font-medium text-muted-foreground text-[10px] uppercase tracking-tighter">Variant</th>
                                            <th className="h-10 px-6 text-left align-middle font-medium text-muted-foreground text-[10px] uppercase tracking-tighter">SKU</th>
                                            <th className="h-10 px-6 text-left align-middle font-medium text-muted-foreground text-[10px] uppercase tracking-tighter">Supply Cost</th>
                                            <th className="h-10 px-6 text-right align-middle font-medium text-muted-foreground text-[10px] uppercase tracking-tighter">Inventory</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {product.variants?.map((v, i) => (
                                            <tr key={v.vid} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded border overflow-hidden shrink-0">
                                                            <img src={v.variantImage} className="h-full w-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-[11px] leading-tight line-clamp-1">{v.variantKey}</span>
                                                            <span className="text-[9px] text-muted-foreground">{v.variantStandard}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 font-mono text-[9px] text-muted-foreground">{v.variantSku}</td>
                                                <td className="px-6 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-indigo-600">₹{(parseFloat(v.variantSellPrice) * USD_TO_INR).toFixed(2)}</span>
                                                        <span className="text-[9px] text-green-600">Sug: ₹{(parseFloat(v.variantSugSellPrice) * USD_TO_INR).toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {v.inventoryNum || 'Syncing...'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card className="border-none shadow-premium">
                        <CardHeader className="border-b bg-muted/5">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Tag className="h-4 w-4 text-indigo-600" /> Web Description & Marketing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground detail-description"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
