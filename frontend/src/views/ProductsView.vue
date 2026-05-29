<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Lista de productos</h1>
        <p class="page-subtitle">Explora, filtra y accede rapidamente a detalle del producto.</p>
      </div>
    </div>

    <div class="panel-stack">
      <BaseErrorState
        v-if="productStore.error && !productStore.loading"
        :description="productStore.error"
        @retry="productStore.fetchProducts(true)"
      />

      <BaseLoader v-else-if="productStore.loading" />

      <BaseEmptyState
        v-else-if="!productStore.products.length"
        title="No hay productos para mostrar"
        description="Ajusta los filtros o intenta nuevamente con otros criterios."
      />

      <ProductTable
        v-else
        :products="productStore.products"
        :filters="productStore.filters"
        :categories="productStore.categoryCatalog"
        :pagination="productStore.pagination"
        @apply-filters="handleApplyFilters"
        @view-detail="goToDetail"
        @view-inventory="openInventory"
        @purchase="openPurchase"
        @previous-page="handlePreviousPage"
        @next-page="handleNextPage"
        @go-to-page="handleGoToPage"
        @change-size="handleChangeSize"
      />
    </div>

    <ProductInventoryModal
      :show="inventoryModal"
      :inventory="productStore.inventory"
      :product="activeProduct"
      @update:show="inventoryModal = $event"
    />

    <BaseModal :show="purchaseModal" title="Compra rapida" @update:show="purchaseModal = $event">
      <ProductPurchaseForm
        v-if="activeProduct"
        :product="activeProduct"
        :loading="purchaseStore.creating"
        @submit="handlePurchase"
      />
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "../components/layout/AppLayout.vue";
import BaseEmptyState from "../components/base/BaseEmptyState.vue";
import BaseErrorState from "../components/base/BaseErrorState.vue";
import BaseLoader from "../components/base/BaseLoader.vue";
import BaseModal from "../components/base/BaseModal.vue";
import ProductInventoryModal from "../components/products/ProductInventoryModal.vue";
import ProductPurchaseForm from "../components/products/ProductPurchaseForm.vue";
import ProductTable from "../components/products/ProductTable.vue";
import { useAuthStore } from "../stores/auth.store";
import { useProductStore } from "../stores/product.store";
import { usePurchaseStore } from "../stores/purchase.store";
import { useNotifications } from "../composables/useNotifications";

const router = useRouter();
const authStore = useAuthStore();
const productStore = useProductStore();
const purchaseStore = usePurchaseStore();
const notifications = useNotifications();

const inventoryModal = ref(false);
const purchaseModal = ref(false);
const activeProduct = ref(null);

onMounted(async () => {
  try {
    await authStore.fetchMe();
    await productStore.fetchProducts();
  } catch (_) {
    notifications.error(productStore.error || authStore.error);
  }
});

function handleApplyFilters(nextFilters) {
  productStore.setFilters(nextFilters);
  productStore.fetchProducts(true);
}

function handlePreviousPage() {
  if (productStore.pagination.page === 0) {
    return;
  }
  productStore.setFilters({ page: productStore.pagination.page - 1 });
  productStore.fetchProducts(true);
}

function handleNextPage() {
  if (productStore.pagination.last) {
    return;
  }
  productStore.setFilters({ page: productStore.pagination.page + 1 });
  productStore.fetchProducts(true);
}

function handleGoToPage(page) {
  if (page === productStore.pagination.page) {
    return;
  }

  productStore.setFilters({ page });
  productStore.fetchProducts(true);
}

function handleChangeSize(size) {
  productStore.setFilters({
    page: 0,
    size
  });
  productStore.fetchProducts(true);
}

function goToDetail(product) {
  router.push(`/products/${product.id}`);
}

async function openInventory(product) {
  try {
    activeProduct.value = product;
    await productStore.fetchInventory(product.id);
    inventoryModal.value = true;
  } catch (_) {
    notifications.error(productStore.error);
  }
}

function openPurchase(product) {
  activeProduct.value = product;
  purchaseModal.value = true;
}

async function handlePurchase(payload) {
  try {
    await purchaseStore.createPurchase(payload);
    notifications.success("Compra realizada exitosamente.");
    purchaseModal.value = false;
  } catch (_) {
    notifications.error(purchaseStore.error);
  }
}
</script>

<style scoped>
.welcome-kicker {
  margin: 0 0 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-muted);
}
</style>
