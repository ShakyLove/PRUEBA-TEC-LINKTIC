<template>
  <div class="empty-state">
    <div class="empty-icon">
      <FontAwesomeIcon :icon="icon" />
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <slot />
  </div>
</template>

<script setup>
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";

defineProps({
  icon: {
    type: Array,
    default: () => faBoxOpen
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.empty-state {
  padding: 36px 20px;
  text-align: center;
  color: var(--color-muted);
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: var(--color-surface-soft);
  color: var(--color-primary-soft);
  font-size: 1.25rem;
}

h3 {
  margin: 0 0 8px;
  color: var(--color-text);
}

p {
  margin: 0;
}
</style>
