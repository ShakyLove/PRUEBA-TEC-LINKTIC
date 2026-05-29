<template>
  <div class="purchase-form">
    <div v-if="showSummary" class="purchase-head">
      <div>
        <h3>{{ product.name }}</h3>
        <p class="muted-text">Disponible: {{ product.stock }}</p>
      </div>
      <strong>{{ formatCurrency(product.price) }}</strong>
    </div>

    <div v-else class="inline-summary muted-text">
      <span>Disponible: {{ product.stock }}</span>
      <span>Maximo por compra: {{ product.stock }}</span>
    </div>

    <n-input-number
      v-model:value="quantity"
      :min="1"
      :max="product.stock"
      clearable
      placeholder="Cantidad"
    />

    <n-alert v-if="validationMessage" type="warning" :show-icon="true">
      {{ validationMessage }}
    </n-alert>

    <div class="actions-row">
      <BaseButton block :loading="loading" :disabled="Boolean(validationMessage)" @click="submitPurchase">
        Confirmar compra
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { NAlert, NInputNumber } from "naive-ui";
import BaseButton from "../base/BaseButton.vue";
import { formatCurrency } from "../../utils/currency";

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  loading: Boolean,
  showSummary: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["submit"]);
const quantity = ref(1);

watch(
  () => props.product?.id,
  () => {
    quantity.value = 1;
  }
);

const validationMessage = computed(() => {
  if (props.product.stock === 0) {
    return "No es posible comprar un producto sin stock.";
  }

  if (!quantity.value || quantity.value <= 0) {
    return "La cantidad debe ser mayor a cero.";
  }

  if (quantity.value > props.product.stock) {
    return "La cantidad no puede superar el stock disponible.";
  }

  return "";
});

function submitPurchase() {
  if (validationMessage.value) {
    return;
  }

  emit("submit", {
    productId: props.product.id,
    quantity: quantity.value
  });
}
</script>

<style scoped>
.purchase-form {
  display: grid;
  gap: 16px;
}

.inline-summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.88rem;
}

.purchase-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

h3 {
  margin: 0 0 6px;
}

strong {
  white-space: nowrap;
}

@media (max-width: 640px) {
  .inline-summary,
  .purchase-head {
    flex-direction: column;
  }
}
</style>
