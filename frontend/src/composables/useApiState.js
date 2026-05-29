import { ref } from "vue";

export function useApiState() {
  const loading = ref(false);
  const error = ref("");
  const success = ref("");

  function start() {
    loading.value = true;
    error.value = "";
    success.value = "";
  }

  function fail(message) {
    loading.value = false;
    error.value = message;
  }

  function succeed(message = "") {
    loading.value = false;
    success.value = message;
  }

  function finish() {
    loading.value = false;
  }

  return {
    loading,
    error,
    success,
    start,
    fail,
    succeed,
    finish
  };
}
