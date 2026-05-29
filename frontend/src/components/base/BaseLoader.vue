<template>
  <div class="loader-grid" :class="variant">
    <template v-if="variant === 'cards'">
      <n-skeleton v-for="index in count" :key="index" class="loader-card" height="260px" sharp />
    </template>
    <template v-else>
      <div class="loader-inline">
        <n-spin size="large" />
        <span>{{ text }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { NSkeleton, NSpin } from "naive-ui";

defineProps({
  variant: {
    type: String,
    default: "cards"
  },
  count: {
    type: Number,
    default: 6
  },
  text: {
    type: String,
    default: "Cargando..."
  }
});
</script>

<style scoped>
.loader-grid.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
}

.loader-card {
  overflow: hidden;
  border-radius: 24px;
}

.loader-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  color: var(--color-muted);
}
</style>
