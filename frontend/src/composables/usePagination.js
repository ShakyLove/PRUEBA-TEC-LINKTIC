import { computed, ref } from "vue";

export function usePagination(initialPage = 0, initialSize = 8) {
  const page = ref(initialPage);
  const size = ref(initialSize);
  const totalPages = ref(0);

  const canGoPrevious = computed(() => page.value > 0);
  const canGoNext = computed(() => page.value + 1 < totalPages.value);

  function nextPage() {
    if (canGoNext.value) {
      page.value += 1;
    }
  }

  function previousPage() {
    if (canGoPrevious.value) {
      page.value -= 1;
    }
  }

  function setPage(value) {
    page.value = value;
  }

  return {
    page,
    size,
    totalPages,
    canGoPrevious,
    canGoNext,
    nextPage,
    previousPage,
    setPage
  };
}
