import NavBar from "../components/NavBar.vue";
import SignUp from "@/views/SignUp.vue";
import SignIn from "@/views/SignIn.vue";
import ForgotPassword from "@/views/ForgotPassword.vue";
import adminPannel from "@/views/adminPannel.vue";
import ResetPassword from "@/views/ResetPassword.vue";
import UsersContent from "@/views/UsersContent.vue";
import { useAuthStore } from "@/stores/authStore";
import { createWebHashHistory } from "vue-router";
import { createRouter } from "vue-router";
import ProductContent from "@/views/ProductContent.vue";
import OrderContent from "@/views/OrderContent.vue";
//import { is } from 'core-js/core/object';

const routes = [
  {
    path: "/",
    redirect: "/SignIn", // Default to Sign-In
  },
  {
    path: "/SignIn",
    name: "SignIn",
    component: SignIn,
    meta: { requiresGuest: true },
  },
  {
    path: "/SignUp",
    name: "SignUp",
    component: SignUp,
    meta: { requiresGuest: true },
  },
  {
    path: "/NavBar",
    name: "NavBar",
    component: NavBar,
  },
  {
    path: "/ForgotPassword",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: { requiresGuest: true },
  },
  {
    path: "/adminPannel",
    name: "adminPannel",
    component: adminPannel,
    meta: { requiresAuth: true },
  },
  {
    path: "/password-reset/:token",
    name: "ResetPassword",
    component: ResetPassword,
    meta: { requiresGuest: true },
  },
  {
    path: "/UsersContent",
    name: "UsersContent",
    component: UsersContent,
    meta: { requiresAuth: true },
  },
  {
    path: "/ProductContent",
    name: "ProductContent",
    component: ProductContent,
    meta: { requiresAuth: true },
  },
  {
    path: "/OrderContent",
    name: "OrderContent",
    component: OrderContent,
    meta: { requiresAuth: true },
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.authToken;

  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: "adminPannel" });
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: "SignIn" });
  }

  next();
});

export default routes;
