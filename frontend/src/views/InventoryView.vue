<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <h1 class="page-title">Inventario</h1>
        <p class="page-subtitle">Consulta el estado actual del inventario, movimientos y valor total.</p>
      </div>
    </div>

    <div class="panel-stack">
      <BaseErrorState
        v-if="errorMessage && !loading"
        :description="errorMessage"
        @retry="loadInventory"
      />

      <BaseLoader v-else-if="loading" />

      <template v-else>
        <section class="inventory-stats">
          <article class="surface-card stat-card is-violet">
            <div class="stat-icon">
              <FontAwesomeIcon :icon="faCube" />
            </div>
            <div>
              <p>Valor total inventario</p>
              <strong>{{ formatCurrency(totalInventoryValue) }}</strong>
              <span>Actualizado hoy</span>
            </div>
          </article>

          <article class="surface-card stat-card is-green">
            <div class="stat-icon">
              <FontAwesomeIcon :icon="faBoxesStacked" />
            </div>
            <div>
              <p>Total productos</p>
              <strong>{{ inventoryProducts.length }}</strong>
              <span>Activos en inventario</span>
            </div>
          </article>

          <article class="surface-card stat-card is-blue">
            <div class="stat-icon">
              <FontAwesomeIcon :icon="faLayerGroup" />
            </div>
            <div>
              <p>Stock total</p>
              <strong>{{ totalStock }}</strong>
              <span>Unidades disponibles</span>
            </div>
          </article>

          <article class="surface-card stat-card is-warning">
            <div class="stat-icon">
              <FontAwesomeIcon :icon="faTriangleExclamation" />
            </div>
            <div>
              <p>Bajo stock</p>
              <strong>{{ lowStockCount }}</strong>
              <span>Requieren atención</span>
            </div>
          </article>
        </section>

        <BaseEmptyState
          v-if="!filteredProducts.length"
          title="Sin productos para mostrar"
          description="Ajusta los filtros del inventario para ver más resultados."
        />

        <InventoryTable
          v-else
          :products="paginatedProducts"
          :filters="filters"
          :categories="categories"
          :pagination="pagination"
          @update-filter="handleFilterUpdate"
          @reset-page="resetPage"
          @change-size="handleChangeSize"
          @previous-page="handlePreviousPage"
          @next-page="handleNextPage"
          @go-to-page="handleGoToPage"
          @view-detail="goToDetail"
          @view-inventory="openInventory"
          @purchase="openPurchase"
        />
      </template>
    </div>

    <ProductInventoryModal
      :show="inventoryModal"
      :inventory="productStore.inventory"
      :product="activeProduct"
      :purchase-history="inventoryHistory"
      @update:show="inventoryModal = $event"
    />

    <BaseModal :show="purchaseModal" title="Compra rápida" @update:show="purchaseModal = $event">
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
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  faBoxesStacked,
  faCube,
  faLayerGroup,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import AppLayout from "../components/layout/AppLayout.vue";
import BaseEmptyState from "../components/base/BaseEmptyState.vue";
import BaseErrorState from "../components/base/BaseErrorState.vue";
import BaseLoader from "../components/base/BaseLoader.vue";
import BaseModal from "../components/base/BaseModal.vue";
import InventoryTable from "../components/inventory/InventoryTable.vue";
import ProductInventoryModal from "../components/products/ProductInventoryModal.vue";
import ProductPurchaseForm from "../components/products/ProductPurchaseForm.vue";
import { useNotifications } from "../composables/useNotifications";
import { useAuthStore } from "../stores/auth.store";
import { useProductStore } from "../stores/product.store";
import { usePurchaseStore } from "../stores/purchase.store";
import { formatCurrency } from "../utils/currency";

const router = useRouter();
const authStore = useAuthStore();
const productStore = useProductStore();
const purchaseStore = usePurchaseStore();
const notifications = useNotifications();

const loading = ref(true);
const errorMessage = ref("");
const inventoryModal = ref(false);
const purchaseModal = ref(false);
const activeProduct = ref(null);
const inventoryHistory = ref([]);

const filters = reactive({
  search: "",
  category: "",
  status: "",
  stockRange: ""
});

const pagination = reactive({
  page: 0,
  size: 8,
  totalItems: 0,
  totalPages: 0
});

onMounted(loadInventory);

const inventoryProducts = computed(() => productStore.productCatalog);

const categories = computed(() =>
  [...new Set(inventoryProducts.value.map((product) => product.category))]
);

const filteredProducts = computed(() => {
  return inventoryProducts.value.filter((product) => {
    const searchTerm = filters.search.trim().toLowerCase();
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesStatus = !filters.status || resolveStatusKey(product) === filters.status;
    const matchesStockRange = !filters.stockRange || matchesRange(product.stock, filters.stockRange);

    return matchesSearch && matchesCategory && matchesStatus && matchesStockRange;
  });
});

const paginatedProducts = computed(() => {
  const start = pagination.page * pagination.size;
  const end = start + pagination.size;
  return filteredProducts.value.slice(start, end);
});

const totalInventoryValue = computed(() =>
  inventoryProducts.value.reduce(
    (total, product) => total + Number(product.price || 0) * Number(product.stock || 0),
    0
  )
);

const totalStock = computed(() =>
  inventoryProducts.value.reduce((total, product) => total + Number(product.stock || 0), 0)
);

const lowStockCount = computed(() =>
  inventoryProducts.value.filter((product) => product.stock <= product.minimumStock).length
);

async function loadInventory() {
  loading.value = true;
  errorMessage.value = "";

  try {
    await authStore.fetchMe();
    await productStore.fetchProductCatalog();
    syncPagination();
  } catch (_) {
    errorMessage.value = productStore.error || authStore.error || "No fue posible cargar el inventario.";
    notifications.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
}

function resolveStatusKey(product) {
  if (product.stock === 0) {
    return "out";
  }
  if (product.stock <= product.minimumStock) {
    return "low";
  }
  return "available";
}

function matchesRange(stock, range) {
  if (range === "0-5") {
    return stock >= 0 && stock <= 5;
  }
  if (range === "6-20") {
    return stock >= 6 && stock <= 20;
  }
  if (range === "21+") {
    return stock >= 21;
  }
  return true;
}

function syncPagination() {
  pagination.totalItems = filteredProducts.value.length;
  pagination.totalPages = Math.max(Math.ceil(pagination.totalItems / pagination.size), 1);

  if (pagination.page > pagination.totalPages - 1) {
    pagination.page = Math.max(pagination.totalPages - 1, 0);
  }
}

function handleFilterUpdate({ key, value }) {
  filters[key] = value;
  pagination.page = 0;
  syncPagination();
}

function resetPage() {
  pagination.page = 0;
  syncPagination();
}

function handleChangeSize(size) {
  pagination.size = size;
  pagination.page = 0;
  syncPagination();
}

function handlePreviousPage() {
  if (pagination.page === 0) {
    return;
  }
  pagination.page -= 1;
}

function handleNextPage() {
  if (pagination.page >= pagination.totalPages - 1) {
    return;
  }
  pagination.page += 1;
}

function handleGoToPage(page) {
  if (page === pagination.page) {
    return;
  }
  pagination.page = page;
}

function goToDetail(product) {
  router.push(`/products/${product.id}`);
}

async function openInventory(product) {
  try {
    activeProduct.value = product;
    await Promise.all([
      productStore.fetchInventory(product.id),
      hydrateInventoryHistory(product.id)
    ]);
    inventoryModal.value = true;
  } catch (_) {
    notifications.error(productStore.error);
  }
}

async function hydrateInventoryHistory(productId) {
  inventoryHistory.value = [];

  try {
    await purchaseStore.fetchPurchases({
      page: 0,
      size: 50
    });

    await Promise.allSettled(
      purchaseStore.purchases.map((purchase) => purchaseStore.fetchPurchaseById(purchase.purchaseId))
    );

    inventoryHistory.value = Object.values(purchaseStore.purchaseDetails)
      .flatMap((detail) =>
        (detail.items || [])
          .filter((item) => item.productId === productId)
          .map((item) => ({
            createdAt: detail.createdAt,
            quantity: item.quantity,
            total: item.subtotal,
            userFullName: detail.userFullName || "Administrador"
          }))
      )
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 5);
  } catch (_) {
    inventoryHistory.value = [];
  }
}

function openPurchase(product) {
  activeProduct.value = product;
  purchaseModal.value = true;
}

async function handlePurchase(payload) {
  try {
    await purchaseStore.createPurchase(payload);
    await productStore.fetchProductCatalog(true);
    syncPagination();
    notifications.success("Compra realizada exitosamente.");
    purchaseModal.value = false;
  } catch (_) {
    notifications.error(purchaseStore.error);
  }
}
</script>

<style scoped>
.inventory-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 18px 20px;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 1.15rem;
}

.stat-card p,
.stat-card span {
  margin: 0;
  font-size: 0.88rem;
}

.stat-card p {
  color: var(--color-primary-soft);
  margin-bottom: 8px;
}

.stat-card strong {
  display: block;
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.stat-card span {
  color: var(--color-muted);
}

.stat-card.is-violet .stat-icon {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}

.stat-card.is-green .stat-icon {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.stat-card.is-blue .stat-icon {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.stat-card.is-warning .stat-icon {
  background: rgba(249, 115, 22, 0.12);
  color: #ea580c;
}

@media (max-width: 1180px) {
  .inventory-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .inventory-stats {
    grid-template-columns: 1fr;
  }
}
</style>
