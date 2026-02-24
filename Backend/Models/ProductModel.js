import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        shortDescription: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        compareAtPrice: {
            type: Number,
            min: 0,
        },
        sku: {
            type: String,
            trim: true,
            unique: true,
            sparse: true, // Allow null/undefined but enforce uniqueness when present
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        subcategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subcategory",
        },
        images: [{
            type: String,
            required: true,
        }],
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        trackInventory: {
            type: Boolean,
            default: true,
        },
        weight: {
            type: Number,
            min: 0,
        },
        dimensions: {
            length: { type: Number, min: 0 },
            width: { type: Number, min: 0 },
            height: { type: Number, min: 0 },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        allowPartialPayment: {
            type: Boolean,
            default: false,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        metaTitle: {
            type: String,
            trim: true,
        },
        metaDescription: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Index for faster queries
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ subcategoryId: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model("Product", productSchema);
export default Product;
