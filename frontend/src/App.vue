<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-notification-provider>
      <n-dialog-provider>
        <n-message-provider>
          <GlobalLoadingOverlay />
          <RouterView />
        </n-message-provider>
      </n-dialog-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup>
import {
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NNotificationProvider
} from "naive-ui";
import { RouterView } from "vue-router";
import GlobalLoadingOverlay from "./components/base/GlobalLoadingOverlay.vue";

const themeOverrides = {
  common: {
    primaryColor: "#ff6b35",
    primaryColorHover: "#ff8356",
    primaryColorPressed: "#e85a29",
    borderRadius: "16px",
    fontFamily: "Inter, sans-serif"
  },
  Card: {
    borderRadius: "24px"
  }
};
</script>
