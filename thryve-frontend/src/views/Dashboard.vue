<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
       <i class="bi bi-layout-sidebar"></i>
      </button>

      <div class="separator"></div>
      <!-- line -->
      <span class="page-title">Dashboard</span>
    </div>

    <div class="dashboard-body">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div
          v-for="card in statCards"
          :key="card.title"
          class="rounded-lg border p-4 shadow-sm bg-card"
        >
          <h6 class="text-sm font-medium">{{ card.title }}</h6>
          <p class="text-2xl font-semibold mt-1">{{ card.value }}</p>
          <p v-if="card.note" class="text-xs text-muted mt-1">
            {{ card.note }}
          </p>
        </div>
      </div>

      <!-- Weekly Chart -->
      <div class="rounded-lg border p-4 shadow-sm bg-card mt-6">
        <div class="flex items-center justify-between">
          <h5 class="text-base font-medium">
            Last 7 days
            <span class="text-muted text-sm">({{ weekStartLabel }})</span>
          </h5>
          <p v-if="weekRange" class="text-xs text-muted">
            Week: {{ weekRange }}
          </p>
        </div>
        <div class="h-72 mt-3">
          <canvas ref="chartRef"></canvas>
        </div>
        <p class="text-xs text-muted mt-2">
          Avg burned: {{ avg("burned") }}, Avg eaten: {{ avg("eaten") }}
        </p>
      </div>

      <!-- Daily Goals -->
      <div class="rounded-lg border p-4 shadow-sm bg-card space-y-3 mt-6">
        <h6 class="text-sm font-medium">Daily Goals</h6>

        <div>
          <label class="block text-xs mb-1">Calories</label>
          <progress
            :value="today.progress.calories"
            max="100"
            class="w-full"
          ></progress>
          <p class="text-xs text-muted">
            {{ today.caloriesEaten }} / {{ today.goals.calories }} kcal ({{
              today.progress.calories
            }}%)
          </p>
        </div>

        <div>
          <label class="block text-xs mb-1">Workout Minutes</label>
          <progress
            :value="today.progress.workoutMinutes"
            max="100"
            class="w-full"
          ></progress>
          <p class="text-xs text-muted">
            {{ today.workoutMinutes }} / {{ today.goals.workoutMinutes }} mins
            ({{ today.progress.workoutMinutes }}%)
          </p>
        </div>

        <div>
          <label class="block text-xs mb-1">Protein</label>
          <progress
            :value="today.progress.protein"
            max="100"
            class="w-full"
          ></progress>
          <p class="text-xs text-muted">
            {{ today.proteinEaten }} / {{ today.goals.protein }} g ({{
              today.progress.protein
            }}%)
          </p>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { getWeekRange } from "../utils/dateHelpers";
import dashboardService from "../services/dashboardService";
import { meals, fetchMeals } from "../composables/useMeals.js";
import { Chart, registerables } from "chart.js";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";

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

// Compute today's totals from meals
function computeMealTotals() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.value.filter(
    (m) => m.date.slice(0, 10) === todayStr
  );
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
      calories: goals.calories
        ? Math.round((data.caloriesEaten / goals.calories) * 100)
        : 0,
      protein: goals.protein
        ? Math.round((data.proteinEaten / goals.protein) * 100)
        : 0,
      workoutMinutes: goals.workoutMinutes
        ? Math.round((data.workoutMinutes / goals.workoutMinutes) * 100)
        : 0,
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
  const labels = weekly.value.map((d) => d.day.slice(5));
  const burned = weekly.value.map((d) => d.burned);
  const eaten = weekly.value.map((d) => d.eaten);

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(chartRef.value.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Burned", data: burned },
        { label: "Eaten", data: eaten },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
    },
  });
}

function avg(key) {
  if (!weekly.value.length) return 0;
  return Math.round(
    weekly.value.reduce((s, x) => s + (x[key] || 0), 0) / weekly.value.length
  );
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

<style scoped></style>
