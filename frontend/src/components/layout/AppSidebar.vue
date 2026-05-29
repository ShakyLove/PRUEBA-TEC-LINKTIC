<template>
  <aside class="surface-card sidebar">
    <div class="brand">
      <div class="brand-mark">I</div>
      <div>
        <strong>Inventory</strong>
        <p>Control Center</p>
      </div>
    </div>

    <nav class="nav-list">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="nav-item" active-class="is-active">
        <FontAwesomeIcon :icon="item.icon" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <button class="user-box" type="button">
        <div class="user-avatar">
          <FontAwesomeIcon :icon="faUserCircle" />
        </div>
        <div class="user-copy">
          <strong>{{ authStore.userFullName }}</strong>
          <p>{{ authStore.user?.role || "Usuario" }}</p>
        </div>
      </button>

      <button class="logout-button" type="button" @click="handleLogout">
        <FontAwesomeIcon :icon="faArrowRightFromBracket" />
        <span>Cerrar sesion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter, RouterLink } from "vue-router";
import {
  faArrowRightFromBracket,
  faBagShopping,
  faBoxArchive,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import { useAuthStore } from "../../stores/auth.store";

const items = [
  { to: "/inventory", label: "Inventario", icon: faBoxArchive },
  { to: "/purchases", label: "Compras", icon: faBagShopping },
  { to: "/products", label: "Productos", icon: faChartLine }
];

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  padding: 18px 14px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 18px;
  overflow: hidden;
  border-radius: 0 24px 24px 0;
  box-shadow: none;
  border-left: 0;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 6px 8px 10px;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: white;
  background: linear-gradient(145deg, #ff6b35, #ff9b66);
}

.brand p {
  margin: 2px 0 0;
  color: var(--color-muted);
  font-size: 0.8rem;
}

.nav-list {
  display: grid;
  align-content: start;
  gap: 4px;
}

.nav-item {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 42px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--color-primary-soft);
  transition: var(--transition-soft);
}

.nav-item:hover,
.nav-item.is-active {
  background: rgba(255, 107, 53, 0.1);
  color: var(--color-accent);
}

.sidebar-footer {
  display: grid;
  gap: 10px;
  padding: 10px 6px 4px;
  border-top: 1px solid var(--color-border);
  align-self: end;
}

.user-box,
.logout-button {
  width: 100%;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 12px;
  color: var(--color-primary);
  text-align: left;
  transition: var(--transition-soft);
}

.user-box:hover,
.logout-button:hover {
  background: var(--color-surface-soft);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.user-copy strong,
.user-copy p {
  display: block;
}

.user-copy p {
  margin: 2px 0 0;
  color: var(--color-muted);
  font-size: 0.8rem;
}

.logout-button {
  color: var(--color-muted);
}

@media (max-width: 1180px) {
  .sidebar {
    position: relative;
    height: auto;
    width: 100%;
    border-radius: 24px;
    border-left: 1px solid rgba(229, 231, 235, 0.7);
  }
}
</style>
