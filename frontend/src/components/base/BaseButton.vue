<template>
  <n-button
    :type="type"
    :secondary="secondary"
    :quaternary="quaternary"
    :tertiary="tertiary"
    :block="block"
    :loading="loading"
    :disabled="disabled"
    :round="round"
    @click="$emit('click', $event)"
  >
    <slot />
  </n-button>
</template>

<script setup>
import { NButton } from "naive-ui";

defineProps({
  type: {
    type: String,
    default: "primary"
  },
  secondary: Boolean,
  quaternary: Boolean,
  tertiary: Boolean,
  block: Boolean,
  loading: Boolean,
  disabled: Boolean,
  round: {
    type: Boolean,
    default: true
  }
});

defineEmits(["click"]);
</script>
