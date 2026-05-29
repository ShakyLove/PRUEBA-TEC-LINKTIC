<template>
  <AppLayout>
    <div class="purchase-builder">
      <div class="page-header purchase-header">
        <div>
          <h1 class="page-title">Nueva compra</h1>
          <p class="page-subtitle">
            Selecciona los productos y cantidades que deseas adquirir. El sistema validara la disponibilidad en inventario antes de registrar la compra.
          </p>
        </div>
      </div>

      <div class="purchase-layout">
        <section class="panel-stack">
          <BaseCard class="section-block">
            <div class="block-head">
              <h2>Agregar productos</h2>
            </div>

            <div class="catalog-filters">
              <div class="search-field">
                <FontAwesomeIcon :icon="faMagnifyingGlass" />
                <input
                  :value="searchTerm"
                  type="text"
                  placeholder="Buscar producto por nombre..."
                  @input="handleSearchInput"
                />
              </div>

              <div class="select-shell">
                <select :value="selectedCategory" @change="handleCategoryChange">
                  <option value="">Todas las categorias</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
                <FontAwesomeIcon :icon="faChevronDown" />
              </div>
            </div>

            <BaseLoader v-if="catalogLoading && !products.length" />

            <BaseEmptyState
              v-else-if="!products.length"
              title="Sin productos disponibles"
              description="No hay resultados para los filtros actuales."
            />

            <div v-else class="catalog-list">
              <article v-for="product in products" :key="product.id" class="catalog-item">
                <div class="catalog-main">
                  <img class="catalog-thumb" :src="product.imageUrl" :alt="product.name" />

                  <div class="catalog-copy">
                    <strong>{{ product.name }}</strong>

                    <div class="catalog-meta">
                      <span class="category-pill" :style="categoryStyle(product.category)">
                        {{ product.category }}
                      </span>

                      <span class="stock-pill" :class="stockTone(product)">
                        <FontAwesomeIcon :icon="faCircleCheck" />
                        Stock: {{ product.stock }} unidades
                      </span>
                    </div>
                  </div>
                </div>

                <div class="catalog-actions">
                  <strong>{{ formatCurrency(product.price) }}</strong>
                  <button
                    class="add-button"
                    type="button"
                    :disabled="product.stock === 0 || isProductMaxed(product)"
                    @click="addProduct(product)"
                  >
                    {{ product.stock === 0 ? "Agotado" : "Agregar" }}
                  </button>
                </div>
              </article>
            </div>

            <div class="catalog-pagination">
              <button
                class="pager-button"
                type="button"
                :disabled="pagination.page === 0"
                @click="changePage(pagination.page - 1)"
              >
                <FontAwesomeIcon :icon="faArrowLeft" />
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                class="pager-button"
                :class="{ 'is-active': page === pagination.page + 1 }"
                type="button"
                @click="changePage(page - 1)"
              >
                {{ page }}
              </button>

              <button
                class="pager-button"
                type="button"
                :disabled="pagination.last"
                @click="changePage(pagination.page + 1)"
              >
                <FontAwesomeIcon :icon="faArrowRight" />
              </button>
            </div>
          </BaseCard>

          <BaseCard class="section-block">
            <div class="block-head">
              <h2>Detalle de compra</h2>
            </div>

            <BaseEmptyState
              v-if="!cartItems.length"
              title="No hay productos seleccionados"
              description="Agrega uno o mas productos para registrar la compra."
            />

            <div v-else class="cart-list">
              <article v-for="item in cartItems" :key="item.productId" class="cart-item">
                <div class="cart-main">
                  <img class="cart-thumb" :src="item.imageUrl" :alt="item.productName" />

                  <div class="cart-copy">
                    <strong>{{ item.productName }}</strong>
                    <p>Precio unitario: {{ formatCurrency(item.unitPrice) }}</p>
                  </div>
                </div>

                <div class="quantity-stepper">
                  <button type="button" @click="decrementItem(item.productId)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button
                    type="button"
                    :disabled="item.quantity >= item.stock"
                    @click="incrementItem(item.productId)"
                  >
                    +
                  </button>
                </div>

                <strong class="cart-subtotal">{{ formatCurrency(item.subtotal) }}</strong>

                <button class="remove-button" type="button" @click="removeItem(item.productId)">
                  <FontAwesomeIcon :icon="faTrashCan" />
                </button>
              </article>
            </div>
          </BaseCard>
        </section>

        <aside class="panel-stack summary-column">
          <BaseCard class="summary-card">
            <h2>Resumen de compra</h2>

            <div v-if="cartItems.length" class="summary-items">
              <div v-for="item in cartItems" :key="`summary-${item.productId}`" class="summary-line is-item">
                <span>{{ item.productName }}</span>
                <strong>{{ formatCurrency(item.subtotal) }}</strong>
              </div>
            </div>

            <div class="summary-line">
              <span>Subtotal</span>
              <strong>{{ formatCurrency(summarySubtotal) }}</strong>
            </div>

            <div class="summary-line">
              <span>IVA (19%)</span>
              <strong>{{ formatCurrency(summaryVat) }}</strong>
            </div>

            <div class="summary-separator" />

            <div class="summary-line total-line">
              <span>Total</span>
              <strong>{{ formatCurrency(summaryTotal) }}</strong>
            </div>
          </BaseCard>

          <div class="summary-actions">
            <button
              class="action-button is-confirm"
              type="button"
              :disabled="!cartItems.length || purchaseStore.creating"
              @click="confirmPurchase"
            >
              <FontAwesomeIcon :icon="faCartShopping" />
              <span>{{ purchaseStore.creating ? "Confirmando..." : "Confirmar compra" }}</span>
            </button>

            <button
              class="action-button is-cancel"
              type="button"
              :disabled="!cartItems.length"
              @click="clearCart"
            >
              <FontAwesomeIcon :icon="faXmark" />
              <span>Cancelar compra</span>
            </button>

            <button class="action-button is-back" type="button" @click="goBack">
              <FontAwesomeIcon :icon="faArrowLeft" />
              <span>Regresar</span>
            </button>
          </div>
        </aside>
      </div>

      <div v-if="feedbackMessage" class="feedback-stack">
        <div
          class="feedback-card"
          :class="[
            feedbackMessage.type === 'success' ? 'is-success' : 'is-error',
            { 'is-clickable': feedbackMessage.type === 'success' }
          ]"
          @click="handleFeedbackClick"
        >
          <div class="feedback-icon">
            <FontAwesomeIcon :icon="feedbackMessage.type === 'success' ? faCircleCheck : faCircleExclamation" />
          </div>

          <div class="feedback-copy">
            <strong>{{ feedbackMessage.title }}</strong>
            <p>{{ feedbackMessage.description }}</p>
          </div>

          <button class="feedback-close" type="button" @click.stop="clearFeedback">
            <FontAwesomeIcon :icon="faXmark" />
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  faArrowLeft,
  faArrowRight,
  faCartShopping,
  faChevronDown,
  faCircleCheck,
  faCircleExclamation,
  faMagnifyingGlass,
  faTrashCan,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import AppLayout from "../components/layout/AppLayout.vue";
import BaseCard from "../components/base/BaseCard.vue";
import BaseEmptyState from "../components/base/BaseEmptyState.vue";
import BaseLoader from "../components/base/BaseLoader.vue";
import { useProductStore } from "../stores/product.store";
import { usePurchaseStore } from "../stores/purchase.store";
import { productService } from "../services/product.service";
import { formatCurrency } from "../utils/currency";

const router = useRouter();
const productStore = useProductStore();
const purchaseStore = usePurchaseStore();

const products = ref([]);
const categories = ref([]);
const catalogLoading = ref(false);
const searchTerm = ref("");
const selectedCategory = ref("");
const pagination = ref({
  page: 0,
  size: 3,
  totalElements: 0,
  totalPages: 0,
  last: true
});
const cart = ref([]);
const feedbackMessage = ref(null);

let debounceId;
let successTimeoutId;

onMounted(async () => {
  await Promise.all([loadCategories(), fetchProducts()]);
});

const cartItems = computed(() =>
  cart.value.map((item) => ({
    ...item,
    subtotal: item.quantity * Number(item.unitPrice || 0)
  }))
);

const summaryTotal = computed(() =>
  cartItems.value.reduce((total, item) => total + item.subtotal, 0)
);

const summarySubtotal = computed(() => Math.round(summaryTotal.value / 1.19));
const summaryVat = computed(() => Math.max(0, summaryTotal.value - summarySubtotal.value));

const visiblePages = computed(() => {
  const totalPages = Math.max(pagination.value.totalPages, 1);
  return Array.from({ length: totalPages }, (_, index) => index + 1);
});

async function loadCategories() {
  const catalog = await productStore.fetchProductCatalog(true);
  categories.value = [...new Set(catalog.map((product) => product.category))];
}

async function fetchProducts() {
  catalogLoading.value = true;

  try {
    const { data } = await productService.getProducts({
      page: pagination.value.page,
      size: pagination.value.size,
      search: searchTerm.value || undefined,
      category: selectedCategory.value || undefined,
      sortBy: "id",
      direction: "asc"
    });

    products.value = data.content;
    pagination.value = {
      page: data.page,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      last: data.last
    };
  } finally {
    catalogLoading.value = false;
  }
}

function handleSearchInput(event) {
  clearTimeout(debounceId);
  searchTerm.value = event.target.value;
  debounceId = setTimeout(() => {
    pagination.value.page = 0;
    fetchProducts();
  }, 260);
}

function handleCategoryChange(event) {
  selectedCategory.value = event.target.value;
  pagination.value.page = 0;
  fetchProducts();
}

function changePage(page) {
  if (page < 0 || page === pagination.value.page || page >= pagination.value.totalPages) {
    return;
  }

  pagination.value.page = page;
  fetchProducts();
}

function addProduct(product) {
  clearFeedback();

  const existing = cart.value.find((item) => item.productId === product.id);

  if (existing) {
    if (existing.quantity >= existing.stock) {
      showError(
        "No se puede agregar mas unidades",
        `Solo hay ${existing.stock} unidades disponibles de ${product.name}.`
      );
      return;
    }

    existing.quantity += 1;
    return;
  }

  cart.value.push({
    productId: product.id,
    productName: product.name,
    imageUrl: product.imageUrl,
    unitPrice: Number(product.price || 0),
    quantity: 1,
    stock: Number(product.stock || 0)
  });
}

function incrementItem(productId) {
  const item = cart.value.find((entry) => entry.productId === productId);
  if (!item) {
    return;
  }

  if (item.quantity >= item.stock) {
    showError(
      "Cantidad no disponible",
      `El maximo disponible para ${item.productName} es ${item.stock} unidades.`
    );
    return;
  }

  item.quantity += 1;
}

function decrementItem(productId) {
  const item = cart.value.find((entry) => entry.productId === productId);
  if (!item) {
    return;
  }

  if (item.quantity <= 1) {
    removeItem(productId);
    return;
  }

  item.quantity -= 1;
}

function removeItem(productId) {
  cart.value = cart.value.filter((item) => item.productId !== productId);
}

function clearCart() {
  cart.value = [];
  clearFeedback();
}

function isProductMaxed(product) {
  const item = cart.value.find((entry) => entry.productId === product.id);
  return item ? item.quantity >= item.stock : false;
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

function stockTone(product) {
  if (product.stock === 0) {
    return "is-danger";
  }

  if (product.stock <= product.minimumStock) {
    return "is-warning";
  }

  return "is-success";
}

async function confirmPurchase() {
  clearFeedback();

  if (!cart.value.length) {
    showError("No hay productos seleccionados", "Agrega al menos un producto antes de confirmar la compra.");
    return;
  }

  try {
    const response = await purchaseStore.createPurchase({
      items: cart.value.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    });

    cart.value = [];
    await Promise.all([
      productStore.fetchProductCatalog(true),
      fetchProducts()
    ]);

    showSuccess(
      "¡Compra realizada con exito!",
      `Tu compra #${response.purchaseId} ha sido registrada correctamente.`
    );
  } catch (error) {
    showError(
      "Error al procesar la compra",
      error.message || "Ocurrio un problema al registrar tu compra."
    );
  }
}

function showSuccess(title, description) {
  clearTimeout(successTimeoutId);
  feedbackMessage.value = {
    type: "success",
    title,
    description
  };

  successTimeoutId = setTimeout(() => {
    feedbackMessage.value = null;
  }, 5000);
}

function showError(title, description) {
  clearTimeout(successTimeoutId);
  feedbackMessage.value = {
    type: "error",
    title,
    description
  };
}

function clearFeedback() {
  clearTimeout(successTimeoutId);
  feedbackMessage.value = null;
}

function handleFeedbackClick() {
  if (feedbackMessage.value?.type !== "success") {
    return;
  }

  clearFeedback();
  router.push("/purchases");
}

function goBack() {
  router.push("/purchases");
}

onUnmounted(() => {
  clearTimeout(successTimeoutId);
  clearTimeout(debounceId);
});
</script>

<style scoped>
.purchase-builder {
  display: grid;
  gap: 18px;
}

.purchase-header {
  margin-bottom: 0;
}

.purchase-header .page-title {
  margin-top: 0;
  font-size: clamp(1.38rem, 1.8vw, 1.82rem);
}

.purchase-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.38fr) minmax(280px, 0.48fr);
  gap: 20px;
  align-items: start;
}

.section-block {
  padding: 16px 16px 14px;
}

.block-head {
  margin-bottom: 12px;
}

.block-head h2,
.summary-card h2 {
  margin: 0;
  font-size: 1rem;
}

.catalog-filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.36fr);
  gap: 12px;
  margin-bottom: 14px;
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
  outline: none;
  background: transparent;
  color: var(--color-primary);
}

.select-shell svg {
  position: absolute;
  right: 12px;
  color: var(--color-muted);
  pointer-events: none;
}

.catalog-list,
.cart-list {
  display: grid;
  gap: 10px;
}

.catalog-item,
.cart-item {
  min-height: 70px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(229, 231, 235, 0.85);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  background: white;
}

.cart-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 118px 118px 36px;
}

.catalog-main,
.cart-main {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.catalog-thumb,
.cart-thumb {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.catalog-copy strong,
.cart-copy strong {
  display: block;
  font-size: 0.92rem;
  margin-bottom: 4px;
  color: var(--color-primary);
}

.catalog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.category-pill,
.stock-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
}

.stock-pill {
  background: rgba(22, 163, 74, 0.08);
}

.stock-pill.is-success {
  color: var(--color-success);
}

.stock-pill.is-warning {
  background: rgba(245, 158, 11, 0.12);
  color: var(--color-warning);
}

.stock-pill.is-danger {
  background: rgba(220, 38, 38, 0.1);
  color: var(--color-danger);
}

.catalog-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-end;
}

.catalog-actions strong,
.cart-subtotal {
  font-size: 0.95rem;
  color: var(--color-primary);
}

.add-button {
  min-width: 110px;
  min-height: 36px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #7b8dff;
  background: rgba(255, 255, 255, 0.95);
  color: #2d5bff;
  font-weight: 600;
}

.add-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.catalog-pagination {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.pager-button {
  min-width: 34px;
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: white;
  color: var(--color-primary-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-soft);
}

.pager-button.is-active {
  border-color: #ff8f57;
  color: var(--color-accent);
  box-shadow: inset 0 0 0 1px #ff8f57;
}

.pager-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cart-copy p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.81rem;
}

.cart-item .quantity-stepper,
.cart-item .cart-subtotal,
.cart-item .remove-button {
  justify-self: center;
}

.cart-item .cart-subtotal {
  width: 100%;
  text-align: right;
}

.cart-item .remove-button {
  justify-self: end;
}

.quantity-stepper {
  display: inline-grid;
  grid-template-columns: 40px 44px 40px;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.quantity-stepper button,
.quantity-stepper span {
  height: 32px;
  display: grid;
  place-items: center;
  font-size: 0.82rem;
}

.quantity-stepper button {
  border: 0;
  background: white;
  color: var(--color-primary);
}

.quantity-stepper button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.quantity-stepper span {
  border-inline: 1px solid var(--color-border);
  font-weight: 600;
}

.remove-button {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(254, 202, 202, 0.95);
  background: rgba(254, 242, 242, 0.9);
  color: var(--color-danger);
}

.summary-column {
  position: sticky;
  top: 16px;
}

.summary-card {
  padding: 18px;
}

.summary-items {
  display: grid;
  gap: 2px;
  margin-bottom: 2px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 0;
  color: var(--color-primary-soft);
}

.summary-line.is-item {
  align-items: flex-start;
}

.summary-line.is-item span {
  max-width: 70%;
  font-size: 0.84rem;
}

.summary-line strong {
  color: var(--color-primary);
  font-size: 0.9rem;
}

.summary-separator {
  height: 1px;
  background: rgba(229, 231, 235, 0.9);
  margin: 6px 0 8px;
}

.total-line span {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--color-primary);
}

.total-line strong {
  font-size: 1.72rem;
  font-weight: 800;
  color: #2d5bff;
}

.summary-actions {
  display: grid;
  gap: 10px;
}

.action-button {
  min-height: 44px;
  border-radius: 16px;
  border: 0;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
}

.action-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.action-button.is-confirm {
  color: white;
  background: linear-gradient(145deg, #ff6b35, #ff8f57);
}

.action-button.is-cancel {
  color: var(--color-danger);
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.action-button.is-back {
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(229, 231, 235, 0.9);
}

.feedback-stack {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 50;
  display: grid;
  gap: 14px;
}

.feedback-card {
  width: min(420px, calc(100vw - 40px));
  padding: 18px 18px 18px 16px;
  border-radius: 20px;
  border: 1px solid rgba(229, 231, 235, 0.9);
  background: rgba(255, 255, 255, 0.97);
  box-shadow: var(--shadow-soft);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: start;
}

.feedback-card.is-clickable {
  cursor: pointer;
}

.feedback-card.is-success {
  border-color: rgba(187, 247, 208, 0.9);
  background: linear-gradient(145deg, rgba(240, 253, 244, 0.98), rgba(255, 255, 255, 0.97));
}

.feedback-card.is-error {
  border-color: rgba(254, 202, 202, 0.9);
  background: linear-gradient(145deg, rgba(254, 242, 242, 0.98), rgba(255, 255, 255, 0.97));
}

.feedback-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 1rem;
}

.is-success .feedback-icon {
  background: rgba(22, 163, 74, 0.12);
  color: var(--color-success);
}

.is-error .feedback-icon {
  background: rgba(220, 38, 38, 0.12);
  color: var(--color-danger);
}

.feedback-copy strong {
  display: block;
  margin-bottom: 6px;
  font-size: 1.12rem;
}

.feedback-copy p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.45;
}

.feedback-close {
  border: 0;
  background: transparent;
  color: var(--color-muted);
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

@media (max-width: 1100px) {
  .purchase-layout {
    grid-template-columns: 1fr;
  }

  .summary-column {
    position: static;
  }
}

@media (max-width: 760px) {
  .catalog-filters {
    grid-template-columns: 1fr;
  }

  .catalog-item,
  .cart-item {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .catalog-actions {
    justify-content: space-between;
  }

  .cart-item .quantity-stepper,
  .cart-item .cart-subtotal,
  .cart-item .remove-button {
    justify-self: stretch;
  }

  .cart-item .cart-subtotal {
    text-align: left;
  }
}
</style>
