import Product from "../Models/ProductModel.js";
import Category from "../Models/CategoryModel.js";
import Subcategory from "../Models/SubcategoryModel.js";
import fs from "fs";
import cloudinary from "../Cloudinary/Cloudinary.js";

// ================= GET ALL PRODUCTS (PUBLIC) =================
export const getActiveProducts = async (req, res) => {
    try {
        const { categoryId, subcategoryId, search, page = 1, limit = 20, featured } = req.query;
        const query = { isActive: true };

        if (categoryId) query.categoryId = categoryId;
        if (subcategoryId) query.subcategoryId = subcategoryId;
        if (featured === 'true') query.isFeatured = true;
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(query)
            .populate('categoryId', 'name')
            .populate('subcategoryId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select("-__v");

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
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

// ================= GET ALL PRODUCTS (ADMIN) =================
export const getAllProducts = async (req, res) => {
    try {
        const { categoryId, subcategoryId, search, page = 1, limit = 20, isActive } = req.query;
        const query = {};

        if (categoryId) query.categoryId = categoryId;
        if (subcategoryId) query.subcategoryId = subcategoryId;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(query)
            .populate('categoryId', 'name')
            .populate('subcategoryId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select("-__v");

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
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

// ================= GET SINGLE PRODUCT =================
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id)
            .populate('categoryId', 'name image')
            .populate('subcategoryId', 'name')
            .select("-__v");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                data: null,
            });
        }

        res.json({
            success: true,
            message: "Product fetched successfully",
            data: product,
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

// ================= CREATE PRODUCT (ADMIN) =================
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            shortDescription,
            price,
            compareAtPrice,
            sku,
            categoryId,
            subcategoryId,
            stock,
            trackInventory,
            weight,
            dimensions,
            isActive,
            isFeatured,
            tags,
            metaTitle,
            metaDescription,
        } = req.body;

        const imageFiles = req.files || [];

        if (!name || !description || !price || !categoryId) {
            // Clean up files if validation fails
            imageFiles.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });

            return res.status(400).json({
                success: false,
                message: "Name, description, price, and category are required",
                data: null,
            });
        }

        // Validate category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            imageFiles.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
            return res.status(400).json({
                success: false,
                message: "Category not found",
                data: null,
            });
        }

        // Validate subcategory if provided
        if (subcategoryId) {
            const subcategory = await Subcategory.findById(subcategoryId);
            if (!subcategory || subcategory.categoryId.toString() !== categoryId) {
                imageFiles.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                return res.status(400).json({
                    success: false,
                    message: "Subcategory not found or doesn't belong to the selected category",
                    data: null,
                });
            }
        }

        // Check SKU uniqueness if provided
        if (sku) {
            const existingProduct = await Product.findOne({ sku: sku.trim() });
            if (existingProduct) {
                imageFiles.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                return res.status(400).json({
                    success: false,
                    message: "Product with this SKU already exists",
                    data: null,
                });
            }
        }

        // Upload images to Cloudinary
        const imageUrls = [];
        try {
            for (const file of imageFiles) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "products"
                });
                imageUrls.push(result.secure_url);
                fs.unlinkSync(file.path);
            }
        } catch (uploadError) {
            imageFiles.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
            throw uploadError;
        }

        if (imageUrls.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required",
                data: null,
            });
        }

        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            shortDescription: shortDescription?.trim(),
            price: parseFloat(price),
            compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
            sku: sku?.trim(),
            categoryId,
            subcategoryId: subcategoryId || undefined,
            images: imageUrls,
            stock: stock ? parseInt(stock) : 0,
            trackInventory: trackInventory !== undefined ? trackInventory : true,
            weight: weight ? parseFloat(weight) : undefined,
            dimensions: (() => {
                if (!dimensions) return undefined;
                let dimsObj = dimensions;
                // Parse if it's a JSON string
                if (typeof dimensions === 'string') {
                    try {
                        dimsObj = JSON.parse(dimensions);
                    } catch (e) {
                        return undefined;
                    }
                }
                // Validate and parse dimensions - handle empty strings and invalid values
                const parseDimension = (val) => {
                    if (!val || val === '' || val === '0') return undefined;
                    const parsed = parseFloat(val);
                    return isNaN(parsed) ? undefined : parsed;
                };
                
                const length = parseDimension(dimsObj.length);
                const width = parseDimension(dimsObj.width);
                const height = parseDimension(dimsObj.height);
                
                // Only set if at least one dimension is valid
                if (length !== undefined || width !== undefined || height !== undefined) {
                    return {
                        ...(length !== undefined && { length }),
                        ...(width !== undefined && { width }),
                        ...(height !== undefined && { height }),
                    };
                }
                return undefined;
            })(),
            isActive: isActive !== undefined ? isActive : true,
            isFeatured: isFeatured !== undefined ? isFeatured : false,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())).filter(Boolean) : [],
            metaTitle: metaTitle?.trim(),
            metaDescription: metaDescription?.trim(),
        });

        const populatedProduct = await Product.findById(product._id)
            .populate('categoryId', 'name')
            .populate('subcategoryId', 'name');

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: populatedProduct,
        });
    } catch (error) {
        console.error(error);
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
            data: null,
        });
    }
};

// ================= UPDATE PRODUCT (ADMIN) =================
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            shortDescription,
            price,
            compareAtPrice,
            sku,
            categoryId,
            subcategoryId,
            stock,
            trackInventory,
            weight,
            dimensions,
            isActive,
            isFeatured,
            tags,
            metaTitle,
            metaDescription,
            existingImages, // JSON array of existing image URLs to keep
        } = req.body;

        const newImageFiles = req.files || [];

        const product = await Product.findById(id);
        if (!product) {
            newImageFiles.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
            return res.status(404).json({
                success: false,
                message: "Product not found",
                data: null,
            });
        }

        // Validate category if changed
        if (categoryId && categoryId !== product.categoryId.toString()) {
            const category = await Category.findById(categoryId);
            if (!category) {
                newImageFiles.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                return res.status(400).json({
                    success: false,
                    message: "Category not found",
                    data: null,
                });
            }
        }

        // Validate subcategory if changed
        if (subcategoryId) {
            const subcategory = await Subcategory.findById(subcategoryId);
            const catId = categoryId || product.categoryId.toString();
            if (!subcategory || subcategory.categoryId.toString() !== catId) {
                newImageFiles.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                return res.status(400).json({
                    success: false,
                    message: "Subcategory not found or doesn't belong to the selected category",
                    data: null,
                });
            }
        }

        // Check SKU uniqueness if changed
        if (sku && sku.trim() !== product.sku) {
            const existingProduct = await Product.findOne({ sku: sku.trim() });
            if (existingProduct) {
                newImageFiles.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                return res.status(400).json({
                    success: false,
                    message: "Product with this SKU already exists",
                    data: null,
                });
            }
        }

        // Handle images
        let finalImages = [];
        if (existingImages) {
            try {
                const existingImagesArray = typeof existingImages === 'string' 
                    ? JSON.parse(existingImages) 
                    : existingImages;
                finalImages = Array.isArray(existingImagesArray) ? existingImagesArray : [];
            } catch (e) {
                finalImages = product.images; // Fallback to existing images
            }
        } else {
            finalImages = product.images; // Keep existing if not specified
        }

        // Upload new images
        if (newImageFiles.length > 0) {
            try {
                for (const file of newImageFiles) {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "products"
                    });
                    finalImages.push(result.secure_url);
                    fs.unlinkSync(file.path);
                }
            } catch (uploadError) {
                newImageFiles.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                throw uploadError;
            }
        }

        if (finalImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required",
                data: null,
            });
        }

        // Update product fields
        if (name) product.name = name.trim();
        if (description) product.description = description.trim();
        if (shortDescription !== undefined) product.shortDescription = shortDescription?.trim();
        if (price !== undefined) product.price = parseFloat(price);
        if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
        if (sku !== undefined) product.sku = sku?.trim() || null;
        if (categoryId) product.categoryId = categoryId;
        if (subcategoryId !== undefined) product.subcategoryId = subcategoryId || null;
        product.images = finalImages;
        if (stock !== undefined) product.stock = parseInt(stock);
        if (trackInventory !== undefined) product.trackInventory = trackInventory;
        if (weight !== undefined) product.weight = weight ? parseFloat(weight) : null;
        if (dimensions !== undefined) {
            let dimsObj = dimensions;
            // Parse if it's a JSON string
            if (typeof dimensions === 'string') {
                try {
                    dimsObj = JSON.parse(dimensions);
                } catch (e) {
                    dimsObj = null;
                }
            }
            
            if (dimsObj) {
                // Validate and parse dimensions - handle empty strings and invalid values
                const parseDimension = (val) => {
                    if (!val || val === '' || val === '0') return undefined;
                    const parsed = parseFloat(val);
                    return isNaN(parsed) ? undefined : parsed;
                };
                
                const length = parseDimension(dimsObj.length);
                const width = parseDimension(dimsObj.width);
                const height = parseDimension(dimsObj.height);
                
                // Only set if at least one dimension is valid
                if (length !== undefined || width !== undefined || height !== undefined) {
                    product.dimensions = {
                        ...(length !== undefined && { length }),
                        ...(width !== undefined && { width }),
                        ...(height !== undefined && { height }),
                    };
                } else {
                    product.dimensions = undefined;
                }
            } else {
                product.dimensions = undefined;
            }
        }
        if (isActive !== undefined) product.isActive = isActive;
        if (isFeatured !== undefined) product.isFeatured = isFeatured;
        if (tags !== undefined) {
            product.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
        }
        if (metaTitle !== undefined) product.metaTitle = metaTitle?.trim() || null;
        if (metaDescription !== undefined) product.metaDescription = metaDescription?.trim() || null;

        await product.save();

        const populatedProduct = await Product.findById(product._id)
            .populate('categoryId', 'name')
            .populate('subcategoryId', 'name');

        res.json({
            success: true,
            message: "Product updated successfully",
            data: populatedProduct,
        });
    } catch (error) {
        console.error(error);
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
            data: null,
        });
    }
};

// ================= DELETE PRODUCT (ADMIN) =================
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                data: null,
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully",
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
