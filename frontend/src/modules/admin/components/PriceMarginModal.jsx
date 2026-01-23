import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Info, Calculator, Save } from 'lucide-react';

const PriceMarginModal = ({ product, isOpen, onClose, onSave }) => {
    const [margin, setMargin] = useState(30);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (product) {
            setMargin(product.margin || 30);
            setIsVisible(true);
        }
    }, [product]);

    if (!product) return null;

    const supplierPrice = parseFloat(product.supplierPrice);
    const sellingPrice = (supplierPrice * (1 + margin / 100)).toFixed(2);
    const profit = (sellingPrice - supplierPrice).toFixed(2);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Product Pricing</DialogTitle>
                    <DialogDescription>
                        Configure your markup and visibility for this dropshipped product.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Product Info Summary */}
                    <div className="flex gap-4 p-3 bg-muted rounded-xl border">
                        <div className="h-16 w-16 rounded-lg overflow-hidden border bg-background shrink-0">
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Supplier ID: SUP-{product.id}</p>
                        </div>
                    </div>

                    {/* Pricing Calculation Card */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-xl border space-y-1">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Supplier Price</p>
                            <p className="text-xl font-bold">${supplierPrice.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                            <p className="text-[10px] uppercase font-bold text-primary italic">Your Selling Price</p>
                            <p className="text-xl font-bold text-primary">${sellingPrice}</p>
                        </div>
                    </div>

                    {/* Margin Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="font-bold flex items-center gap-2">
                                Markup Percentage: <span className="text-primary font-black text-lg">{margin}%</span>
                            </Label>
                            <div className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                <Calculator className="h-3 w-3" /> Profit: +${profit}
                            </div>
                        </div>
                        <Slider
                            value={[margin]}
                            onValueChange={(val) => setMargin(val[0])}
                            max={200}
                            step={1}
                            className="py-4"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>0% (Cost price)</span>
                            <span>100% (Double)</span>
                            <span>200% (Triple)</span>
                        </div>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                        <div className="space-y-1">
                            <Label className="font-bold">Product Visibility</Label>
                            <p className="text-xs text-muted-foreground text-pretty">
                                Enable this to show product in your storefront.
                            </p>
                        </div>
                        <Switch
                            checked={isVisible}
                            onCheckedChange={setIsVisible}
                        />
                    </div>

                    {/* Warning Note */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-normal">
                            Note: This is a dropshipping product. You can only control your margin. Product images and descriptions are managed by the supplier API.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button className="gap-2 px-8" onClick={() => onSave({ margin, isVisible })}>
                        <Save className="h-4 w-4" /> Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PriceMarginModal;
