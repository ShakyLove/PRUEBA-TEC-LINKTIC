import { createApp } from "vue";
import { createPinia } from "pinia";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import App from "./App.vue";
import router from "./router";
import "./assets/styles/main.css";
import { useAuthStore } from "./stores/auth.store";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.component("FontAwesomeIcon", FontAwesomeIcon);

const authStore = useAuthStore();
authStore.loadSession();

app.mount("#app");
