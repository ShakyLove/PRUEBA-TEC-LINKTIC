<template>
  <BaseCard class="product-card" :padded="false">
    <div class="product-media">
      <img :src="product.imageUrl" :alt="product.name" />
      <span class="soft-tag">{{ product.category }}</span>
    </div>

    <div class="product-body">
      <div class="product-heading">
        <div>
          <h3>{{ product.name }}</h3>
          <p class="muted-text">{{ truncatedDescription }}</p>
        </div>
        <strong>{{ formatCurrency(product.price) }}</strong>
      </div>

      <div class="product-stats">
        <span>Stock: {{ product.stock }}</span>
        <span :class="product.stock <= product.minimumStock ? 'status-warning' : 'status-success'">
          Min: {{ product.minimumStock }}
        </span>
      </div>

      <div class="actions-row">
        <BaseButton secondary @click="$emit('inventory', product)">
          Inventario
        </BaseButton>
        <BaseButton tertiary @click="$emit('detail', product)">
          Ver detalle
        </BaseButton>
        <BaseButton :disabled="product.stock === 0" @click="$emit('purchase', product)">
          Comprar
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from "vue";
import BaseButton from "../base/BaseButton.vue";
import BaseCard from "../base/BaseCard.vue";
import { formatCurrency } from "../../utils/currency";

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

defineEmits(["inventory", "detail", "purchase"]);

const truncatedDescription = computed(() => {
  if (props.product.description.length <= 92) {
    return props.product.description;
  }

  return `${props.product.description.slice(0, 92)}...`;
});
</script>

<style scoped>
.product-card {
  overflow: hidden;
  transition: transform var(--transition-soft), box-shadow var(--transition-soft);
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 38px rgba(15, 23, 42, 0.1);
}

.product-media {
  position: relative;
  height: 210px;
}

.product-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-media .soft-tag {
  position: absolute;
  left: 16px;
  bottom: 16px;
}

.product-body {
  padding: 20px;
}

@media (max-width: 768px) {
  .product-heading,
  .product-stats {
    flex-direction: column;
  }
}

.product-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

h3 {
  margin: 0 0 10px;
}

strong {
  white-space: nowrap;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin: 18px 0;
  color: var(--color-muted);
}
</style>
