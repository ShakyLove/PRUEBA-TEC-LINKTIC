import apiClient from "../api/apiClient";

export const authService = {
  login(credentials) {
    return apiClient.post("/auth/login", credentials);
  },

  getCurrentUser() {
    return apiClient.get("/auth/me");
  }
};
