<template>
  <BaseCard class="table-shell">
    <ProductFilters
      :filters="filters"
      :categories="categories"
      @apply="$emit('apply-filters', $event)"
    />

    <div class="table-scroll">
      <table class="products-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <img class="thumb" :src="product.imageUrl" :alt="product.name" />
            </td>
            <td>
              <div class="product-cell">
                <strong>{{ product.name }}</strong>
              </div>
            </td>
            <td>
              <p class="description-cell">{{ shortDescription(product.description) }}</p>
            </td>
            <td>
              <span
                class="category-pill"
                :class="categoryTone(product.category)"
                :style="categoryStyle(product.category)"
              >
                {{ product.category }}
              </span>
            </td>
            <td>{{ formatCurrency(product.price) }}</td>
            <td>
              <button class="detail-trigger" type="button" aria-label="Ver detalle" @click="$emit('view-detail', product)">
                <FontAwesomeIcon :icon="faEye" />
              </button>
            </td>
          </tr>
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
import { faArrowLeft, faArrowRight, faChevronDown, faEye } from "@fortawesome/free-solid-svg-icons";
import BaseCard from "../base/BaseCard.vue";
import ProductFilters from "./ProductFilters.vue";
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
  "view-detail",
  "view-inventory",
  "purchase",
  "apply-filters",
  "previous-page",
  "next-page",
  "go-to-page",
  "change-size"
]);

const pageSizeOptions = [8, 10, 12, 20];

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
    props.pagination.page * props.pagination.size + props.products.length
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
    items.push({
      type: "page",
      key: `page-${page}`,
      value: page
    });
  }

  if (current < totalPages - 2) {
    items.push({ type: "ellipsis", key: "ellipsis-end" });
  }

  items.push({
    type: "page",
    key: `page-${totalPages}`,
    value: totalPages
  });

  return items;
});

function shortDescription(text) {
  if (!text) {
    return "Sin descripcion disponible.";
  }

  if (text.length <= 90) {
    return text;
  }

  return `${text.slice(0, 90)}...`;
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

function categoryStyle(category) {
  const tone = categoryTone(category);

  if (tone === "is-tech") {
    return {
      background: "rgba(139, 92, 246, 0.12)",
      color: "#7c3aed"
    };
  }

  if (tone === "is-accessory") {
    return {
      background: "rgba(59, 130, 246, 0.12)",
      color: "#2563eb"
    };
  }

  if (tone === "is-audio") {
    return {
      background: "rgba(249, 115, 22, 0.12)",
      color: "#ea580c"
    };
  }

  if (tone === "is-office") {
    return {
      background: "rgba(244, 114, 182, 0.12)",
      color: "#db2777"
    };
  }

  return {
    background: "var(--color-surface-soft)",
    color: "var(--color-primary-soft)"
  };
}

function handleSizeChange(event) {
  emit("change-size", Number(event.target.value));
}
</script>

<style scoped>
.products-table {
  width: 100%;
  min-width: 1020px;
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
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 10px;
}

.product-cell strong {
  display: block;
}

.description-cell {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
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

.detail-trigger {
  border: 1px solid rgba(229, 231, 235, 0.92);
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: white;
  color: var(--color-primary-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-soft);
}

.detail-trigger:hover {
  background: var(--color-surface-soft);
  border-color: #d4d9e2;
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

@media (max-width: 900px) {
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
