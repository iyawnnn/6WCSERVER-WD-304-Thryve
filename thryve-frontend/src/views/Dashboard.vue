<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p v-if="userMessage">{{ userMessage }}</p>

    <section>
      <h2>Summary</h2>
      <p>Total Meals: {{ totalMeals }}</p>
      <p>Total Workouts: {{ totalWorkouts }}</p>
      <p>Total Calories Consumed: {{ totalCalories }}</p>
      <p>Total Calories Burned: {{ totalCaloriesBurned }}</p>
    </section>

    <button @click="logout">Logout</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../utils/api";
import { meals } from "../composables/useMeals.js";
import { workouts } from "../composables/useWorkouts.js";

const router = useRouter();
const userMessage = ref("");
const totalMeals = ref(0);
const totalWorkouts = ref(0);
const totalCalories = ref(0);
const totalCaloriesBurned = ref(0);

// Logout
function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  router.push("/login");
}

// Fetch dashboard summary
const fetchDashboard = async () => {
  try {
    // You can also fetch aggregated summary from backend if available
    await Promise.all([fetchMeals(), fetchWorkouts()]);

    totalMeals.value = meals.value.length;
    totalWorkouts.value = workouts.value.length;
    totalCalories.value = meals.value.reduce((sum, m) => sum + m.calories, 0);
    totalCaloriesBurned.value = workouts.value.reduce((sum, w) => sum + w.calories, 0);

    userMessage.value = "Welcome back!";
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

// Fetch meals and workouts
const fetchMeals = async () => {
  try {
    const res = await api.get("/meals");
    meals.value = res.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

const fetchWorkouts = async () => {
  try {
    const res = await api.get("/workouts");
    workouts.value = res.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

onMounted(fetchDashboard);
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}
section {
  margin-bottom: 1.5rem;
}
</style>
