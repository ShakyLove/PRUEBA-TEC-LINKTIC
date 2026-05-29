<template>
  <div class="error-state">
    <div class="error-icon">
      <FontAwesomeIcon :icon="icon" />
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <BaseButton v-if="showRetry" secondary @click="$emit('retry')">
      Reintentar
    </BaseButton>
  </div>
</template>

<script setup>
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import BaseButton from "./BaseButton.vue";

defineProps({
  icon: {
    type: Array,
    default: () => faTriangleExclamation
  },
  title: {
    type: String,
    default: "No fue posible cargar la informacion"
  },
  description: {
    type: String,
    required: true
  },
  showRetry: {
    type: Boolean,
    default: true
  }
});

defineEmits(["retry"]);
</script>

<style scoped>
.error-state {
  padding: 36px 20px;
  text-align: center;
}

.error-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: rgba(220, 38, 38, 0.08);
  color: var(--color-danger);
  font-size: 1.25rem;
}

h3 {
  margin: 0 0 8px;
}

p {
  margin: 0 0 20px;
  color: var(--color-muted);
}
</style>
