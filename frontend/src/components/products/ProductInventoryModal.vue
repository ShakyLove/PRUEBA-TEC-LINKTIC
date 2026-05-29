<template>
  <n-modal
    :show="show"
    preset="card"
    class="inventory-modal"
    :bordered="false"
    :mask-closable="true"
    @update:show="$emit('update:show', $event)"
  >
    <template #header>
      <div class="modal-header">
        <h2>Inventario del producto</h2>
      </div>
    </template>

    <template v-if="resolvedInventory">
      <section class="hero-card">
        <div class="hero-main">
          <img class="product-thumb" :src="resolvedImage" :alt="resolvedInventory.productName" />

          <div class="hero-copy">
            <strong>{{ resolvedInventory.productName }}</strong>
            <span class="category-pill" :style="categoryStyle(resolvedCategory)">
              {{ resolvedCategory }}
            </span>
          </div>
        </div>

        <div class="stock-card">
          <span>Stock actual</span>
          <strong>{{ resolvedInventory.availableQuantity }}</strong>
          <p>unidades</p>
        </div>
      </section>

      <section class="history-card">
        <div class="history-head">
          <div class="history-icon">
            <FontAwesomeIcon :icon="faCalendarDays" />
          </div>

          <div>
            <h3>Historial de compras</h3>
            <p>Ultimas compras registradas de este producto.</p>
          </div>
        </div>

        <div class="history-table-shell">
          <table class="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in recentPurchases" :key="`${item.createdAt}-${index}`">
                <td>
                  <div class="date-cell">
                    <FontAwesomeIcon :icon="faCalendarDays" />
                    <span>{{ formatDateTime(item.createdAt) }}</span>
                  </div>
                </td>
                <td class="quantity-cell">{{ quantityLabel(item.quantity) }}</td>
                <td>{{ formatCurrency(item.total) }}</td>
                <td>
                  <div class="user-cell">
                    <span class="user-dot" />
                    <span>{{ item.userFullName }}</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!recentPurchases.length">
                <td colspan="4" class="empty-row">
                  No hay compras registradas para este producto.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="history-note">
          <FontAwesomeIcon :icon="faCircleInfo" />
          <span>Este historial muestra las ultimas 5 compras del producto.</span>
        </div>
      </section>
    </template>
  </n-modal>
</template>

<script setup>
import { computed } from "vue";
import { NModal } from "naive-ui";
import { faCalendarDays, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { formatCurrency } from "../../utils/currency";
import { formatDateTime } from "../../utils/date";

const props = defineProps({
  show: Boolean,
  inventory: {
    type: Object,
    default: null
  },
  product: {
    type: Object,
    default: null
  },
  purchaseHistory: {
    type: Array,
    default: () => []
  }
});

defineEmits(["update:show"]);

const resolvedInventory = computed(() => props.inventory || props.product || null);
const resolvedImage = computed(() => props.inventory?.imageUrl || props.product?.imageUrl || "");
const resolvedCategory = computed(() => props.inventory?.category || props.product?.category || "Sin categoria");
const recentPurchases = computed(() => props.purchaseHistory.length ? props.purchaseHistory : (props.inventory?.recentPurchases || []));

function quantityLabel(quantity) {
  return quantity === 1 ? "1 unidad" : `${quantity} unidades`;
}

function categoryStyle(category) {
  const normalized = String(category || "").toLowerCase();

  if (normalized.includes("tec")) {
    return { background: "rgba(139, 92, 246, 0.12)", color: "#7c3aed" };
  }
  if (normalized.includes("acce")) {
    return { background: "rgba(59, 130, 246, 0.12)", color: "#2563eb" };
  }
  if (normalized.includes("audio")) {
    return { background: "rgba(249, 115, 22, 0.12)", color: "#ea580c" };
  }
  if (normalized.includes("ofi")) {
    return { background: "rgba(244, 114, 182, 0.12)", color: "#db2777" };
  }

  return { background: "var(--color-surface-soft)", color: "var(--color-primary-soft)" };
}
</script>

<style scoped>
.modal-header h2 {
  margin: 0;
  font-size: 1.06rem;
  font-weight: 800;
  color: #182033;
}

:deep(.inventory-modal .n-card) {
  width: min(760px, calc(100vw - 40px));
  max-width: 760px;
  border-radius: 24px;
  overflow: hidden;
  margin: 0 auto;
}

:deep(.inventory-modal) {
  width: auto;
  max-width: 760px;
  margin: 0 auto;
}

:deep(.inventory-modal .n-card-header) {
  padding: 18px 22px 10px;
}

:deep(.inventory-modal .n-card__content) {
  padding: 6px 22px 22px;
}

:deep(.inventory-modal .n-base-close) {
  top: 18px;
  right: 20px;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 118px;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 18px;
  margin-bottom: 16px;
}

.hero-main {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.product-thumb {
  width: 76px;
  height: 76px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  background: #f8fafc;
}

.hero-copy strong {
  display: block;
  margin-bottom: 10px;
  font-size: 0.98rem;
  color: var(--color-primary);
}

.category-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
}

.stock-card {
  min-height: 112px;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.92);
  display: grid;
  place-items: center;
  text-align: center;
  padding: 12px;
}

.stock-card span,
.history-head p,
.history-note span,
.empty-row {
  color: var(--color-muted);
}

.stock-card span {
  font-size: 0.82rem;
}

.stock-card strong {
  font-size: 1.95rem;
  line-height: 1;
  color: var(--color-accent);
}

.stock-card p {
  margin: 0;
  color: var(--color-primary-soft);
  font-size: 0.82rem;
}

.history-card {
  display: grid;
  gap: 14px;
}

.history-head {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.history-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(148, 163, 184, 0.12);
  color: #64748b;
}

.history-head h3 {
  margin: 0 0 4px;
  font-size: 0.96rem;
}

.history-head p {
  margin: 0;
  font-size: 0.84rem;
}

.history-table-shell {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.82);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  padding: 11px 14px;
  background: #fbfbfc;
  color: var(--color-muted);
  text-align: left;
  font-size: 0.78rem;
  font-weight: 700;
}

.history-table td {
  padding: 13px 14px;
  border-top: 1px solid rgba(229, 231, 235, 0.82);
  font-size: 0.88rem;
  color: var(--color-primary);
  vertical-align: middle;
}

.date-cell,
.user-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.date-cell svg {
  color: #64748b;
}

.quantity-cell {
  color: var(--color-accent);
  font-weight: 600;
}

.user-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}

.empty-row {
  text-align: center;
  padding: 22px 18px;
}

.history-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(147, 197, 253, 0.4);
  color: #3b82f6;
  font-size: 0.84rem;
}

@media (max-width: 820px) {
  :deep(.inventory-modal .n-card) {
    width: min(100%, calc(100vw - 20px));
  }

  :deep(.inventory-modal .n-card-header) {
    padding: 20px 18px 12px;
  }

  :deep(.inventory-modal .n-card__content) {
    padding: 8px 18px 20px;
  }

  .hero-card {
    grid-template-columns: 1fr;
  }

  .history-table-shell {
    overflow-x: auto;
  }

  .history-table {
    min-width: 620px;
  }
}
</style>
