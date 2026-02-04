import express from "express";
import {
    getCJAccessToken,
    getCJTokenStatus,
    getCategories,
    listProductsV2,
    getGlobalWarehouseList,
    listProducts,
    getProductDetails,
    getProductVariants,
    getVariantByVid,
    getInventoryByVid,
    getInventoryBySku,
    getInventoryByPid,
    createOrderV2,
    createOrderV3,
    addCart,
    addCartConfirm,
    saveGenerateParentOrder,
    getOrderList,
    getOrderDetail,
    deleteOrder,
    confirmOrder,
    changeOrderWarehouse,
    getWalletBalance,
    payBalance,
    payBalanceV2,
    uploadWaybillInfo,
    updateWaybillInfo,
    calculateFreight,
    calculateFreightTip,
    getSupplierLogisticsTemplate,
    getTrackInfo,
    trackInfo,
    estimateShipping
} from "../Controller/CJDropshippingCtrl.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Auth/Token Routes
router.post("/sync-token", getCJAccessToken);
router.get("/status", getCJTokenStatus);

// Product Routes
router.get("/get-categories", getCategories);
router.get("/list-products-v2", listProductsV2);
router.get("/warehouses", getGlobalWarehouseList);
router.get("/list-products", listProducts);
router.get("/product-details", getProductDetails);
router.get("/product-variants", getProductVariants);
router.get("/variant-details", getVariantByVid);

// Inventory Routes
router.get("/inventory-by-vid", getInventoryByVid);
router.get("/inventory-by-sku", getInventoryBySku);
router.get("/inventory-by-pid", getInventoryByPid);

// Shopping / Order Flow Routes
router.post("/create-order-v2", createOrderV2);
router.post("/create-order", createOrderV3);
router.post("/add-cart", addCart);
router.post("/cart-confirm", addCartConfirm);
router.post("/generate-parent-order", saveGenerateParentOrder);

// Order Management Routes
router.get("/list-orders", getOrderList);
router.get("/order-detail", getOrderDetail);
router.delete("/delete-order", deleteOrder);
router.patch("/confirm-order", confirmOrder);
router.post("/change-warehouse", changeOrderWarehouse);

// Payment Routes
router.get("/get-balance", getWalletBalance);
router.post("/pay-balance", payBalance);
router.post("/pay-balance-v2", payBalanceV2);

// Waybill / Shipping Routes
router.post("/upload-waybill", upload.single('waybillFile'), uploadWaybillInfo);
router.post("/update-waybill", upload.single('waybillFile'), updateWaybillInfo);

// Logistics & Tracking Routes
router.post("/freight-calculate", calculateFreight);
router.post("/freight-calculate-tip", calculateFreightTip);
router.post("/logistics-template", getSupplierLogisticsTemplate);
router.get("/track-info-v1", getTrackInfo);
router.get("/track-info-v2", trackInfo);
router.post("/estimate-shipping", estimateShipping);

export default router;
