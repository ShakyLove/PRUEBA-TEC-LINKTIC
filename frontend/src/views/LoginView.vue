<template>
  <div class="login-page">
    <div class="login-card surface-card">
      <div class="login-copy">
        <p class="soft-tag">Vue 3 + Pinia + API REST</p>
        <h1>Accede al panel premium de inventario</h1>
        <p class="muted-text">
          Gestiona productos, consulta inventario y registra compras desde una experiencia moderna y profesional.
        </p>
      </div>

      <n-form class="login-form" @submit.prevent="handleSubmit">
        <n-form-item label="Username">
          <n-input v-model:value="form.username" placeholder="Ingresa tu usuario" />
        </n-form-item>

        <n-form-item label="Contrasena">
          <n-input
            v-model:value="form.password"
            type="password"
            show-password-on="click"
            placeholder="Ingresa tu contrasena"
          />
        </n-form-item>

        <n-alert v-if="validationMessage || authStore.error" type="error" :show-icon="true">
          {{ validationMessage || authStore.error }}
        </n-alert>

        <BaseButton block :loading="authStore.loading" @click="handleSubmit">
          Iniciar sesion
        </BaseButton>
      </n-form>

      <div class="demo-credentials">
        <p><strong>Credenciales demo:</strong></p>
        <p>admin / admin123</p>
        <p>user / user123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { NAlert, NForm, NFormItem, NInput } from "naive-ui";
import BaseButton from "../components/base/BaseButton.vue";
import { useAuthStore } from "../stores/auth.store";
import { useNotifications } from "../composables/useNotifications";

const router = useRouter();
const authStore = useAuthStore();
const notifications = useNotifications();

const form = reactive({
  username: "admin",
  password: "admin123"
});

const validationMessage = computed(() => {
  if (!form.username.trim()) {
    return "El username es obligatorio.";
  }

  if (!form.password.trim()) {
    return "La contrasena es obligatoria.";
  }

  return "";
});

async function handleSubmit() {
  if (validationMessage.value) {
    return;
  }

  try {
    await authStore.login(form);
    notifications.success("Sesion iniciada correctamente.");
    router.push("/inventory");
  } catch (_) {
    notifications.error(authStore.error || "No fue posible iniciar sesion.");
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-card {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  padding: 28px;
}

.login-copy {
  padding: 12px;
}

.login-copy h1 {
  margin: 20px 0 14px;
  font-size: clamp(2.1rem, 3vw, 3.4rem);
  line-height: 1.05;
}

.login-form {
  display: grid;
  gap: 8px;
  align-content: center;
}

.demo-credentials {
  grid-column: 1 / -1;
  padding: 18px 20px;
  border-radius: 18px;
  background: var(--color-surface-soft);
  color: var(--color-muted);
}

.demo-credentials p {
  margin: 4px 0;
}

@media (max-width: 900px) {
  .login-card {
    grid-template-columns: 1fr;
  }
}
</style>
