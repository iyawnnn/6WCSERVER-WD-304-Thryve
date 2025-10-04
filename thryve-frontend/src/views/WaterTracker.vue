<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
        <i class="bi bi-layout-sidebar"></i>
      </button>
      <div class="separator"></div>
      <span class="page-title">Water Tracker</span>
    </div>

    <div class="dashboard-body">
      <div class="grid-layout">
        <!-- Progress Card: Shows today's progress and milestones -->
        <div class="card progress-card">
          <apexchart
            type="radialBar"
            :height="radialHeight"
            :options="circularOptions"
            :series="[percent]"
          />
          <div class="progress-info">
            <!-- Current intake vs goal -->
            <p class="progress-text">{{ todayWater }} / {{ dailyGoal }} ml</p>

            <!-- Milestone badges (25%, 50%, etc.) -->
            <div class="milestones">
              <span :class="{ active: percent >= 25 }">25%</span>
              <span :class="{ active: percent >= 50 }">50%</span>
              <span :class="{ active: percent >= 75 }">75%</span>
              <span :class="{ active: percent >= 100 }">100%</span>
            </div>

            <!-- Feedback message based on progress -->
            <p class="feedback">{{ feedbackText }}</p>
          </div>
        </div>

        <!-- Actions Card: Add, reset, and quick buttons -->
        <div class="card actions-card">
          <h3 class="add-water-heading">Add Water</h3>

          <!-- Quick buttons for 1 or 2 cups -->
          <div class="quick-buttons full-width">
            <button class="btn-water quick-btn" @click="logWaterCups(1)">
              +1 cup
            </button>
            <button class="btn-water quick-btn" @click="logWaterCups(2)">
              +2 cups
            </button>
          </div>

          <!-- Custom input row: Add custom ml + reset -->
          <div class="custom-input-row">
            <input
              type="number"
              v-model.number="customAmount"
              placeholder="Enter ml"
            />
            <button class="btn-water add-btn" @click="logWaterCustom">
              Add
            </button>
            <button class="btn-water reset-btn" @click="showResetModal = true">
              Reset
            </button>
          </div>

          <!-- Recent log history -->
          <div class="water-log">
            <h4>Recent Logs</h4>
            <ul v-if="logHistory.length > 0">
              <li
                v-for="(log, index) in logHistory.slice(-4).reverse()"
                :key="index"
              >
                {{ log.time }} - {{ log.amount }}ml
                <span class="percent-badge">{{ log.percent }}%</span>
              </li>
            </ul>
            <div v-else class="no-logs">No Recent Logs</div>
          </div>
        </div>
      </div>

      <!-- Weekly chart (last 7 days bar graph) -->
      <div class="card weekly-card">
        <h3>Last 7 Days</h3>
        <apexchart
          type="bar"
          :height="barHeight"
          :options="weeklyOptions"
          :series="weeklySeries"
        />
      </div>
    </div>

    <!-- Reset confirmation modal -->
    <div v-if="showResetModal" class="modal-overlay">
      <div class="modal">
        <h3 class="modal-title">Are you sure?</h3>
        <p class="modal-text">This will reset today’s water intake.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showResetModal = false">
            Cancel
          </button>
          <button class="btn-confirm" @click="confirmReset">
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
/* ================================
   Imports & Setup
================================ */
import { ref, computed, onMounted } from "vue";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
import ApexCharts from "vue3-apexcharts";
import api from "../utils/api";
import { useToast } from "primevue/usetoast";

const toast = useToast();

/* ================================
   State & Refs
================================ */
const todayWater = ref(0); // Current water intake for today
const dailyGoal = ref(2000); // Default daily goal (ml)
const weeklyLogs = ref([]); // Stores 7-day logs
const customAmount = ref(null); // For custom input value
const cupMl = 250; // Fixed ml per "cup"
const logHistory = ref([]); // Stores today's log history

const totalGlasses = ref(0); // Track glasses for achievements
const achievementsCompleted = ref(new Set()); // Unlocked achievements
const showResetModal = ref(false); // Modal visibility

/* ================================
   Computed Properties
================================ */
const percent = computed(() =>
  Math.min(Math.round((todayWater.value / dailyGoal.value) * 100), 100)
);

const feedbackText = computed(() => {
  if (percent.value >= 100) return "Goal Achieved!";
  if (percent.value >= 75) return "Almost there!";
  if (percent.value >= 50) return "Keep going!";
  return "Keep Drinking!";
});

const radialHeight = ref(250); // Radial chart size
const barHeight = ref(220); // Bar chart size

const circularOptions = computed(() => ({
  chart: {
    type: "radialBar",
    animations: { enabled: true },
    toolbar: { show: false },
  },
  plotOptions: {
    radialBar: {
      hollow: { size: "60%" },
      dataLabels: { show: false },
      track: { background: "var(--muted)" },
    },
  },
  fill: { colors: ["var(--primary)"] },
}));

const weeklySeries = computed(() => [
  { name: "Water (ml)", data: weeklyLogs.value.map((log) => log.amount) },
]);

const weeklyOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: { categories: weeklyLogs.value.map((log) => log.date) },
  plotOptions: { bar: { borderRadius: 8, columnWidth: "55%" } },
  stroke: { show: true, width: 2, colors: ["transparent"] },
  dataLabels: { enabled: false },
  grid: { strokeDashArray: 4 },
  colors: ["var(--primary)"],
}));

/* ================================
   Utility Functions
================================ */
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(5, 10));
  }
  return days;
}

// Fetch today's log from backend
async function fetchLogs() {
  try {
    const res = await api.get("/water");
    const todayLog = res.data;

    if (todayLog && todayLog.entries) {
      logHistory.value = todayLog.entries.map((entry) => {
        const perc = Math.min(
          Math.round((entry.amount / dailyGoal.value) * 100),
          100
        );
        return { time: entry.time, amount: entry.amount, percent: perc };
      });
    } else {
      logHistory.value = [];
    }
  } catch (err) {
    console.error("Failed to fetch water logs:", err);
    logHistory.value = [];
  }
}

/* ================================
   Lifecycle
================================ */
onMounted(async () => {
  await fetchWeekly();
  await fetchLogs();
  updateChartSizes();
  window.addEventListener("resize", updateChartSizes);
});

/* ================================
   API & Logging Functions
================================ */
async function fetchWeekly() {
  try {
    const res = await api.get("/water/weekly");
    const logs = res.data || [];
    const logMap = {};
    logs.forEach((log) => {
      logMap[log.date.slice(5, 10)] = log.amount;
    });

    const last7Days = getLast7Days();
    weeklyLogs.value = last7Days.map((date) => ({
      date,
      amount: logMap[date] || 0,
    }));

    const today = new Date().toISOString().slice(5, 10);
    const todayLog = weeklyLogs.value.find((log) => log.date === today);
    todayWater.value = todayLog ? todayLog.amount : 0;
  } catch (err) {
    console.error(err);
  }
}

// Add water
async function logWater(amount) {
  const today = new Date().toISOString().slice(5, 10);
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const perc = Math.min(
    Math.round(((todayWater.value + amount) / dailyGoal.value) * 100),
    100
  );

  // Optimistically update UI
  todayWater.value += amount;
  logHistory.value.push({ time, amount, percent: perc });

  const index = weeklyLogs.value.findIndex((log) => log.date === today);
  if (index !== -1) weeklyLogs.value[index].amount += amount;

  totalGlasses.value += Math.round(amount / cupMl);
  checkAchievements();

  // Post to backend asynchronously (don't await)
  api
    .post("/water", { amount })
    .catch(() => console.warn("Failed to log water"));

  toast.add({
    severity: "success",
    summary: "Water Added",
    detail: `${amount} ml added!`,
    life: 2500,
  });
}

function logWaterCups(cups) {
  logWater(cups * cupMl);
}

function logWaterCustom() {
  if (!customAmount.value || customAmount.value <= 0) {
    return toast.add({
      severity: "warn",
      summary: "Invalid Input",
      detail: "Enter a valid amount of water.",
      life: 2500,
    });
  }
  logWater(customAmount.value);
  customAmount.value = null;
}

async function confirmReset() {
  try {
    await api.post("/water/reset");
  } catch {
    console.warn("Backend /water/reset missing, skipping API.");
  }

  todayWater.value = 0;
  customAmount.value = null;
  logHistory.value = [];

  const today = new Date().toISOString().slice(5, 10);
  const index = weeklyLogs.value.findIndex((log) => log.date === today);
  if (index !== -1) {
    weeklyLogs.value[index].amount = 0;
    weeklyLogs.value = [...weeklyLogs.value];
  }

  await fetchLogs();

  toast.add({
    severity: "info",
    summary: "Reset Complete",
    detail: "Today's water intake has been reset.",
    life: 2500,
  });
  showResetModal.value = false;
}

function checkAchievements() {
  if (totalGlasses.value >= 5 && !achievementsCompleted.value.has("novice")) {
    achievementsCompleted.value.add("novice");
  }
  if (totalGlasses.value >= 20 && !achievementsCompleted.value.has("expert")) {
    achievementsCompleted.value.add("expert");
  }
}

function updateChartSizes() {
  const width = window.innerWidth;
  radialHeight.value = width < 480 ? 180 : 250;
  barHeight.value = width < 480 ? 180 : 220;
}
</script>

<style scoped>
.dashboard-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--background);
  width: 100%;
  margin: 0 auto;
}

/* Grid */
.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
  align-items: stretch;
}

/* Card */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  min-width: 0;
  height: 100%;
}

/* Progress info */
.progress-info {
  text-align: center;
  margin-top: 1rem;
}

.progress-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary);
}
.milestones {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}
.milestones span {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  background: var(--muted);
  color: var(--muted-foreground);
  white-space: nowrap;
}
.milestones span.active {
  background: var(--primary);
  color: var(--primary-foreground);
}
.feedback {
  font-size: 0.95rem;
  color: var(--secondary-foreground);
  margin-top: 0.5rem;
}

/* Actions Card */
.actions-card h3 {
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: var(--primary);
  text-align: center;
}
.quick-buttons.full-width {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
  justify-content: center;
}

/* Buttons */
.btn-water {
  padding: 0.7rem;
  font-weight: 600;
  font-size: clamp(0.8rem, 1vw, 0.95rem);
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  background-color: var(--primary);
  color: var(--secondary);
}

.btn-water:hover {
  background-color: var(--primary-hover);
}

.quick-btn {
  flex: 1;
  min-width: 0;
}
.add-btn {
  background-color: var(--primary);
  color: var(--primary-foreground);
}
.add-btn:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  background-color: var(--primary-hover);
}
.reset-btn {
  background-color: #7c7979;
  color: var(--primary-foreground);
}
.reset-btn:hover {
  background-color: #beb5b5;
}

/* Custom Input Row */
.custom-input-row input:focus::placeholder {
  opacity: 0;
}

.custom-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.custom-input-row input {
  flex: 1;
  padding: 0.65rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  font-size: 0.95rem;
  text-align: center;
  color: var(--foreground);
  background: var(--background);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  min-width: 90px;
}
.custom-input-row .btn-water {
  flex: 0 0 auto;
  min-width: 70px;
  font-size: clamp(0.75rem, 1vw, 0.9rem);
  padding: 0.65rem;
}

.custom-input-row input::-webkit-outer-spin-button,
.custom-input-row input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.custom-input-row input[type="number"] {
  -moz-appearance: textfield;
}

/* Logs */
.no-logs {
  text-align: center;
  color: var(--light-dark);
  font-size: 1.25rem;
  padding: 1rem 0;
  justify-content: center;
  align-items: center;
}
.water-log h4 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  color: var(--secondary-hover);
  text-align: center;
  margin-top: 2rem;
  min-height: 65px;
}
.water-log ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 140px;
  overflow-y: auto;
}
.water-log li {
  padding: 0.4rem 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed var(--border);
  font-size: 0.9rem;
}
.percent-badge {
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius);
  white-space: nowrap;
}

/* Weekly chart */
.weekly-card {
  margin-top: 1.5rem;
  width: 100%;
}
.weekly-card h3 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Modal */
.modal * {
  font-family: "Poppins", Arial, sans-serif;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}
.modal {
  background: #fff;
  color: #000;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-title {
  margin-bottom: 0.5rem;
  font-size: 1.4rem;
  font-weight: bold;
}
.modal-text {
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: var(--light-dark);
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-cancel,
.btn-confirm {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.btn-cancel {
  background: #444;
  color: #fff;
}
.btn-cancel:hover {
  background: #666;
}
.btn-confirm {
  background: #000;
  color: #fff;
}
.btn-confirm:hover {
  background: var(--primary-hover);
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-body {
    padding: 1rem;
  }
  .grid-layout {
    grid-template-columns: 1fr;
  }

  .no-logs {
    padding-bottom: 3rem;
  }
}

@media (max-width: 500px) {
  .dashboard-body {
    padding: 0.5rem;
  }

  .weekly-card {
    padding-bottom: 0;
  }

  .progress-text {
    font-size: 1.1rem;
  }

  .milestones span {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }

  .feedback {
    font-size: 0.85rem;
  }

  .btn-water {
    font-size: 0.85rem;
    padding: 0.55rem;
  }

  .custom-input-row {
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 0.3rem;
  }

  .custom-input-row input {
    flex: 1;
    min-width: 0;
    font-size: 0.8rem;
    padding: 0.5rem;
  }

  .custom-input-row .btn-water {
    flex: 0 0 auto;
    min-width: 60px;
    font-size: 0.75rem;
    padding: 0.5rem;
  }

  apexchart {
    max-width: 100% !important;
  }
}
</style>
