import apiClient from "../api/apiClient";

export const productService = {
  getProducts(params) {
    return apiClient.get("/products", { params });
  },

  getProductById(id) {
    return apiClient.get(`/products/${id}`);
  },

  getProductInventory(id) {
    return apiClient.get(`/products/${id}/inventory`);
  }
};
