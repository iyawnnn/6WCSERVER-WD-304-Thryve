<template>
  <div class="container py-3">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Welcome back, {{ userName }}</h2>
      <button class="btn btn-outline-danger btn-sm" @click="logout">
        <i class="bi bi-box-arrow-right me-1"></i> Logout
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="row g-3 mt-3">
      <div
        class="col-sm-6 col-md-4"
        v-for="card in statCards"
        :key="card.title"
      >
        <div class="card p-3 h-100">
          <div class="card-body">
            <h6 class="card-title">{{ card.title }}</h6>
            <p class="display-6 mb-0">{{ card.value }}</p>
            <small v-if="card.note" class="text-muted">{{ card.note }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Goals Progress -->
    <div class="card mt-3 p-3">
      <h6>Daily Goals</h6>

      <div class="mb-2">
        <label class="form-label mb-1">Calories</label>
        <progress :value="today.progress.calories" max="100" class="w-100"></progress>
        <small>
          {{ today.caloriesEaten }} / {{ today.goals.calories }} kcal ({{ today.progress.calories }}%)
        </small>
      </div>

      <div class="mb-2">
        <label class="form-label mb-1">Workout Minutes</label>
        <progress :value="today.progress.workoutMinutes" max="100" class="w-100"></progress>
        <small>
          {{ today.workoutMinutes }} / {{ today.goals.workoutMinutes }} mins ({{ today.progress.workoutMinutes }}%)
        </small>
      </div>

      <div class="mb-2">
        <label class="form-label mb-1">Protein</label>
        <progress :value="today.progress.protein" max="100" class="w-100"></progress>
        <small>
          {{ today.proteinEaten }} / {{ today.goals.protein }} g ({{ today.progress.protein }}%)
        </small>
      </div>
    </div>

    <!-- Weekly Chart -->
    <div class="card mt-4 p-3">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-0">
            Last 7 days <small class="text-muted">({{ weekStartLabel }})</small>
          </h5>
          <p v-if="weekRange" class="mb-0">
            <small>Week: {{ weekRange }}</small>
          </p>
        </div>
        <div>
          <select v-model="weekStart" @change="setWeekStart(weekStart)" class="form-select form-select-sm">
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
          </select>
        </div>
      </div>

      <div style="height: 320px" class="mt-3">
        <canvas ref="chartRef"></canvas>
      </div>

      <div class="mt-2">
        <small class="text-muted">
          Avg burned: {{ avg("burned") }}, Avg eaten: {{ avg("eaten") }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { getWeekRange } from "../utils/dateHelpers";
import dashboardService from "../services/dashboardService";
import { meals, fetchMeals } from "../composables/useMeals.js";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const auth = useAuthStore();
const router = useRouter();

const userName = computed(() => auth.user?.name || "User");

const weekStart = ref("Sunday");
const weekStartLabel = computed(() => weekStart.value);
const weekStartNumber = computed(() => (weekStart.value === "Monday" ? 1 : 0));
const weekRange = computed(() => getWeekRange(weekStartNumber.value));

const today = ref({
  caloriesBurned: 0,
  caloriesEaten: 0,
  proteinEaten: 0,
  workoutMinutes: 0,
  net: 0,
  goals: { calories: 0, protein: 0, workoutMinutes: 0 },
  progress: { calories: 0, protein: 0, workoutMinutes: 0 },
});

const weekly = ref([]);
const meta = ref({});
const chartRef = ref(null);
let chartInstance = null;

// Stat Cards
const statCards = computed(() => [
  { title: "Calories Burned Today", value: today.value.caloriesBurned },
  { title: "Calories Eaten Today", value: today.value.caloriesEaten },
  { title: "Net Calories", value: today.value.net, note: "Eaten - Burned" },
]);

function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  router.push("/login");
}

async function setWeekStart(value) {
  try {
    await api.put("/user/preferences", { weekStart: value });
    weekStart.value = value;
    await loadWeekly();
  } catch (err) {
    console.error(err);
  }
}

// Compute today's totals from meals
function computeMealTotals() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.value.filter(m => m.date.slice(0, 10) === todayStr);
  const caloriesEaten = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const proteinEaten = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  return { caloriesEaten, proteinEaten };
}

// Load today's data
async function loadToday() {
  try {
    // Load meals first
    await fetchMeals();

    // Get backend today data
    const res = await dashboardService.getToday();
    const data = res.data;

    // Merge with meals totals
    const mealTotals = computeMealTotals();
    data.caloriesEaten = mealTotals.caloriesEaten;
    data.proteinEaten = mealTotals.proteinEaten;

    // Compute progress
    const goals = data.goals || { calories: 0, protein: 0, workoutMinutes: 0 };
    data.progress = {
      calories: goals.calories ? Math.round((data.caloriesEaten / goals.calories) * 100) : 0,
      protein: goals.protein ? Math.round((data.proteinEaten / goals.protein) * 100) : 0,
      workoutMinutes: goals.workoutMinutes ? Math.round((data.workoutMinutes / goals.workoutMinutes) * 100) : 0,
    };

    today.value = data;
  } catch (err) {
    console.error(err);
  }
}

// Weekly chart
async function loadWeekly() {
  try {
    const res = await dashboardService.getWeekly();
    weekly.value = res.data.data || res.data;
    meta.value = res.data.meta || {};
    buildChart();
  } catch (err) {
    console.error(err);
  }
}

function buildChart() {
  if (!chartRef.value) return;
  const labels = weekly.value.map(d => d.day.slice(5));
  const burned = weekly.value.map(d => d.burned);
  const eaten = weekly.value.map(d => d.eaten);

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(chartRef.value.getContext("2d"), {
    type: "line",
    data: { labels, datasets: [{ label: "Burned", data: burned }, { label: "Eaten", data: eaten }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } },
  });
}

function avg(key) {
  if (!weekly.value.length) return 0;
  return Math.round(weekly.value.reduce((s, x) => s + (x[key] || 0), 0) / weekly.value.length);
}

// Refresh today after a meal is added
async function onMealAdded() {
  await loadToday();
  await loadWeekly();
}

onMounted(async () => {
  await loadToday();
  await loadWeekly();
});

watch(weekly, () => buildChart(), { deep: true });
</script>

<style scoped>
.display-6 { font-size: 1.8rem; }
</style>
