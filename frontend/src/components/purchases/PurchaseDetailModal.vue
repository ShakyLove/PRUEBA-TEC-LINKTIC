<template>
  <BaseModal :show="show" title="Detalle de compra" @update:show="$emit('update:show', $event)">
    <template v-if="purchase">
      <div class="panel-stack">
        <div class="summary-grid">
          <div class="soft-stat">
            <p class="muted-text">Compra</p>
            <strong>#{{ purchase.purchaseId }}</strong>
          </div>
          <div class="soft-stat">
            <p class="muted-text">Estado</p>
            <strong>{{ purchase.status }}</strong>
          </div>
          <div class="soft-stat">
            <p class="muted-text">Total</p>
            <strong>{{ formatCurrency(purchase.totalAmount) }}</strong>
          </div>
        </div>

        <BaseCard v-for="item in purchase.items" :key="item.productId">
          <div class="item-row">
            <div>
              <h4>{{ item.productName }}</h4>
              <p class="muted-text">Cantidad: {{ item.quantity }}</p>
            </div>
            <div class="item-amount">
              <strong>{{ formatCurrency(item.subtotal) }}</strong>
              <p class="muted-text">{{ formatCurrency(item.unitPrice) }} c/u</p>
            </div>
          </div>
        </BaseCard>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseCard from "../base/BaseCard.vue";
import BaseModal from "../base/BaseModal.vue";
import { formatCurrency } from "../../utils/currency";

defineProps({
  show: Boolean,
  purchase: {
    type: Object,
    default: null
  }
});

defineEmits(["update:show"]);
</script>

<style scoped>
.item-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.item-row h4 {
  margin: 0 0 6px;
}

.item-row p {
  margin: 0;
}

.item-amount {
  text-align: right;
}

@media (max-width: 768px) {
  .item-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-amount {
    text-align: left;
  }
}
</style>
