import axios from "axios";
import { normalizeApiError } from "../utils/errorHandler";
import { useUiStore } from "../stores/ui.store";
import { clearSession, getToken } from "../utils/storage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 12000
});

apiClient.interceptors.request.use((config) => {
  const uiStore = useUiStore();
  uiStore.startLoading();
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  const uiStore = useUiStore();
  uiStore.finishLoading();
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => {
    const uiStore = useUiStore();
    uiStore.finishLoading();
    return response;
  },
  (error) => {
    const uiStore = useUiStore();
    uiStore.finishLoading();
    const normalized = normalizeApiError(error);

    if (normalized.status === 401) {
      clearSession();
      uiStore.resetLoading();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(normalized);
  }
);

export default apiClient;
