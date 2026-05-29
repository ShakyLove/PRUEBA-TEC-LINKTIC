<template>
  <transition name="loading-fade">
    <div v-if="uiStore.isGlobalLoading" class="loading-overlay" aria-live="polite" aria-busy="true">
      <div class="loading-card">
        <span class="loading-spinner" />
        <p>Cargando informacion...</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useUiStore } from "../../stores/ui.store";

const uiStore = useUiStore();
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background: rgba(245, 247, 251, 0.72);
  backdrop-filter: blur(6px);
}

.loading-card {
  min-width: 180px;
  padding: 18px 22px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.9);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  display: grid;
  justify-items: center;
  gap: 12px;
}

.loading-card p {
  margin: 0;
  color: var(--color-primary-soft);
  font-size: 0.92rem;
  font-weight: 600;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid rgba(255, 107, 53, 0.18);
  border-top-color: var(--color-accent);
  animation: spin 0.85s linear infinite;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 160ms ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
