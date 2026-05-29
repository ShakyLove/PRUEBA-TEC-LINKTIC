import { ref } from "vue";
import { defineStore } from "pinia";
import { purchaseService } from "../services/purchase.service";
import { useProductStore } from "./product.store";

export const usePurchaseStore = defineStore("purchases", () => {
  const purchases = ref([]);
  const selectedPurchase = ref(null);
  const purchaseDetails = ref({});
  const loading = ref(false);
  const creating = ref(false);
  const error = ref("");
  const pagination = ref({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    last: true
  });

  async function createPurchase(payload) {
    creating.value = true;
    error.value = "";

    try {
      const { data } = await purchaseService.createPurchase(payload);
      const productStore = useProductStore();
      await productStore.fetchProducts(true);
      return data;
    } catch (apiError) {
      error.value = apiError.message;
      throw apiError;
    } finally {
      creating.value = false;
    }
  }

  async function fetchPurchases(params = { page: 0, size: 10 }) {
    loading.value = true;
    error.value = "";

    try {
      const { data } = await purchaseService.getPurchases(params);
      purchases.value = data.content;
      pagination.value = {
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        last: data.last
      };
      return data;
    } catch (apiError) {
      error.value = apiError.message;
      throw apiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPurchaseById(id) {
    loading.value = true;
    error.value = "";

    if (purchaseDetails.value[id]) {
      selectedPurchase.value = purchaseDetails.value[id];
      loading.value = false;
      return purchaseDetails.value[id];
    }

    try {
      const { data } = await purchaseService.getPurchaseById(id);
      selectedPurchase.value = data;
      purchaseDetails.value = {
        ...purchaseDetails.value,
        [id]: data
      };
      return data;
    } catch (apiError) {
      error.value = apiError.message;
      throw apiError;
    } finally {
      loading.value = false;
    }
  }

  return {
    purchases,
    selectedPurchase,
    purchaseDetails,
    loading,
    creating,
    error,
    pagination,
    createPurchase,
    fetchPurchases,
    fetchPurchaseById
  };
});
