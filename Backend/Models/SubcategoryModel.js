import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Ensure unique subcategory name within a category
subcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

const Subcategory = mongoose.model("Subcategory", subcategorySchema);
export default Subcategory;
