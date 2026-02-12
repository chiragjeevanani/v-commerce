import Category from "../Models/CategoryModel.js";
import Subcategory from "../Models/SubcategoryModel.js";
import fs from "fs";
import cloudinary from "../Cloudinary/Cloudinary.js";

// ================= GET ALL CATEGORIES (PUBLIC) =================
export const getActiveCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ createdAt: -1 })
            .select("-__v");

        res.json({
            success: true,
            message: "Active categories fetched successfully",
            data: categories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};

// ================= GET ALL CATEGORIES WITH SUBCATEGORIES (ADMIN) =================
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ createdAt: -1 })
            .select("-__v");

        // Get subcategories for each category
        const categoriesWithSubcategories = await Promise.all(
            categories.map(async (category) => {
                const subcategories = await Subcategory.find({ categoryId: category._id })
                    .sort({ createdAt: -1 })
                    .select("-__v");
                return {
                    ...category.toObject(),
                    subcategories,
                };
            })
        );

        res.json({
            success: true,
            message: "All categories fetched successfully",
            data: categoriesWithSubcategories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};

// ================= GET SINGLE CATEGORY WITH SUBCATEGORIES =================
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id).select("-__v");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
                data: null,
            });
        }

        const subcategories = await Subcategory.find({ categoryId: category._id })
            .sort({ createdAt: -1 })
            .select("-__v");

        res.json({
            success: true,
            message: "Category fetched successfully",
            data: {
                ...category.toObject(),
                subcategories,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};

// ================= CREATE CATEGORY (ADMIN) =================
export const createCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const imageFile = req.file;

        if (!name || !description || !imageFile) {
            // Clean up file if validation fails
            if (imageFile) fs.unlinkSync(imageFile.path);

            return res.status(400).json({
                success: false,
                message: "All fields are required (name, description, image)",
                data: null,
            });
        }

        // Check if category with same name exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            if (imageFile) fs.unlinkSync(imageFile.path);
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists",
                data: null,
            });
        }

        let imageUrl = "";
        try {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(imageFile.path, {
                folder: "categories"
            });
            imageUrl = result.secure_url;

            // Delete local file
            fs.unlinkSync(imageFile.path);
        } catch (uploadError) {
            // Clean up file on upload error
            if (fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
            throw uploadError;
        }

        const category = await Category.create({
            name: name.trim(),
            description: description.trim(),
            image: imageUrl,
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
            data: null,
        });
    }
};

// ================= UPDATE CATEGORY (ADMIN) =================
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;
        const imageFile = req.file;

        const category = await Category.findById(id);
        if (!category) {
            // Clean up file if category not found
            if (imageFile) fs.unlinkSync(imageFile.path);

            return res.status(404).json({
                success: false,
                message: "Category not found",
                data: null,
            });
        }

        // Check if name is being changed and if it conflicts with existing category
        if (name && name.trim() !== category.name) {
            const existingCategory = await Category.findOne({ name: name.trim() });
            if (existingCategory) {
                if (imageFile) fs.unlinkSync(imageFile.path);
                return res.status(400).json({
                    success: false,
                    message: "Category with this name already exists",
                    data: null,
                });
            }
        }

        // Handle Image Upload if exists
        if (imageFile) {
            try {
                // Upload new image
                const result = await cloudinary.uploader.upload(imageFile.path, {
                    folder: "categories"
                });
                category.image = result.secure_url;

                // Delete local file
                fs.unlinkSync(imageFile.path);
            } catch (uploadError) {
                if (fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
                throw uploadError;
            }
        }

        if (name) category.name = name.trim();
        if (description) category.description = description.trim();
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        res.json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
            data: null,
        });
    }
};

// ================= DELETE CATEGORY (ADMIN) =================
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category has subcategories
        const subcategoriesCount = await Subcategory.countDocuments({ categoryId: id });
        if (subcategoriesCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category. Please delete all subcategories first.",
                data: null,
            });
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
                data: null,
            });
        }

        res.json({
            success: true,
            message: "Category deleted successfully",
            data: null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};

// ================= CREATE SUBCATEGORY (ADMIN) =================
export const createSubcategory = async (req, res) => {
    try {
        const { categoryId, name, isActive } = req.body;

        if (!categoryId || !name) {
            return res.status(400).json({
                success: false,
                message: "Category ID and subcategory name are required",
                data: null,
            });
        }

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
                data: null,
            });
        }

        // Check if subcategory with same name exists in this category
        const existingSubcategory = await Subcategory.findOne({
            categoryId,
            name: name.trim()
        });
        if (existingSubcategory) {
            return res.status(400).json({
                success: false,
                message: "Subcategory with this name already exists in this category",
                data: null,
            });
        }

        const subcategory = await Subcategory.create({
            categoryId,
            name: name.trim(),
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json({
            success: true,
            message: "Subcategory created successfully",
            data: subcategory,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
            data: null,
        });
    }
};

// ================= UPDATE SUBCATEGORY (ADMIN) =================
export const updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isActive } = req.body;

        const subcategory = await Subcategory.findById(id);
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found",
                data: null,
            });
        }

        // Check if name is being changed and if it conflicts
        if (name && name.trim() !== subcategory.name) {
            const existingSubcategory = await Subcategory.findOne({
                categoryId: subcategory.categoryId,
                name: name.trim()
            });
            if (existingSubcategory) {
                return res.status(400).json({
                    success: false,
                    message: "Subcategory with this name already exists in this category",
                    data: null,
                });
            }
        }

        if (name) subcategory.name = name.trim();
        if (isActive !== undefined) subcategory.isActive = isActive;

        await subcategory.save();

        res.json({
            success: true,
            message: "Subcategory updated successfully",
            data: subcategory,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
            data: null,
        });
    }
};

// ================= DELETE SUBCATEGORY (ADMIN) =================
export const deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;

        const subcategory = await Subcategory.findByIdAndDelete(id);
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found",
                data: null,
            });
        }

        res.json({
            success: true,
            message: "Subcategory deleted successfully",
            data: null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};

// ================= GET SUBCATEGORIES BY CATEGORY ID =================
export const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const subcategories = await Subcategory.find({ categoryId })
            .sort({ createdAt: -1 })
            .select("-__v");

        res.json({
            success: true,
            message: "Subcategories fetched successfully",
            data: subcategories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            data: null,
        });
    }
};
