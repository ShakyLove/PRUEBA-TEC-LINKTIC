<template>
  <BaseCard class="table-shell">
    <div class="table-head">
      <div>
        <h2>Lista de compras</h2>
        <p class="muted-text">Consulta las compras registradas y expande cada fila para revisar sus productos.</p>
      </div>

      <button class="new-purchase-button" type="button" @click="$emit('new-purchase')">
        <FontAwesomeIcon :icon="faPlus" />
        <span>Nueva compra</span>
      </button>
    </div>

    <div class="table-scroll">
      <table class="purchases-table">
        <thead>
          <tr>
            <th>Compra</th>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Items</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="purchase in purchases" :key="purchase.purchaseId">
            <tr
              class="purchase-row"
              :class="{ 'is-expanded': expandedPurchaseId === purchase.purchaseId }"
              @click="$emit('toggle-detail', purchase)"
            >
              <td>
                <div class="purchase-cell">
                  <strong>Compra #{{ purchase.purchaseId }}</strong>
                  <p>ID: {{ purchase.purchaseId }}</p>
                </div>
              </td>
              <td class="date-cell">{{ formatDateTime(purchase.createdAt) }}</td>
              <td class="user-cell">{{ purchase.userFullName || "Administrador" }}</td>
              <td class="items-cell">{{ itemCountLabel(resolveItemCount(purchase)) }}</td>
              <td>
                <span class="status-pill" :class="statusClass(purchase.status)">
                  <FontAwesomeIcon v-if="purchase.status === 'COMPLETED'" :icon="faCircleCheck" />
                  {{ statusLabel(purchase.status) }}
                </span>
              </td>
              <td class="total-cell">{{ formatCurrency(purchase.totalAmount) }}</td>
              <td>
                <div class="action-wrap">
                  <n-dropdown trigger="click" :options="actionOptions" @select="$emit('toggle-detail', purchase)">
                    <button class="menu-trigger" type="button" aria-label="Abrir acciones" @click.stop>
                      <FontAwesomeIcon :icon="faEllipsis" />
                    </button>
                  </n-dropdown>
                </div>
              </td>
            </tr>

            <tr v-if="expandedPurchaseId === purchase.purchaseId" class="expanded-row">
              <td colspan="7">
                <div class="expanded-panel">
                  <section class="expanded-items">
                    <h3>Productos comprados</h3>

                    <div v-if="detailLoading" class="expanded-loading">Cargando detalle...</div>

                    <div v-else-if="expandedDetail?.items?.length" class="items-table-shell">
                      <table class="items-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio unitario</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in expandedDetail.items"
                            :key="`${expandedDetail.purchaseId}-${item.productId}`"
                          >
                            <td>
                              <div class="product-summary">
                                <div class="item-media">
                                  <img v-if="resolveImage(item)" :src="resolveImage(item)" :alt="item.productName" />
                                  <div v-else class="item-placeholder">
                                    <FontAwesomeIcon :icon="faBox" />
                                  </div>
                                </div>

                                <div>
                                  <strong>{{ item.productName }}</strong>
                                  <p>Producto #{{ item.productId }}</p>
                                </div>
                              </div>
                            </td>
                            <td>{{ quantityLabel(item.quantity) }}</td>
                            <td>{{ formatCurrency(item.unitPrice) }}</td>
                            <td class="subtotal-cell">{{ formatCurrency(item.subtotal) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div v-else class="expanded-loading">No hay items para mostrar.</div>
                  </section>

                  <aside class="summary-panel">
                    <h3>Resumen de compra</h3>

                    <div v-if="expandedDetail" class="summary-top">
                      <div class="summary-row">
                        <span>Subtotal</span>
                        <strong>{{ formatCurrency(summarySubtotal) }}</strong>
                      </div>
                      <div class="summary-row">
                        <span>IVA (19%)</span>
                        <strong>{{ formatCurrency(summaryVat) }}</strong>
                      </div>
                      <div class="summary-row total-row">
                        <span>Total</span>
                        <strong>{{ formatCurrency(expandedDetail.totalAmount) }}</strong>
                      </div>
                    </div>

                    <div v-if="expandedDetail" class="summary-details">
                      <div class="summary-detail">
                        <div class="summary-icon">
                          <FontAwesomeIcon :icon="faCalendarDays" />
                        </div>
                        <div>
                          <span>Fecha</span>
                          <strong>{{ formatDateTime(expandedDetail.createdAt) }}</strong>
                        </div>
                      </div>

                      <div class="summary-detail">
                        <div class="summary-icon">
                          <FontAwesomeIcon :icon="faHashtag" />
                        </div>
                        <div>
                          <span>Compra</span>
                          <strong>#{{ expandedDetail.purchaseId }}</strong>
                        </div>
                      </div>

                      <div class="summary-detail">
                        <div class="summary-icon">
                          <FontAwesomeIcon :icon="faUser" />
                        </div>
                        <div>
                          <span>Usuario</span>
                          <strong>{{ expandedDetail.userFullName || "Administrador" }}</strong>
                        </div>
                      </div>

                      <div class="summary-detail">
                        <div class="summary-icon is-success">
                          <FontAwesomeIcon :icon="faCircleCheck" />
                        </div>
                        <div>
                          <span>Estado</span>
                          <strong class="success-text">{{ statusLabel(expandedDetail.status) }}</strong>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <div class="footer-meta">
        <p class="muted-text footer-result">
          Result {{ rangeStart }}-{{ rangeEnd }} of {{ pagination.totalElements || 0 }}
        </p>

        <div class="size-select">
          <select :value="pagination.size" @change="handleSizeChange">
            <option v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
          <FontAwesomeIcon :icon="faChevronDown" />
        </div>
      </div>

      <div class="footer-actions">
        <button class="pager-button is-nav" type="button" :disabled="pagination.page === 0" @click="$emit('previous-page')">
          <FontAwesomeIcon :icon="faArrowLeft" />
          <span>Previous</span>
        </button>

        <template v-for="item in visiblePages" :key="item.key">
          <span v-if="item.type === 'ellipsis'" class="pager-ellipsis">...</span>
          <button
            v-else
            class="pager-button"
            :class="{ 'is-active': item.value === pagination.page + 1 }"
            type="button"
            @click="$emit('go-to-page', item.value - 1)"
          >
            {{ item.value }}
          </button>
        </template>

        <button class="pager-button is-nav" type="button" :disabled="pagination.last" @click="$emit('next-page')">
          <span>Next</span>
          <FontAwesomeIcon :icon="faArrowRight" />
        </button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from "vue";
import { NDropdown } from "naive-ui";
import {
  faArrowLeft,
  faArrowRight,
  faBox,
  faCalendarDays,
  faChevronDown,
  faCircleCheck,
  faEllipsis,
  faHashtag,
  faPlus,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import BaseCard from "../base/BaseCard.vue";
import { formatCurrency } from "../../utils/currency";
import { formatDateTime } from "../../utils/date";

const props = defineProps({
  purchases: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    required: true
  },
  expandedPurchaseId: {
    type: Number,
    default: null
  },
  expandedDetail: {
    type: Object,
    default: null
  },
  purchaseDetailsMap: {
    type: Object,
    default: () => ({})
  },
  productImageMap: {
    type: Object,
    default: () => ({})
  },
  detailLoading: Boolean
});

const emit = defineEmits([
  "toggle-detail",
  "new-purchase",
  "previous-page",
  "next-page",
  "go-to-page",
  "change-size"
]);

const pageSizeOptions = [8, 10, 12, 20];
const actionOptions = [{ label: "Ver detalle", key: "detail" }];

const rangeStart = computed(() => {
  if (!props.pagination.totalElements) {
    return 0;
  }

  return props.pagination.page * props.pagination.size + 1;
});

const rangeEnd = computed(() => {
  if (!props.pagination.totalElements) {
    return 0;
  }

  return Math.min(
    props.pagination.totalElements,
    props.pagination.page * props.pagination.size + props.purchases.length
  );
});

const visiblePages = computed(() => {
  const totalPages = Math.max(props.pagination.totalPages, 1);
  const current = props.pagination.page + 1;

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: "page",
      key: `page-${index + 1}`,
      value: index + 1
    }));
  }

  const items = [{ type: "page", key: "page-1", value: 1 }];

  if (current > 3) {
    items.push({ type: "ellipsis", key: "ellipsis-start" });
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  for (let page = start; page <= end; page += 1) {
    items.push({ type: "page", key: `page-${page}`, value: page });
  }

  if (current < totalPages - 2) {
    items.push({ type: "ellipsis", key: "ellipsis-end" });
  }

  items.push({ type: "page", key: `page-${totalPages}`, value: totalPages });
  return items;
});

const summaryTotal = computed(() => Number(props.expandedDetail?.totalAmount || 0));
const summarySubtotal = computed(() => Math.round(summaryTotal.value / 1.19));
const summaryVat = computed(() => Math.max(0, summaryTotal.value - summarySubtotal.value));

function statusLabel(status) {
  return status === "COMPLETED" ? "Completada" : status;
}

function statusClass(status) {
  return status === "COMPLETED" ? "is-success" : "is-warning";
}

function resolveItemCount(purchase) {
  if (Number.isFinite(Number(purchase.itemCount)) && Number(purchase.itemCount) > 0) {
    return Number(purchase.itemCount);
  }

  const cachedDetail = props.purchaseDetailsMap[purchase.purchaseId];
  if (cachedDetail?.items?.length) {
    return cachedDetail.items.length;
  }

  return 0;
}

function itemCountLabel(count) {
  return count === 1 ? "1 producto" : `${count} productos`;
}

function quantityLabel(quantity) {
  return quantity === 1 ? "1 unidad" : `${quantity} unidades`;
}

function resolveImage(item) {
  return item.imageUrl || props.productImageMap[item.productId] || "";
}

function handleSizeChange(event) {
  emit("change-size", Number(event.target.value));
}
</script>

<style scoped>
.table-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  margin-bottom: 16px;
}

.table-head h2 {
  margin: 0 0 6px;
  font-size: 1.08rem;
}

.table-head p {
  margin: 0;
  font-size: 0.9rem;
}

.new-purchase-button {
  min-height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: white;
  background: linear-gradient(145deg, #ff6b35, #ff8f57);
  box-shadow: 0 12px 22px rgba(255, 107, 53, 0.2);
  transition: var(--transition-soft);
}

.new-purchase-button:hover {
  transform: translateY(-1px);
}

.purchases-table {
  width: 100%;
  min-width: 1080px;
  border-collapse: collapse;
}

thead th {
  padding: 11px 14px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-muted);
  background: #fbfbfc;
  border-bottom: 1px solid var(--color-border);
}

tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.purchase-row {
  cursor: pointer;
  transition: var(--transition-soft);
}

.purchase-row:hover {
  background: #fcfcfd;
}

.purchase-row.is-expanded {
  background: white;
  box-shadow: inset 3px 0 0 #ff8f57;
}

.purchase-cell strong {
  display: block;
  margin-bottom: 4px;
  font-size: 0.94rem;
}

.purchase-cell p,
.date-cell,
.user-cell,
.items-cell {
  margin: 0;
  color: var(--color-primary-soft);
  font-size: 0.84rem;
}

.total-cell {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--color-primary);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.status-pill.is-success {
  background: rgba(22, 163, 74, 0.1);
  color: var(--color-success);
}

.status-pill.is-warning {
  background: rgba(245, 158, 11, 0.12);
  color: var(--color-warning);
}

.action-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.menu-trigger {
  border: 1px solid rgba(229, 231, 235, 0.92);
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: white;
  color: var(--color-primary-soft);
  transition: var(--transition-soft);
}

.menu-trigger:hover {
  background: var(--color-surface-soft);
}

.expanded-row td {
  padding: 0;
  background: white;
}

.expanded-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.38fr) minmax(310px, 0.62fr);
  gap: 18px;
  padding: 14px 20px 20px;
}

.expanded-items,
.summary-panel {
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 20px;
  background: white;
}

.expanded-items {
  padding: 18px;
}

.expanded-items h3,
.summary-panel h3 {
  margin: 0 0 14px;
  font-size: 1rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  padding: 12px 6px;
  text-align: left;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-muted);
  border-bottom: 1px solid rgba(229, 231, 235, 0.78);
}

.items-table td {
  padding: 12px 6px;
  border-top: 1px dashed rgba(229, 231, 235, 0.9);
  vertical-align: middle;
}

.items-table tbody tr:first-child td {
  border-top: 0;
}

.product-summary {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.item-media img,
.item-placeholder {
  width: 78px;
  height: 78px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
}

.item-placeholder {
  display: grid;
  place-items: center;
  background: var(--color-surface-soft);
  color: var(--color-muted);
}

.product-summary strong {
  display: block;
  margin-bottom: 5px;
  font-size: 0.92rem;
}

.product-summary p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.8rem;
}

.subtotal-cell {
  font-weight: 700;
  color: var(--color-primary);
}

.summary-panel {
  padding: 18px;
}

.summary-top {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.84);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

.summary-row span,
.summary-detail span,
.expanded-loading {
  color: var(--color-muted);
  font-size: 0.8rem;
}

.summary-row strong {
  color: var(--color-primary);
  font-size: 0.92rem;
}

.total-row strong {
  font-size: 1.18rem;
  font-weight: 800;
  color: var(--color-success);
}

.summary-details {
  display: grid;
  gap: 14px;
}

.summary-detail {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.summary-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(148, 163, 184, 0.12);
  color: #64748b;
}

.summary-icon.is-success {
  background: rgba(22, 163, 74, 0.12);
  color: var(--color-success);
}

.summary-detail strong {
  display: block;
  margin-top: 4px;
  color: var(--color-primary);
  font-size: 0.92rem;
}

.success-text {
  color: var(--color-success);
}

.expanded-loading {
  padding: 18px 0;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding-top: 12px;
}

.footer-meta,
.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-result {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 600;
}

.size-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 58px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: white;
}

.size-select select {
  appearance: none;
  border: 0;
  background: transparent;
  width: 100%;
  padding-right: 14px;
  font-size: 0.84rem;
  color: var(--color-primary);
  outline: none;
  cursor: pointer;
}

.size-select svg {
  position: absolute;
  right: 10px;
  font-size: 0.72rem;
  color: var(--color-muted);
  pointer-events: none;
}

.pager-button {
  min-width: 34px;
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: white;
  color: var(--color-primary-soft);
  font-size: 0.84rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: var(--transition-soft);
}

.pager-button:hover:not(:disabled) {
  border-color: #c9b8ff;
  color: #6d4aff;
}

.pager-button.is-active {
  border-color: #9d7cff;
  box-shadow: inset 0 0 0 1px #9d7cff;
  color: #6d4aff;
}

.pager-button.is-nav {
  padding: 0 14px;
}

.pager-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager-ellipsis {
  color: var(--color-muted);
  font-size: 0.92rem;
  padding: 0 2px;
}

@media (max-width: 1080px) {
  .expanded-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .table-head,
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-meta,
  .footer-actions {
    flex-wrap: wrap;
  }
}
</style>
