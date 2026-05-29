import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", () => {
  const pendingRequests = ref(0);

  const isGlobalLoading = computed(() => pendingRequests.value > 0);

  function startLoading() {
    pendingRequests.value += 1;
  }

  function finishLoading() {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1);
  }

  function resetLoading() {
    pendingRequests.value = 0;
  }

  return {
    pendingRequests,
    isGlobalLoading,
    startLoading,
    finishLoading,
    resetLoading
  };
});
