<template>
  <BaseCard class="table-shell inventory-shell">
    <div class="inventory-filters">
      <div class="search-field">
        <FontAwesomeIcon :icon="faMagnifyingGlass" />
        <input :value="filters.search" type="text" placeholder="Buscar producto..." @input="handleSearch" />
      </div>

      <div class="filter-group">
        <label>Categoría</label>
        <div class="select-shell">
          <select :value="filters.category" @change="emitFilter('category', $event.target.value)">
            <option value="">Todas</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <FontAwesomeIcon :icon="faChevronDown" />
        </div>
      </div>

      <div class="filter-group">
        <label>Estado</label>
        <div class="select-shell">
          <select :value="filters.status" @change="emitFilter('status', $event.target.value)">
            <option value="">Todos</option>
            <option value="available">Disponible</option>
            <option value="low">Bajo stock</option>
            <option value="out">Sin stock</option>
          </select>
          <FontAwesomeIcon :icon="faChevronDown" />
        </div>
      </div>

      <div class="filter-group">
        <label>Stock</label>
        <div class="select-shell">
          <select :value="filters.stockRange" @change="emitFilter('stockRange', $event.target.value)">
            <option value="">Todos</option>
            <option value="0-5">0 a 5</option>
            <option value="6-20">6 a 20</option>
            <option value="21+">21 o más</option>
          </select>
          <FontAwesomeIcon :icon="faChevronDown" />
        </div>
      </div>

    </div>

    <div class="table-scroll">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Stock disponible</th>
            <th>Stock mínimo</th>
            <th>Estado</th>
            <th>Valor unitario</th>
            <th>Valor total</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <div class="product-main">
                <img class="product-thumb" :src="product.imageUrl" :alt="product.name" />
                <div>
                  <strong>{{ product.name }}</strong>
                  <p>ID: {{ product.id }}</p>
                </div>
              </div>
            </td>
            <td>
              <span class="category-pill" :class="categoryTone(product.category)">{{ product.category }}</span>
            </td>
            <td class="stock-value" :class="statusClass(product)">{{ product.stock }} unidades</td>
            <td>{{ product.minimumStock }} unidades</td>
            <td>
              <span class="status-pill" :class="statusClass(product)">
                <FontAwesomeIcon :icon="statusIcon(product)" />
                {{ statusLabel(product) }}
              </span>
            </td>
            <td>{{ formatCurrency(product.price) }}</td>
            <td class="total-value">{{ formatCurrency(Number(product.price || 0) * Number(product.stock || 0)) }}</td>
            <td>
              <n-dropdown trigger="click" :options="actionOptions(product)" @select="handleAction($event, product)">
                <button class="menu-trigger" type="button" aria-label="Abrir acciones">
                  <FontAwesomeIcon :icon="faEllipsis" />
                </button>
              </n-dropdown>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <div class="footer-meta">
        <p class="muted-text footer-result">
          Mostrando {{ rangeStart }} a {{ rangeEnd }} de {{ pagination.totalItems || 0 }} productos
        </p>

        <div class="size-select">
          <select :value="pagination.size" @change="$emit('change-size', Number($event.target.value))">
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
          <span>Anterior</span>
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

        <button class="pager-button is-nav" type="button" :disabled="pagination.page >= pagination.totalPages - 1" @click="$emit('next-page')">
          <span>Siguiente</span>
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
  faCheckCircle,
  faChevronDown,
  faEllipsis,
  faExclamationTriangle,
  faMagnifyingGlass,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import BaseCard from "../base/BaseCard.vue";
import { formatCurrency } from "../../utils/currency";

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    required: true
  }
});

const emit = defineEmits([
  "update-filter",
  "reset-page",
  "change-size",
  "previous-page",
  "next-page",
  "go-to-page",
  "view-detail",
  "view-inventory",
  "purchase"
]);

const pageSizeOptions = [8, 10, 12, 20];

const rangeStart = computed(() => {
  if (!props.pagination.totalItems) {
    return 0;
  }

  return props.pagination.page * props.pagination.size + 1;
});

const rangeEnd = computed(() => {
  if (!props.pagination.totalItems) {
    return 0;
  }

  return Math.min(props.pagination.totalItems, props.pagination.page * props.pagination.size + props.products.length);
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

let debounceId;

function handleSearch(event) {
  clearTimeout(debounceId);
  const value = event.target.value;
  debounceId = setTimeout(() => {
    emit("update-filter", { key: "search", value });
  }, 260);
}

function emitFilter(key, value) {
  emit("update-filter", { key, value });
}

function statusLabel(product) {
  if (product.stock === 0) {
    return "Sin stock";
  }
  if (product.stock <= product.minimumStock) {
    return "Bajo stock";
  }
  return "Disponible";
}

function statusClass(product) {
  if (product.stock === 0) {
    return "is-danger";
  }
  if (product.stock <= product.minimumStock) {
    return "is-warning";
  }
  return "is-success";
}

function statusIcon(product) {
  if (product.stock === 0) {
    return faTimesCircle;
  }
  if (product.stock <= product.minimumStock) {
    return faExclamationTriangle;
  }
  return faCheckCircle;
}

function categoryTone(category) {
  const normalized = String(category || "").toLowerCase();
  if (normalized.includes("tec")) {
    return "is-tech";
  }
  if (normalized.includes("acce")) {
    return "is-accessory";
  }
  if (normalized.includes("audio")) {
    return "is-audio";
  }
  if (normalized.includes("ofi")) {
    return "is-office";
  }
  return "";
}

function actionOptions(product) {
  return [
    { label: "Ver detalle", key: "detail" },
    { label: "Ver movimientos", key: "inventory" }
  ];
}

function handleAction(action, product) {
  if (action === "detail") {
    emit("view-detail", product);
    return;
  }

  if (action === "inventory") {
    emit("view-inventory", product);
    return;
  }
}
</script>

<style scoped>
.inventory-shell {
  overflow: hidden;
}

.inventory-filters {
  display: grid;
  grid-template-columns: minmax(260px, 1.8fr) repeat(3, minmax(150px, 1fr));
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
}

.search-field,
.select-shell {
  min-height: 40px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: white;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
}

.search-field svg {
  color: var(--color-muted);
}

.search-field input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--color-primary);
}

.filter-group {
  display: grid;
  gap: 6px;
}

.filter-group label {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.select-shell {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.select-shell select {
  appearance: none;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  outline: none;
}

.select-shell svg {
  position: absolute;
  right: 12px;
  color: var(--color-muted);
  pointer-events: none;
}

.inventory-table {
  width: 100%;
  min-width: 1120px;
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
  font-size: 0.92rem;
}

.product-main {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 10px;
}

.product-main strong {
  display: block;
  margin-bottom: 4px;
}

.product-main p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.82rem;
}

.category-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.category-pill {
  background: var(--color-surface-soft);
  color: var(--color-primary-soft);
}

.category-pill.is-tech {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}

.category-pill.is-accessory {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.category-pill.is-audio {
  background: rgba(249, 115, 22, 0.12);
  color: #ea580c;
}

.category-pill.is-office {
  background: rgba(244, 114, 182, 0.12);
  color: #db2777;
}

.stock-value.is-success,
.status-pill.is-success {
  color: var(--color-success);
}

.stock-value.is-warning,
.status-pill.is-warning {
  color: var(--color-warning);
}

.stock-value.is-danger,
.status-pill.is-danger {
  color: var(--color-danger);
}

.status-pill.is-success {
  background: rgba(22, 163, 74, 0.1);
}

.status-pill.is-warning {
  background: rgba(245, 158, 11, 0.12);
}

.status-pill.is-danger {
  background: rgba(220, 38, 38, 0.1);
}

.total-value {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.menu-trigger {
  border: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: transparent;
  color: var(--color-primary-soft);
  transition: var(--transition-soft);
}

.menu-trigger:hover {
  background: var(--color-surface-soft);
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
  border-color: #ffb091;
  color: var(--color-accent);
}

.pager-button.is-active {
  border-color: #ff8f57;
  box-shadow: inset 0 0 0 1px #ff8f57;
  color: var(--color-accent);
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

@media (max-width: 1100px) {
  .inventory-filters {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 900px) {
  .inventory-filters,
  .table-footer {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .footer-meta,
  .footer-actions {
    flex-wrap: wrap;
  }
}
</style>
