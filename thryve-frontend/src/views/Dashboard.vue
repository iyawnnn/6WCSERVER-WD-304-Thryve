<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
        <i class="bi bi-layout-sidebar"></i>
      </button>
      <div class="separator"></div>
      <span class="page-title">Dashboard</span>
    </div>

    <div class="dashboard-body">
      <div class="dashboard-cards">
        <!-- Calories Card -->
        <div class="dashboard-card">
          <div class="card-left">
            <div class="card-title-row">
              <h4 class="card-title">Calories</h4>
              <span class="card-sub">Calories Burned</span>
            </div>
            <ul class="card-breakdown">
              <li>
                <i class="bi bi-fork-knife"></i>
                <div class="break-labels">
                  <div class="label">Food</div>
                  <div class="value">{{ todayData.caloriesEaten ?? 0 }}</div>
                </div>
              </li>
              <li>
                <i class="bi bi-fire icon"></i>
                <div class="break-labels">
                  <div class="label">Exercise</div>
                  <div class="value">{{ todayData.caloriesBurned ?? 0 }}</div>
                </div>
              </li>
            </ul>
          </div>
          <div class="card-right">
            <apexchart
              type="radialBar"
              height="160"
              :options="calorieOptions"
              :series="[caloriePercent]"
              class="progress-ring"
            />
            <div class="ring-text">
              <div class="ring-number">{{ todayData.net ?? 0 }}</div>
              <div class="ring-label">Remaining</div>
            </div>
          </div>
        </div>

        <!-- Sleep Card -->
        <div class="dashboard-card">
          <div class="card-left">
            <div class="card-title-row">
              <h4 class="card-title">Sleep</h4>
              <span class="card-sub">Duration vs Goal</span>
            </div>
            <ul class="card-breakdown">
              <li>
                <i class="bi bi-moon-stars icon"></i>
                <div class="break-labels">
                  <div class="label">Slept</div>
                  <div class="value">
                    {{ ((todayData.sleepDuration ?? 0) / 60).toFixed(1) }} hrs
                  </div>
                </div>
              </li>
              <li>
                <i class="bi bi-flag icon"></i>
                <div class="break-labels">
                  <div class="label">Goal</div>
                  <div class="value">8 hrs</div>
                </div>
              </li>
            </ul>
          </div>
          <div class="card-right">
            <apexchart
              type="radialBar"
              height="160"
              :options="sleepOptions"
              :series="[sleepPercent]"
              class="progress-ring"
            />
            <div class="ring-text">
              <div class="ring-number">
                {{ ((todayData.sleepDuration ?? 0) / 60).toFixed(1) }}
              </div>
              <div class="ring-label">hrs</div>
            </div>
          </div>
        </div>

        <!-- Water Card -->
        <div class="dashboard-card">
          <div class="card-left">
            <div class="card-title-row">
              <h4 class="card-title">Water</h4>
              <span class="card-sub">Daily intake</span>
            </div>
            <ul class="card-breakdown">
              <li>
                <i class="bi bi-cup-fill icon"></i>
                <div class="break-labels">
                  <div class="label">Drank</div>
                  <div class="value">{{ todayData.water ?? 0 }} ml</div>
                </div>
              </li>
              <li>
                <i class="bi bi-flag icon"></i>
                <div class="break-labels">
                  <div class="label">Goal</div>
                  <div class="value">2000 ml</div>
                </div>
              </li>
            </ul>
          </div>
          <div class="card-right">
            <apexchart
              type="radialBar"
              height="160"
              :options="waterOptions"
              :series="[waterPercent]"
              class="progress-ring"
            />
            <div class="ring-text">
              <div class="ring-number">{{ todayData.water ?? 0 }}</div>
              <div class="ring-label">ml</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Chart Section -->
      <div class="chart-card">
        <div class="chart-area">
          <canvas ref="chartRef"></canvas>
        </div>
        <p class="muted small">
          Avg burned: {{ avg("burned") }}, Avg eaten: {{ avg("eaten") }}
        </p>
      </div>

      <!-- Daily Goals Section -->
      <div class="card card-plain mt-6">
        <h6>Daily Goals</h6>
        <div class="goals-list">
          <div v-for="goal in dailyGoals" :key="goal.label" class="goal-row">
            <div class="goal-header">
              <i :class="goal.icon" class="goal-icon"></i>
              <div class="goal-texts">
                <div class="goal-label">{{ goal.label }}</div>
                <div class="goal-sub">
                  {{ goal.current }} / {{ goal.max }} {{ goal.unit }}
                </div>
              </div>
            </div>
            <div class="goal-progress">
              <ProgressBar :value="Math.min(goal.progress, 100)" showValue>
                <template #value>
                  <div class="progress-label-wrapper">
                    {{ Math.min(goal.progress, 100) }}%
                  </div>
                </template>
              </ProgressBar>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Chart, registerables } from "chart.js";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
import ProgressBar from "primevue/progressbar";
import VueApexCharts from "vue3-apexcharts";
import dashboardService from "../services/dashboardService";
import { getWeekRange } from "../utils/dateHelpers";
import { meals, fetchMeals } from "../composables/useMeals.js";
import sleepService from "@/services/sleepService";
import waterService from "@/services/waterService";
import { workouts, fetchWorkouts } from "../composables/useWorkouts.js";

Chart.register(...registerables);

const { startLabel: weekStartLabel, endLabel: weekEndLabel } = getWeekRange();
const chartRef = ref(null);
let chartInstance = null;

const today = ref({
  caloriesBurned: 0,
  caloriesEaten: 0,
  net: 0,
  sleepDuration: 0,
  water: 0,
  goals: { calories: 0, protein: 0, workoutMinutes: 0 },
});
const todayData = computed(() => today.value);
const weekly = ref([]);

// ---- Percentages ----
const caloriePercent = computed(() => {
  const net = today.value.net ?? 0;
  const maxGoal = today.value.goals?.calories ?? 2000;
  if (net === 0) return 100;
  const progress = 100 - Math.min((Math.abs(net) / maxGoal) * 100, 100);
  return Math.round(progress);
});

const sleepPercent = computed(() => {
  const mins = today.value.sleepDuration || 0;
  const hours = mins / 60;
  return hours ? Math.min(Math.round((hours / 8) * 100), 100) : 0;
});

const waterPercent = computed(() => {
  const drank = today.value.water || 0;
  return drank ? Math.min(Math.round((drank / 2000) * 100), 100) : 0;
});

// ---- Chart colors ----
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue("--light-dark")
  .trim();
const secondary = getComputedStyle(document.documentElement)
  .getPropertyValue("--ring-2")
  .trim();
let lightDark = getComputedStyle(document.documentElement)
  .getPropertyValue("--light-dark")
  .trim();
lightDark = "hsl(0, 0%, 25%)";

// ---- Radial options ----
const radialBase = (color) => ({
  chart: { sparkline: { enabled: true } },
  plotOptions: {
    radialBar: {
      hollow: { size: "70%" },
      track: { background: "#e9ecef", strokeWidth: "100%" },
      dataLabels: { show: false },
    },
  },
  colors: [color],
  stroke: { lineCap: "round" },
});

const calorieOptions = radialBase(lightDark);
const sleepOptions = radialBase(lightDark);
const waterOptions = radialBase(lightDark);

// ---- Daily Goals ----
const dailyGoals = computed(() => [
  {
    label: "Calories",
    icon: "bi bi-fire",
    color: "#f97316",
    current: today.value.caloriesEaten ?? 0,
    max: today.value.goals?.calories ?? 2000,
    unit: "kcal",
    progress: today.value.caloriesEaten
      ? Math.round(
          ((today.value.caloriesEaten || 0) /
            (today.value.goals?.calories || 2000)) *
            100
        )
      : 0,
  },
  {
    label: "Workout Minutes",
    icon: "bi bi-clock",
    color: "#10b981",
    current: today.value.workoutMinutes ?? 0,
    max: 60,
    unit: "mins",
    progress: today.value.workoutMinutes
      ? Math.round(((today.value.workoutMinutes || 0) / 60) * 100)
      : 0,
  },
  {
    label: "Protein",
    icon: "bi bi-fork-knife",
    color: "#f59e0b",
    current: today.value.proteinEaten ?? 0,
    max: 150,
    unit: "g",
    progress: today.value.proteinEaten
      ? Math.round(((today.value.proteinEaten || 0) / 150) * 100)
      : 0,
  },
]);

// ---- Weekly Chart ----
function buildChart() {
  if (!chartRef.value) return;
  const labels = weekly.value.map((d) => (d.day || "").slice(5));
  const burned = weekly.value.map((d) => d.burned || 0);
  const eaten = weekly.value.map((d) => d.eaten || 0);
  if (chartInstance) chartInstance.destroy();

  const width = window.innerWidth;
  let fontSize = 14;
  if (width <= 480) fontSize = 10;
  else if (width <= 768) fontSize = 10;
  else if (width <= 1024) fontSize = 11;
  else if (width <= 1300) fontSize = 12;

  chartInstance = new Chart(chartRef.value.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Calories Burned",
          data: burned,
          borderColor: primary,
          backgroundColor: primary,
          tension: 0.35,
        },
        {
          label: "Calories Eaten",
          data: eaten,
          borderColor: secondary,
          backgroundColor: secondary,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "var(--foreground)",
            font: { family: "Geist, sans-serif", size: fontSize },
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.85)",
          titleColor: "#fff",
          bodyColor: "#fff",
          titleFont: { family: "Geist, sans-serif", size: fontSize },
          bodyFont: { family: "Geist, sans-serif", size: fontSize },
        },
      },
      scales: {
        y: {
          ticks: {
            color: "var(--foreground)",
            font: { family: "Geist, sans-serif", size: fontSize },
            maxTicksLimit: 5,
          },
          grid: { color: "rgba(108,117,125,0.2)" },
        },
        x: {
          ticks: {
            color: "var(--foreground)",
            font: { family: "Geist, sans-serif", size: fontSize },
          },
          grid: { color: "rgba(108,117,125,0.2)" },
        },
      },
    },
  });
}

window.addEventListener("resize", () => buildChart());

function avg(key) {
  if (!weekly.value.length) return 0;
  return Math.round(
    weekly.value.reduce((s, x) => s + (x[key] || 0), 0) / weekly.value.length
  );
}

// ---- Fetch Today ----
async function loadToday() {
  try {
    await fetchMeals();
    await fetchWorkouts();
    const res = await dashboardService.getToday();
    const data = res.data || {};

    const mealTotals = {
      caloriesEaten: meals.value.reduce((sum, m) => sum + (m.calories || 0), 0),
      proteinEaten: meals.value.reduce((sum, m) => sum + (m.protein || 0), 0),
    };
    const workoutTotals = {
      caloriesBurned: workouts.value.reduce(
        (sum, w) => sum + (w.calories || 0),
        0
      ),
      workoutMinutes: workouts.value.reduce(
        (sum, w) => sum + (w.duration || 0),
        0
      ),
    };

    data.caloriesEaten = data.caloriesEaten ?? mealTotals.caloriesEaten ?? 0;
    data.proteinEaten = data.proteinEaten ?? mealTotals.proteinEaten ?? 0;
    data.caloriesBurned =
      data.caloriesBurned ?? workoutTotals.caloriesBurned ?? 0;
    data.workoutMinutes =
      data.workoutMinutes ?? workoutTotals.workoutMinutes ?? 0;

    data.net =
      (data.goals?.calories ?? 2000) -
      (data.caloriesEaten ?? 0) +
      (data.caloriesBurned ?? 0);

    try {
      const sleepRes = await sleepService.getToday();
      data.sleepDuration = sleepRes.data?.duration ?? 0;
    } catch {
      data.sleepDuration = 0;
    }
    try {
      const waterRes = await waterService.getToday();
      const waterLogs = waterRes.data?.entries || [];
      const totalWater = waterLogs.reduce(
        (sum, entry) => sum + (entry.amount || 0),
        0
      );
      data.water = totalWater;
    } catch {
      data.water = 0;
    }

    data.goals = data.goals ?? {
      calories: 2000,
      protein: 150,
      workoutMinutes: 60,
    };
    today.value = { ...today.value, ...data };
  } catch (err) {
    console.error("loadToday error:", err);
  }
}

// ---- Fetch Weekly ----
async function loadWeekly() {
  try {
    const res = await dashboardService.getWeekly();
    weekly.value = res.data?.data || res.data || [];
    buildChart();
  } catch (err) {
    console.error("loadWeekly error:", err);
  }
}

onMounted(async () => {
  await loadToday();
  await loadWeekly();
});
watch(weekly, () => buildChart(), { deep: true });
</script>

<style scoped>
/* Top-level layout */
.dashboard-cards {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

/* Each card */
.dashboard-card {
  flex: 1 1 calc(33.333% - 1rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  height: 180px;
  min-width: 250px;
}

/* left side (text) */
.card-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.card-sub {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

/* breakdown list */
.card-breakdown {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.card-breakdown li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 1.25rem;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.break-labels .label {
  font-size: 0.85rem;
  color: var(--muted-foreground);
}
.break-labels .value {
  font-weight: 700;
  font-size: 0.95rem;
}

.card-right {
  width: 160px;
  height: 160px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  width: 110px;
}

.ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-number {
  font-size: 1.25rem;
  font-weight: 600;
}
.ring-label {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

/* Chart card */
.chart-card {
  margin-top: 18px;
  padding: 16px;
  padding-top: 5px;
  border-radius: var(--radius);
  background: var(--card);
  border: 1px solid var(--border);
  font-family: "Geist", "Poppins", sans-serif;
  font-weight: 500;
}

/* Chart area */
.chart-area {
  height: 260px;
  margin-top: 12px;
  position: relative;
}

/* Make chart text match theme */
.chart-area canvas {
  color: var(--foreground);
}

/* Daily Goals Card */
.card.card-plain {
  margin-top: 18px;
  padding: 18px;
  border-radius: var(--radius);
  background: var(--card);
  border: 1px solid var(--border);
}

.card.card-plain h6 {
  margin-bottom: 16px;
  font-size: 1.05em;
  font-weight: 600;
  color: var(--foreground);
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.goal-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.goal-icon {
  font-size: 1.1rem;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--muted); /* muted background */
  border-radius: 8px;
  color: hsl(0, 0%, 10%); /* dark icon */
}

.goal-texts {
  display: flex;
  flex-direction: column;
}

.goal-label {
  font-weight: 600;
  font-size: 1rem;
  color: var(--foreground);
}

.goal-progress {
  position: relative;
  width: 100%;
}

.goal-sub {
  font-size: 0.8rem;
  color: var(--muted-foreground);
}

:deep(.p-progressbar-label) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

:deep(.p-progressbar) {
  height: 12px;
  border-radius: 35px;
  background: var(--muted);
  overflow: visible;
}

:deep(.p-progressbar-value) {
  background: var(--light-dark);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 35px;
  transition: width 0.4s ease;
  min-width: 30px;
  position: relative;
}

:deep(.p-progressbar-value .progress-label-wrapper) {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 600;
  white-space: nowrap;
  min-width: 40px;
}

/* push labels of very small percentages to start */
:deep(.p-progressbar-value[style*="width: 0%"]),
:deep(.p-progressbar-value[style*="width: 1%"]),
:deep(.p-progressbar-value[style*="width: 2%"]),
:deep(.p-progressbar-value[style*="width: 3%"]),
:deep(.p-progressbar-value[style*="width: 4%"]),
:deep(.p-progressbar-value[style*="width: 5%"]),
:deep(.p-progressbar-value[style*="width: 6%"]),
:deep(.p-progressbar-value[style*="width: 7%"]),
:deep(.p-progressbar-value[style*="width: 8%"]),
:deep(.p-progressbar-value[style*="width: 9%"]) .progress-label-wrapper {
  left: 4px;
  transform: none;
}

/* utility */
.muted {
  color: var(--muted-foreground);
  text-align: center;
  margin-top: 1rem;
}

.small {
  font-size: 0.85rem;
}

/* Medium screens: reduce card size (≤1300px) */
@media (max-width: 1300px) {
  .dashboard-card {
    flex: 1 1 calc(33.333% - 0.75rem);
    padding: 0.85rem;
    height: 160px;
  }

  .card-right {
    width: 140px;
    height: 140px;
  }

  .progress-ring {
    width: 90px;
  }

  .ring-number {
    font-size: 1.1rem;
  }

  .ring-label {
    font-size: 0.7rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-sub {
    font-size: 0.7rem;
  }

  .break-labels .label {
    font-size: 0.8rem;
  }

  .break-labels .value {
    font-size: 0.85rem;
  }

  .chart-area {
    height: 220px;
  }
  .chart-card .muted.small {
    font-size: 0.85rem;
  }
}

@media (max-width: 1150px) {
  .dashboard-card {
    flex: 1 1 calc(33.333% - 0.75rem);
    padding: 0.85rem;
    height: 160px;
  }

  .card-right {
    width: 140px;
    height: 140px;
  }

  .progress-ring {
    width: 90px;
  }

  .ring-number {
    font-size: 1.1rem;
  }

  .ring-label {
    font-size: 0.7rem;
  }

  .card-title {
    font-size: 0.85rem;
  }

  .card-sub {
    font-size: 0.55rem;
  }

  .break-labels .label {
    font-size: 0.65rem;
  }

  .break-labels .value {
    font-size: 0.7rem;
  }
}

/* Tablet/Laptop: stack cards in 2 per row (≤1024px) */
@media (max-width: 1024px) {
  .dashboard-card {
    flex: 1 1 calc(50% - 1rem);
    height: 150px;
    padding: 0.75rem;
  }

  .card-right {
    width: 120px;
    height: 120px;
  }

  .progress-ring {
    width: 80px;
  }

  .ring-number {
    font-size: 1rem;
  }

  .ring-label {
    font-size: 0.65rem;
  }

  .card-title {
    font-size: 0.95rem;
  }

  .card-sub {
    font-size: 0.65rem;
  }

  .break-labels .label {
    font-size: 0.75rem;
  }

  .break-labels .value {
    font-size: 0.8rem;
  }

  .chart-area {
    height: 200px;
  }
  .chart-card .muted.small {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .dashboard-card {
    flex: 1 1 100%;
    height: 160px;
    flex-direction: row;
    align-items: center;
    padding: 0.5rem 0.75rem;
  }

  .card-title-row {
    flex-direction: column;
  }

  .card-left {
    flex: 1;
    gap: 16px;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-sub {
    font-size: 0.85rem;
  }

  .card-breakdown li {
    gap: 15px;
  }

  .break-labels .label {
    font-size: 0.7rem;
  }

  .break-labels .value {
    font-size: 0.8rem;
  }

  .card-right {
    width: 100px;
    height: 100px;
    position: relative;
  }

  .ring-number {
    font-size: 0.9rem;
  }

  .ring-label {
    font-size: 0.6rem;
  }

  .chart-area {
    height: 180px;
  }
  .chart-card .muted.small {
    font-size: 0.75rem;
  }

  .goal-header {
    gap: 8px;
  }

  .goal-icon {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }

  .goal-label {
    font-size: 0.9rem;
  }

  .goal-sub {
    font-size: 0.7rem;
  }

  :deep(.p-progressbar) {
    height: 14px;
  }

  :deep(.p-progressbar-label) {
    font-size: 0.65rem;
  }
}

@media (max-width: 500px) {
  .chart-area {
    height: 150px;
  }

  .chart-card .muted.small {
    font-size: 0.7rem;
    padding: 0;
  }

  .card.card-plain {
    padding: 12px 10px;
  }

  .goal-header {
    gap: 8px;
  }

  .goal-icon {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }

  .goal-label {
    font-size: 0.95rem;
  }

  .goal-sub {
    font-size: 0.75rem;
  }

  :deep(.p-progressbar) {
    height: 16px;
  }

  :deep(.p-progressbar-label) {
    font-size: 0.7rem;
  }

  :deep(.p-progressbar-value .progress-label-wrapper) {
    font-size: 0.7rem;
    min-width: 50px;
  }
}
</style>
