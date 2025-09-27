import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";
import Meals from "../views/Meals.vue";
import Workouts from "../views/Workouts.vue";
import Profile from "../views/Profile.vue"; 
import Achievements from '../views/Achievements.vue';

const routes = [
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/meals", component: Meals, meta: { requiresAuth: true } },
  { path: "/workouts", component: Workouts, meta: { requiresAuth: true } },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password/:token", component: ResetPassword },
  { path: "/profile", component: Profile },
  { path: '/achievements', component: Achievements },
];

const router = createRouter({ history: createWebHistory(), routes });

// Auth guard
router.beforeEach((to, from, next) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (to.meta?.requiresAuth && !token) return next("/login");
  if ((to.path === "/login" || to.path === "/register") && token)
    return next("/dashboard");

  next();
});

export default router;
