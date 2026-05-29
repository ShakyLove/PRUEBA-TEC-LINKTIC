import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { productService } from "../services/product.service";

const cache = new Map();
const CACHE_TTL = 120000;

function defaultFilters() {
  return {
    page: 0,
    size: 8,
    search: "",
    category: null,
    sortBy: "id",
    direction: "asc"
  };
}

export const useProductStore = defineStore("products", () => {
  const products = ref([]);
  const selectedProduct = ref(null);
  const inventory = ref(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const inventoryLoading = ref(false);
  const error = ref("");
  const pagination = ref({
    page: 0,
    size: 8,
    totalElements: 0,
    totalPages: 0,
    last: true
  });
  const filters = ref(defaultFilters());
  const categoryCatalog = ref([]);
  const productCatalog = ref([]);

  const lowStockProducts = computed(() =>
    products.value.filter((product) => product.stock <= product.minimumStock)
  );

  const productImageMap = computed(() =>
    productCatalog.value.reduce((accumulator, product) => {
      accumulator[product.id] = product.imageUrl || "";
      return accumulator;
    }, {})
  );

  async function fetchProducts(force = false) {
    loading.value = true;
    error.value = "";

    const key = JSON.stringify(filters.value);
    const cached = cache.get(key);

    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      hydrate(cached.data);
      loading.value = false;
      return cached.data;
    }

    try {
      const { data } = await productService.getProducts(filters.value);
      hydrate(data);
      cache.set(key, { data, timestamp: Date.now() });
      await fetchCategoryCatalog();
      return data;
    } catch (apiError) {
      error.value = apiError.message;
      throw apiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProductById(id) {
    detailLoading.value = true;
    error.value = "";

    try {
      const { data } = await productService.getProductById(id);
      selectedProduct.value = data;
      return data;
    } catch (apiError) {
      error.value = apiError.message;
      throw apiError;
    } finally {
      detailLoading.value = false;
    }
  }

  async function fetchInventory(id) {
    inventoryLoading.value = true;
    error.value = "";

    try {
      const { data } = await productService.getProductInventory(id);
      inventory.value = data;
      return data;
    } catch (apiError) {
      error.value = apiError.message;
      throw apiError;
    } finally {
      inventoryLoading.value = false;
    }
  }

  function setFilters(nextFilters) {
    filters.value = {
      ...filters.value,
      ...nextFilters
    };
  }

  function resetFilters() {
    filters.value = defaultFilters();
  }

  async function fetchCategoryCatalog() {
    if (categoryCatalog.value.length) {
      return categoryCatalog.value;
    }

    const { data } = await productService.getProducts({
      page: 0,
      size: 100,
      sortBy: "category",
      direction: "asc"
    });

    categoryCatalog.value = [...new Set(data.content.map((product) => product.category))];
    return categoryCatalog.value;
  }

  async function fetchProductCatalog(force = false) {
    if (!force && productCatalog.value.length) {
      return productCatalog.value;
    }

    const { data } = await productService.getProducts({
      page: 0,
      size: 100,
      sortBy: "id",
      direction: "asc"
    });

    productCatalog.value = data.content;
    return productCatalog.value;
  }

  function hydrate(data) {
    products.value = data.content;
    pagination.value = {
      page: data.page,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      last: data.last
    };
  }

  return {
    products,
    selectedProduct,
    inventory,
    loading,
    detailLoading,
    inventoryLoading,
    error,
    pagination,
    filters,
    categoryCatalog,
    productCatalog,
    productImageMap,
    lowStockProducts,
    fetchProducts,
    fetchProductById,
    fetchInventory,
    fetchProductCatalog,
    setFilters,
    resetFilters
  };
});
