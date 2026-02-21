import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/modules/user/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const StoreProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { toast } = useToast();

    const image = product.images && product.images.length > 0 ? product.images[0] : "/placeholder-product.png";
    const pid = product._id;
    const name = product.name;
    const price = product.price;
    const compareAtPrice = product.compareAtPrice;
    const categoryName = product.categoryId?.name || product.category;
    const isOutOfStock = product.trackInventory && product.stock <= 0;

    const handleAddToCart = (e) => {
        if (e) e.preventDefault();
        if (isOutOfStock) {
            toast({
                title: "Out of Stock",
                description: "This product is currently out of stock.",
                variant: "destructive",
            });
            return;
        }
        addToCart({
            pid,
            id: pid,
            name,
            image,
            price,
            discountPrice: price,
            quantity: 1,
            category: categoryName,
            sku: product.sku,
            isStoreProduct: true, // Flag to identify store products
        });
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group h-full"
        >
            <Card className="h-full flex flex-col overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-card rounded-2xl">
                <div className="relative aspect-square overflow-hidden bg-muted shrink-0">
                    <Link to={`/store-product/${pid}`} className="block h-full w-full bg-white">
                        <motion.img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                        />
                    </Link>

                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge className="bg-red-500 text-white">Out of Stock</Badge>
                        </div>
                    )}

                    {/* Desktop Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex pointer-events-none">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 pointer-events-auto"
                        >
                            <Button
                                size="icon"
                                variant="secondary"
                                className="rounded-full h-12 w-12 shadow-xl bg-white text-primary hover:bg-primary hover:text-white border-none"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-150 pointer-events-auto"
                        >
                            <Button
                                size="icon"
                                variant="secondary"
                                className="rounded-full h-12 w-12 shadow-xl bg-white text-primary hover:bg-primary hover:text-white border-none"
                                asChild
                            >
                                <Link to={`/store-product/${pid}`}>
                                    <Eye className="h-5 w-5" />
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>

                <CardContent className="p-3 md:p-4 flex-grow">
                    <Link to={`/store-product/${pid}`}>
                        <h3 className="line-clamp-1 text-sm md:text-base font-bold text-foreground hover:text-primary transition-colors">
                            {name}
                        </h3>
                    </Link>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium uppercase tracking-wider">
                        {categoryName}
                        {product.subcategoryId?.name && ` > ${product.subcategoryId.name}`}
                    </p>
                </CardContent>

                <CardFooter className="p-3 md:p-4 pt-0 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base md:text-lg font-black text-primary truncate">
                            ₹{price}
                        </span>
                        {compareAtPrice && compareAtPrice > price && (
                            <span className="text-sm text-muted-foreground line-through">
                                ₹{compareAtPrice}
                            </span>
                        )}
                    </div>

                    <div className="flex md:hidden gap-2 shrink-0">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full h-9 w-9 bg-primary/10 text-primary hover:bg-primary hover:text-white border-none"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default StoreProductCard;
