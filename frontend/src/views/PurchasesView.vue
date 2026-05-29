<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <p class="welcome-kicker">Compras registradas</p>
        <h1 class="page-title">Lista de compras</h1>
        <p class="page-subtitle">Revisa el historial, expande cada fila y consulta el detalle sin salir de la tabla.</p>
      </div>
    </div>

    <div class="panel-stack">
      <BaseErrorState
        v-if="purchaseStore.error && !purchaseStore.loading"
        :description="purchaseStore.error"
        @retry="loadPurchases"
      />

      <BaseLoader v-else-if="purchaseStore.loading && !purchaseStore.purchases.length" />

      <BaseEmptyState
        v-else-if="!purchaseStore.purchases.length"
        title="Sin compras registradas"
        description="Todavia no hay compras asociadas al usuario autenticado."
      />

      <PurchaseTable
        v-else
        :purchases="purchaseStore.purchases"
        :pagination="purchaseStore.pagination"
        :expanded-purchase-id="expandedPurchaseId"
        :expanded-detail="expandedDetail"
        :purchase-details-map="purchaseStore.purchaseDetails"
        :product-image-map="productStore.productImageMap"
        :detail-loading="detailLoading"
        @new-purchase="goToProducts"
        @toggle-detail="toggleDetail"
        @previous-page="handlePreviousPage"
        @next-page="handleNextPage"
        @go-to-page="handleGoToPage"
        @change-size="handleChangeSize"
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "../components/layout/AppLayout.vue";
import BaseEmptyState from "../components/base/BaseEmptyState.vue";
import BaseErrorState from "../components/base/BaseErrorState.vue";
import BaseLoader from "../components/base/BaseLoader.vue";
import PurchaseTable from "../components/purchases/PurchaseTable.vue";
import { useNotifications } from "../composables/useNotifications";
import { useProductStore } from "../stores/product.store";
import { usePurchaseStore } from "../stores/purchase.store";

const router = useRouter();
const productStore = useProductStore();
const purchaseStore = usePurchaseStore();
const notifications = useNotifications();

const expandedPurchaseId = ref(null);
const detailLoading = ref(false);

onMounted(loadPurchases);

const expandedDetail = computed(() => {
  if (!expandedPurchaseId.value) {
    return null;
  }

  return purchaseStore.purchaseDetails[expandedPurchaseId.value] || null;
});

async function loadPurchases() {
  try {
    await Promise.all([
      purchaseStore.fetchPurchases({
        page: purchaseStore.pagination.page,
        size: purchaseStore.pagination.size
      }),
      productStore.fetchProductCatalog()
    ]);

    hydrateVisiblePurchaseDetails();
  } catch (_) {
    notifications.error(purchaseStore.error);
  }
}

async function hydrateVisiblePurchaseDetails() {
  const missingDetails = purchaseStore.purchases.filter(
    (purchase) => !purchaseStore.purchaseDetails[purchase.purchaseId]
  );

  if (!missingDetails.length) {
    return;
  }

  await Promise.allSettled(
    missingDetails.map((purchase) => purchaseStore.fetchPurchaseById(purchase.purchaseId))
  );
}

async function refreshPurchases(params) {
  try {
    await purchaseStore.fetchPurchases(params);
    hydrateVisiblePurchaseDetails();
  } catch (_) {
    notifications.error(purchaseStore.error);
  }
}

async function toggleDetail(purchase) {
  if (expandedPurchaseId.value === purchase.purchaseId) {
    expandedPurchaseId.value = null;
    return;
  }

  expandedPurchaseId.value = purchase.purchaseId;

  if (purchaseStore.purchaseDetails[purchase.purchaseId]) {
    return;
  }

  detailLoading.value = true;

  try {
    await purchaseStore.fetchPurchaseById(purchase.purchaseId);
  } catch (_) {
    notifications.error(purchaseStore.error);
    expandedPurchaseId.value = null;
  } finally {
    detailLoading.value = false;
  }
}

function handlePreviousPage() {
  if (purchaseStore.pagination.page === 0) {
    return;
  }

  expandedPurchaseId.value = null;
  refreshPurchases({
    page: purchaseStore.pagination.page - 1,
    size: purchaseStore.pagination.size
  });
}

function handleNextPage() {
  if (purchaseStore.pagination.last) {
    return;
  }

  expandedPurchaseId.value = null;
  refreshPurchases({
    page: purchaseStore.pagination.page + 1,
    size: purchaseStore.pagination.size
  });
}

function handleGoToPage(page) {
  if (page === purchaseStore.pagination.page) {
    return;
  }

  expandedPurchaseId.value = null;
  refreshPurchases({
    page,
    size: purchaseStore.pagination.size
  });
}

function handleChangeSize(size) {
  expandedPurchaseId.value = null;
  refreshPurchases({
    page: 0,
    size
  });
}

function goToProducts() {
  router.push("/purchases/new");
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
