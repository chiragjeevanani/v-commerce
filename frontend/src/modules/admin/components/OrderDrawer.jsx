import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Package,
    Truck,
    User,
    MapPin,
    CreditCard,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const OrderDrawer = ({ order, isOpen, onClose }) => {
    if (!order) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-2xl font-bold">{order.id}</SheetTitle>
                        <StatusBadge status={order.status} />
                    </div>
                    <SheetDescription>
                        Placed on {new Date(order.date).toLocaleString()}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8 mt-8 pb-20">
                    {/* Customer Info */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                            <User className="h-4 w-4" /> Customer Information
                        </h3>
                        <div className="bg-muted/30 p-4 rounded-xl space-y-2 border">
                            <p className="font-semibold">{order.customer?.name || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{order.customer?.country || "N/A"}</p>
                        </div>
                    </section>

                    {/* Shipping Address */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                            <MapPin className="h-4 w-4" /> Shipping Address
                        </h3>
                        <div className="bg-muted/30 p-4 rounded-xl border">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {order.shippingAddress || "N/A"}
                            </p>
                        </div>
                    </section>

                    {/* Payment Details */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                            <CreditCard className="h-4 w-4" /> Payment Details
                        </h3>
                        <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className="text-green-600 font-medium">Successful</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold pt-1">
                                <span>Total Amount</span>
                                <span className="text-primary">${order.total?.toFixed(2) || "0.00"}</span>
                            </div>
                        </div>
                    </section>

                    {/* Items List */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                            <Package className="h-4 w-4" /> Order Items ({order.items?.length || 0})
                        </h3>
                        <div className="space-y-3">
                            {order.items?.map((item, i) => (
                                <div key={i} className="flex gap-4 p-3 bg-muted/30 rounded-xl border">
                                    <div className="h-16 w-16 rounded-lg overflow-hidden border bg-background shrink-0">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center gap-1">
                                        <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                                            <span className="text-sm font-semibold">${item.price?.toFixed(2) || "0.00"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!order.items || order.items.length === 0) && (
                                <p className="text-xs text-muted-foreground italic p-4 text-center">N/A (Synced from Supplier)</p>
                            )}
                        </div>
                    </section>

                    {/* Supplier Info */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                            <RefreshCw className="h-4 w-4" /> Supplier API Status
                        </h3>
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Reference: SUP-882192</span>
                                <Badge variant="outline" className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-indigo-200">Linked</Badge>
                            </div>
                            <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">Synchronized with main dropship warehouse.</p>
                        </div>
                    </section>
                </div>

                <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t gap-2 sm:gap-0">
                    <Button variant="outline" className="flex-1 gap-2">
                        <Truck className="h-4 w-4" /> View Tracking
                    </Button>
                    <Button className="flex-1 gap-2">
                        <RefreshCw className="h-4 w-4" /> Mark Processed
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default OrderDrawer;
