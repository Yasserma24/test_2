import { createApp } from "vue";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import { createVuetify } from "vuetify";
import routes from "./routes"; // Ensure routes are correctly imported
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import axios from "axios";
import VueAxios from "vue-axios";
import { createPinia } from "pinia";
import Pusher from "pusher-js";

const router = createRouter({
  history: createWebHistory(),
  routes, // Ensure routes are correctly passed here
});
const pusher = new Pusher("1a9e1b88fcbdd25d7a99", {
  cluster: "eu",
  encrypted: true,
  debug: true,
});
export default pusher;

const vuetify = createVuetify();
const pinia = createPinia();

// Create the app and apply the plugins
createApp(App)
  .use(router) // Use the router
  .use(vuetify) // Use Vuetify
  .use(VueAxios, axios) // Use VueAxios with axios
  .use(pinia) // Use Pinia store
  .mount("#app");
