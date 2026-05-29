import { createRouter, createWebHistory } from "vue-router";
import { getToken } from "../utils/storage";

const routes = [
  {
    path: "/",
    redirect: () => (getToken() ? "/inventory" : "/login")
  },
  {
    path: "/login",
    component: () => import("../views/LoginView.vue"),
    meta: {
      guestOnly: true,
      title: "Acceso"
    }
  },
  {
    path: "/products",
    component: () => import("../views/ProductsView.vue"),
    meta: {
      requiresAuth: true,
      title: "Productos"
    }
  },
  {
    path: "/products/:id",
    component: () => import("../views/ProductDetailView.vue"),
    meta: {
      requiresAuth: true,
      title: "Detalle del producto"
    }
  },
  {
    path: "/purchases",
    component: () => import("../views/PurchasesView.vue"),
    meta: {
      requiresAuth: true,
      title: "Compras"
    }
  },
  {
    path: "/purchases/new",
    component: () => import("../views/NewPurchaseView.vue"),
    meta: {
      requiresAuth: true,
      title: "Nueva compra"
    }
  },
  {
    path: "/inventory",
    component: () => import("../views/InventoryView.vue"),
    meta: {
      requiresAuth: true,
      title: "Inventario"
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const hasToken = Boolean(getToken());

  if (to.meta.requiresAuth && !hasToken) {
    return "/login";
  }

  if (to.meta.guestOnly && hasToken) {
    return "/inventory";
  }

  return true;
});

export default router;
