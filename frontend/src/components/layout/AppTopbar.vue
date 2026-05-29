<template>
  <header class="surface-card topbar">
    <div>
      <p class="muted-text topbar-kicker">Inventory dashboard</p>
      <h2>{{ route.meta.title || "Panel" }}</h2>
    </div>

    <div class="topbar-actions">
      <n-input
        v-model:value="searchHint"
        class="topbar-search"
        clearable
        placeholder="Buscar productos o compras..."
      >
        <template #prefix>
          <FontAwesomeIcon :icon="faMagnifyingGlass" />
        </template>
      </n-input>

      <n-button quaternary circle @click="$emit('open-profile')">
        <FontAwesomeIcon :icon="faUserCircle" />
      </n-button>

      <n-button quaternary circle @click="handleLogout">
        <FontAwesomeIcon :icon="faArrowRightFromBracket" />
      </n-button>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NButton, NInput } from "naive-ui";
import {
  faArrowRightFromBracket,
  faMagnifyingGlass
} from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import { useAuthStore } from "../../stores/auth.store";

defineEmits(["open-profile"]);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const searchHint = ref("");

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.topbar {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.topbar h2 {
  margin: 6px 0 0;
}

.topbar-kicker {
  margin: 0;
}

.topbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.topbar-search {
  width: 320px;
}

@media (max-width: 768px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar-search {
    width: 100%;
  }
}
</style>
