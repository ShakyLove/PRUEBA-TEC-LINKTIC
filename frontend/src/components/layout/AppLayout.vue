<template>
  <div class="app-shell">
    <div class="dashboard-grid">
      <AppSidebar />

      <div class="panel-stack content-column">
        <transition name="page-transition" mode="out-in">
          <main :key="$route.fullPath">
            <slot />
          </main>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import AppSidebar from "./AppSidebar.vue";
import { useAuthStore } from "../../stores/auth.store";

const authStore = useAuthStore();
const router = useRouter();

function handleUnauthorized() {
  authStore.logout();
  router.push("/login");
}

onMounted(() => {
  window.addEventListener("auth:unauthorized", handleUnauthorized);
});

onUnmounted(() => {
  window.removeEventListener("auth:unauthorized", handleUnauthorized);
});
</script>

<style scoped>
.content-column {
  min-width: 0;
  margin-left: 256px;
  padding-left: 16px;
}

@media (max-width: 1180px) {
  .content-column {
    margin-left: 0;
    padding-left: 0;
  }
}
</style>
