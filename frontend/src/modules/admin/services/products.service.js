import apiClient from "@/lib/axios";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const API_URL = 'http://localhost:3000/api/v1/cj';

// Globally persistent cache (persists across HMR and module re-loads)
const getGlobalCache = () => {
    if (typeof window !== 'undefined') {
        if (!window.__CJ_CACHE__) {
            window.__CJ_CACHE__ = {
                categories: null,
                products: {},
                activeRequests: new Map() // URL+Params -> Promise
            };
        }
        return window.__CJ_CACHE__;
    }
    // Fallback for non-browser environments (e.g., SSR)
    return { categories: null, products: {}, activeRequests: new Map() };
};

const globalCache = getGlobalCache();

export const productsService = {
    getSupplierProducts: async (params = {}) => {
        const { page = 1, size = 20, keyWord = '', categoryId = '' } = params;
        const cacheKey = `products_${page}_${size}_${keyWord}_${categoryId}`;

        // 1. Check if we already have a success result in cache
        if (globalCache.products[cacheKey]) {
            console.log(`[Cache Hit] Products: ${cacheKey}`);
            return globalCache.products[cacheKey];
        }

        // 2. Check if there's an active request in flight for these exact params
        if (globalCache.activeRequests.has(cacheKey)) {
            console.log(`[Deduplicating] Products: ${cacheKey}`);
            return globalCache.activeRequests.get(cacheKey);
        }

        const fetchPromise = (async () => {
            try {
                console.log(`[Network Request] Products: ${cacheKey}`);
                console.log(`[Network Request] Products: ${cacheKey}`);
                const response = await apiClient.get(`/cj/list-products-v2`, {
                    params: { page, size, keyWord, categoryId }
                });
                const result = response.data;

                if (result.result === true || result.success === true) {
                    const data = result.data;
                    const productList = data.content?.[0]?.productList || data.list || [];
                    const mappedData = {
                        products: productList.map(product => {
                            const USD_TO_INR = 83;
                            const MARGIN = 1.3;

                            const convertPrice = (priceStr, mult = 1) => {
                                if (!priceStr) return "0.00";
                                const s = String(priceStr);
                                if (s.includes('--')) {
                                    return s.split('--')
                                        .map(p => Math.round(parseFloat(p.trim()) * mult * USD_TO_INR))
                                        .join(' -- ');
                                }
                                return Math.round(parseFloat(s) * mult * USD_TO_INR).toString();
                            };

                            const sellPrice = convertPrice(product.sellPrice, MARGIN);

                            return {
                                id: product.id || product.pid,
                                name: product.nameEn || product.productNameEn,
                                image: product.bigImage || product.productImage,
                                category: product.categoryName || product.oneCategoryName || 'General',
                                categoryId: product.categoryId,
                                sellPrice: sellPrice,
                                supplierPrice: convertPrice(product.sellPrice, 1),
                                price: sellPrice,
                                margin: 30,
                                stock: product.warehouseInventoryNum || 'Global',
                                pid: product.id || product.pid
                            };
                        }),
                        totalPages: data.totalPages || Math.ceil((data.totalRecords || 0) / size) || 1,
                        totalItems: data.totalRecords || data.total || 0
                    };
                    globalCache.products[cacheKey] = mappedData;
                    return mappedData;
                }
                throw new Error(result.message || "Failed to fetch products");
            } catch (error) {
                console.error("Fetch Products Error:", error);
                throw error;
            } finally {
                globalCache.activeRequests.delete(cacheKey); // Clear lock
            }
        })();

        globalCache.activeRequests.set(cacheKey, fetchPromise);
        return fetchPromise;
    },

    fetchCategories: async () => {
        // 1. Check if we already have the result in cache
        if (globalCache.categories) {
            console.log("[Cache Hit] Categories");
            return globalCache.categories;
        }

        // 2. Check if a request is already in flight
        const cacheKey = 'categories_main';
        if (globalCache.activeRequests.has(cacheKey)) {
            console.log("[Deduplicating] Categories");
            return globalCache.activeRequests.get(cacheKey);
        }

        const fetchPromise = (async () => {
            try {
                console.log("[Network Request] Categories");
                console.log("[Network Request] Categories");
                const response = await apiClient.get(`/cj/get-categories`);
                if (response.data.success && response.data.code === 200) {
                    const data = response.data.data;
                    globalCache.categories = data;
                    return data;
                }
                return [];
            } catch (error) {
                console.error("Fetch Categories Error:", error);
                return [];
            } finally {
                globalCache.activeRequests.delete(cacheKey); // Clear lock
            }
        })();

        globalCache.activeRequests.set(cacheKey, fetchPromise);
        return fetchPromise;
    },

    clearCache: () => {
        console.log("[Cache Cleared]");
        globalCache.categories = null;
        globalCache.products = {};
        globalCache.activeRequests.clear();
    },

    updateProductMargin: async (id, margin) => {
        // This would likely involve saving the margin in our own DB
        // For now, we simulate success
        console.log(`Product ${id} margin updated to ${margin}%`);
        return { success: true, id, margin };
    },

    getProductDetails: async (pid) => {
        const cacheKey = `detail_${pid}`;

        // 1. Check if we already have the result in cache
        if (globalCache.products[cacheKey]) {
            console.log(`[Cache Hit] Product Detail: ${pid}`);
            return globalCache.products[cacheKey];
        }

        // 2. Check if a request is already in flight
        if (globalCache.activeRequests.has(cacheKey)) {
            console.log(`[Deduplicating] Product Detail: ${pid}`);
            return globalCache.activeRequests.get(cacheKey);
        }

        const fetchPromise = (async () => {
            try {
                console.log(`[Network Request] Product Detail: ${pid}`);
                console.log(`[Network Request] Product Detail: ${pid}`);
                const response = await apiClient.get(`/cj/product-details`, { params: { pid } });
                const result = response.data;
                globalCache.products[cacheKey] = result;
                return result;
            } catch (error) {
                console.error("Fetch Product Details Error:", error);
                throw error;
            } finally {
                globalCache.activeRequests.delete(cacheKey); // Clear lock
            }
        })();

        globalCache.activeRequests.set(cacheKey, fetchPromise);
        return fetchPromise;
    },

    toggleProductVisibility: async (id, visible) => {
        console.log(`Product ${id} visibility set to ${visible}`);
        return { success: true, id, visible };
    }
};
