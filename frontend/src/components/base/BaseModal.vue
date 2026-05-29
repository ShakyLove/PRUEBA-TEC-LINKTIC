<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title"
    class="base-modal"
    :bordered="false"
    @update:show="$emit('update:show', $event)"
  >
    <slot />
  </n-modal>
</template>

<script setup>
import { NModal } from "naive-ui";

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  }
});

defineEmits(["update:show"]);
</script>

<style scoped>
:deep(.n-card) {
  max-width: 580px;
  border-radius: 24px;
}
</style>
