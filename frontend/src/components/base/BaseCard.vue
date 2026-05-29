<template>
  <section class="section-card base-card" :class="{ padded }">
    <slot />
  </section>
</template>

<script setup>
defineProps({
  padded: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.base-card.padded {
  padding: 24px;
}
</style>
