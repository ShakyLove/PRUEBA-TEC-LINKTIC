import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { authService } from "../services/auth.service";
import {
  clearSession,
  getToken,
  getUser,
  persistSession
} from "../utils/storage";

export const useAuthStore = defineStore("auth", () => {
  const token = ref("");
  const user = ref(null);
  const loading = ref(false);
  const error = ref("");

  const isAuthenticated = computed(() => Boolean(token.value));
  const userFullName = computed(() => user.value?.fullName || "Usuario");

  function loadSession() {
    token.value = getToken() || "";
    user.value = getUser();
  }

  async function login(credentials) {
    loading.value = true;
    error.value = "";

    try {
      const { data } = await authService.login(credentials);
      token.value = data.token;
      user.value = data.user;
      persistSession(data.token, data.user);
      return data;
    } catch (apiError) {
      error.value = apiError.message;
      throw apiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!token.value) {
      return null;
    }

    try {
      const { data } = await authService.getCurrentUser();
      user.value = data;
      persistSession(token.value, data);
      return data;
    } catch (apiError) {
      logout();
      throw apiError;
    }
  }

  function logout() {
    token.value = "";
    user.value = null;
    error.value = "";
    clearSession();
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    userFullName,
    login,
    loadSession,
    fetchMe,
    logout
  };
});
