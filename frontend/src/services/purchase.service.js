import apiClient from "../api/apiClient";

export const purchaseService = {
  createPurchase(payload) {
    return apiClient.post("/purchases", payload);
  },

  getPurchases(params) {
    return apiClient.get("/purchases", { params });
  },

  getPurchaseById(id) {
    return apiClient.get(`/purchases/${id}`);
  }
};
