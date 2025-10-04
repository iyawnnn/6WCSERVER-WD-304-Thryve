import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";
import Meals from "../views/Meals.vue";
import Workouts from "../views/Workouts.vue";
import Profile from "../views/Profile.vue";
import Achievements from "../views/Achievements.vue";
import WaterTracker from "../views/WaterTracker.vue";
import SleepTracker from "../views/SleepTracker.vue";
import NotFound from "../views/NotFound.vue"; 

const routes = [
  { path: "/", component: Home, meta: { title: "Thryve - Home" } },
  { path: "/login", component: Login, meta: { title: "Thryve - Login" } },
  { path: "/register", component: Register, meta: { title: "Thryve - Register" } },
  { path: "/dashboard", component: Dashboard, meta: { title: "Thryve - Dashboard", requiresAuth: true } },
  { path: "/meals", component: Meals, meta: { title: "Thryve - Meals", requiresAuth: true } },
  { path: "/workouts", component: Workouts, meta: { title: "Thryve - Workouts", requiresAuth: true } },
  { path: "/forgot-password", component: ForgotPassword, meta: { title: "Thryve - Forgot Password" } },
  { path: "/reset-password/:token", component: ResetPassword, meta: { title: "Thryve - Reset Password" } },
  { path: "/profile", component: Profile, meta: { title: "Thryve - Profile", requiresAuth: true } },
  { path: "/achievements", component: Achievements, meta: { title: "Thryve - Achievements", requiresAuth: true } },
  { path: "/water", component: WaterTracker, meta: { title: "Thryve - Water Tracker", requiresAuth: true } },
  { path: "/sleep", component: SleepTracker, meta: { title: "Thryve - Sleep Tracker", requiresAuth: true } },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound, meta: { title: "Thryve - Page Not Found" } },
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

// After auth guard
router.afterEach((to) => {
  document.title = to.meta.title || "Thryve";
});


export default router;
