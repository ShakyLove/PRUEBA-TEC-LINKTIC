<template>
  <AppLayout>
    <BaseLoader v-if="productStore.detailLoading" variant="inline" text="Cargando detalle del producto..." />

    <BaseErrorState
      v-else-if="productStore.error && !selectedProduct"
      :description="productStore.error"
      @retry="loadDetail"
    />

    <div v-else-if="selectedProduct" class="detail-page">
      <section class="surface-card detail-card">
        <div class="detail-shell">
          <header class="detail-actions">
            <button class="back-button" type="button" @click="goBack">
              <FontAwesomeIcon :icon="faArrowLeft" />
              <span>Volver</span>
            </button>
          </header>

          <section class="surface-card hero-card">
            <div class="hero-grid">
              <div class="media-column">
                <div class="media-frame">
                  <img class="detail-image" :src="selectedProduct.imageUrl" :alt="selectedProduct.name" />
                </div>
              </div>

              <div class="content-column">
                <div class="content-head">
                  <span class="category-badge">
                    <FontAwesomeIcon :icon="faTag" />
                    {{ selectedProduct.category }}
                  </span>

                  <h1>{{ selectedProduct.name }}</h1>
                  <div class="price-block">{{ formatCurrency(selectedProduct.price) }}</div>

                  <div class="status-row">
                    <span class="status-badge is-success" v-if="stockState === 'Disponible'">
                      <FontAwesomeIcon :icon="faCircleCheck" />
                      Disponible
                    </span>
                    <span class="status-badge is-warning" v-else-if="stockState === 'Stock bajo'">
                      <FontAwesomeIcon :icon="faTriangleExclamation" />
                      Stock bajo
                    </span>
                    <span class="status-badge is-danger" v-else>
                      <FontAwesomeIcon :icon="faCircleXmark" />
                      Agotado
                    </span>

                    <span class="neutral-badge">
                      <FontAwesomeIcon :icon="faCube" />
                      Stock: {{ selectedProduct.stock }} unidades
                    </span>

                    <span class="warning-badge">
                      <FontAwesomeIcon :icon="faArrowDownShortWide" />
                      Mínimo: {{ selectedProduct.minimumStock }} unidades
                    </span>
                  </div>
                </div>

                <div class="divider"></div>

                <section class="info-section">
                  <h2>Descripción</h2>
                  <p>{{ productDescription }}</p>
                </section>

                <section class="info-section">
                  <div class="section-title">
                    <h2>Detalles del producto</h2>
                  </div>

                  <div class="details-grid">
                    <div v-for="item in detailItems" :key="item.label" class="detail-item">
                      <div class="detail-icon" :class="item.tone">
                        <FontAwesomeIcon :icon="item.icon" />
                      </div>
                      <div>
                        <span>{{ item.label }}</span>
                        <strong>{{ item.value }}</strong>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>

    <ProductInventoryModal
      :show="inventoryModal"
      :inventory="productStore.inventory"
      :product="selectedProduct"
      @update:show="inventoryModal = $event"
    />
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  faArrowDownShortWide,
  faArrowLeft,
  faCircleCheck,
  faCircleDollarToSlot,
  faCircleXmark,
  faCube,
  faHashtag,
  faTag,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import AppLayout from "../components/layout/AppLayout.vue";
import BaseErrorState from "../components/base/BaseErrorState.vue";
import BaseLoader from "../components/base/BaseLoader.vue";
import ProductInventoryModal from "../components/products/ProductInventoryModal.vue";
import { useNotifications } from "../composables/useNotifications";
import { useProductStore } from "../stores/product.store";
import { formatCurrency } from "../utils/currency";

const route = useRoute();
const router = useRouter();
const notifications = useNotifications();
const productStore = useProductStore();

const inventoryModal = ref(false);

onMounted(loadDetail);

const selectedProduct = computed(() => productStore.selectedProduct);

const stockState = computed(() => {
  if (!selectedProduct.value) {
    return "";
  }

  if (selectedProduct.value.stock === 0) {
    return "Agotado";
  }

  if (selectedProduct.value.stock <= selectedProduct.value.minimumStock) {
    return "Stock bajo";
  }

  return "Disponible";
});

const productDescription = computed(
  () =>
    selectedProduct.value?.description ||
    "Este producto no tiene descripción registrada actualmente en el inventario."
);

const detailItems = computed(() => {
  if (!selectedProduct.value) {
    return [];
  }

  return [
    {
      label: "Categoría",
      value: selectedProduct.value.category,
      icon: faTag,
      tone: "tone-accent"
    },
    {
      label: "Precio",
      value: formatCurrency(selectedProduct.value.price),
      icon: faCircleDollarToSlot,
      tone: "tone-neutral"
    },
    {
      label: "Stock actual",
      value: `${selectedProduct.value.stock} unidades`,
      icon: faCube,
      tone: "tone-success"
    },
    {
      label: "Stock mínimo",
      value: `${selectedProduct.value.minimumStock} unidades`,
      icon: faArrowDownShortWide,
      tone: "tone-warning"
    },
    {
      label: "Estado",
      value: stockState.value,
      icon: stockState.value === "Disponible" ? faCircleCheck : faTriangleExclamation,
      tone:
        stockState.value === "Disponible"
          ? "tone-success"
          : stockState.value === "Stock bajo"
            ? "tone-warning"
            : "tone-danger"
    },
    {
      label: "ID producto",
      value: `#${selectedProduct.value.id}`,
      icon: faHashtag,
      tone: "tone-neutral"
    }
  ];
});

async function loadDetail() {
  try {
    await productStore.fetchProductById(route.params.id);
  } catch (_) {
    notifications.error(productStore.error);
  }
}

function goBack() {
  router.push("/products");
}

async function openInventory() {
  try {
    await productStore.fetchInventory(route.params.id);
    inventoryModal.value = true;
  } catch (_) {
    notifications.error(productStore.error);
  }
}
</script>

<style scoped>
.detail-page {
  padding-bottom: 10px;
}

.detail-card {
  width: min(100%, 90%);
  margin: 0 auto;
  padding: 0;
  border-radius: 28px;
  overflow: hidden;
}

.detail-shell {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.detail-actions {
  display: flex;
  justify-content: flex-start;
  gap: 14px;
  align-items: center;
}

.back-button {
  border: 0;
  font: inherit;
  transition: var(--transition-soft);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 38px;
  padding: 0 15px;
  border-radius: 14px;
  background: white;
  color: var(--color-primary);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.back-button:hover {
  background: #f8fafc;
}

.hero-card {
  padding: 18px;
  border-radius: 24px;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(360px, 0.98fr) minmax(0, 1.02fr);
  gap: 60px;
  align-items: start;
}

.media-column {
  display: grid;
}

.media-frame {
  min-height: 372px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: linear-gradient(180deg, #fbfbf9 0%, #f2f4f7 100%);
  overflow: hidden;
}

.detail-image {
  width: 100%;
  max-width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px;
  filter: drop-shadow(0 18px 24px rgba(15, 23, 42, 0.14));
}

.detail-item span,
.info-section p {
  color: var(--color-muted);
}

.detail-item span {
  display: block;
  font-size: 0.76rem;
  font-weight: 400;
}

.detail-icon {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 0.78rem;
}

.content-column {
  display: grid;
  gap: 14px;
  padding-top: 4px;
}

.content-head h1,
.info-section h2 {
  margin: 0;
  font-weight: 700;
}

.category-badge,
.status-badge,
.neutral-badge,
.warning-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1;
}

.category-badge {
  margin-bottom: 10px;
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}

.content-head h1 {
  font-size: clamp(1.9rem, 2.1vw, 2.35rem);
  color: #182033;
}

.price-block {
  margin-top: 12px;
  margin-bottom: 2px;
  font-size: clamp(2.15rem, 2.5vw, 2.9rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #182033;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.status-badge.is-success {
  background: rgba(22, 163, 74, 0.1);
  color: var(--color-success);
}

.status-badge.is-warning,
.warning-badge {
  background: rgba(245, 158, 11, 0.12);
  color: #c27a0b;
}

.status-badge.is-danger {
  background: rgba(220, 38, 38, 0.1);
  color: var(--color-danger);
}

.neutral-badge {
  background: rgba(34, 197, 94, 0.08);
  color: #15803d;
}

.divider {
  height: 1px;
  background: rgba(229, 231, 235, 0.95);
}

.info-section p {
  margin: 8px 0 0;
  line-height: 1.62;
  font-size: 0.92rem;
}

.section-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}

.detail-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 4px 10px 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.75);
}

.detail-item strong {
  display: block;
  margin-top: 4px;
  color: var(--color-primary);
  font-size: 0.95rem;
  font-weight: 700;
}

.detail-icon.tone-accent {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}

.detail-icon.tone-neutral {
  background: rgba(148, 163, 184, 0.14);
  color: #475569;
}

.detail-icon.tone-success {
  background: rgba(22, 163, 74, 0.12);
  color: var(--color-success);
}

.detail-icon.tone-warning {
  background: rgba(245, 158, 11, 0.14);
  color: #c27a0b;
}

.detail-icon.tone-danger {
  background: rgba(220, 38, 38, 0.12);
  color: var(--color-danger);
}

@media (max-width: 1120px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .media-frame {
    min-height: 320px;
  }
}

@media (max-width: 820px) {
  .detail-shell,
  .hero-card {
    padding: 16px;
  }

  .detail-actions,
  .section-title {
    flex-direction: column;
    align-items: stretch;
    display: flex;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .back-button {
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .detail-shell {
    padding: 12px;
  }

  .content-head h1 {
    font-size: 1.58rem;
  }

  .price-block {
    font-size: 1.82rem;
  }

  .media-frame {
    min-height: 250px;
    padding: 8px;
  }

  .detail-image {
    max-height: 234px;
  }
}
</style>
