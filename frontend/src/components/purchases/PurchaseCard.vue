<template>
  <BaseCard class="purchase-card">
    <div class="purchase-main">
      <div>
        <p class="muted-text">Compra #{{ purchase.purchaseId }}</p>
        <h3>{{ formatCurrency(purchase.totalAmount) }}</h3>
      </div>

      <div class="purchase-meta">
        <n-tag round type="success">{{ purchase.status }}</n-tag>
        <span class="muted-text">{{ formatDate(purchase.createdAt) }}</span>
      </div>
    </div>

    <BaseButton secondary @click="$emit('detail', purchase)">
      Ver detalle
    </BaseButton>
  </BaseCard>
</template>

<script setup>
import { NTag } from "naive-ui";
import BaseButton from "../base/BaseButton.vue";
import BaseCard from "../base/BaseCard.vue";
import { formatCurrency } from "../../utils/currency";

defineProps({
  purchase: {
    type: Object,
    required: true
  }
});

defineEmits(["detail"]);

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
</script>

<style scoped>
.purchase-card {
  display: grid;
  gap: 16px;
}

.purchase-main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.purchase-meta {
  display: grid;
  justify-items: end;
  gap: 10px;
}

h3 {
  margin: 4px 0 0;
}

@media (max-width: 768px) {
  .purchase-main {
    flex-direction: column;
  }

  .purchase-meta {
    justify-items: start;
  }
}
</style>
