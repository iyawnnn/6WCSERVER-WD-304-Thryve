<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import ApexCharts from "vue3-apexcharts";
import api from "../utils/api";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const radialChart = ref(null);

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

// Default form date is today
const sleepDate = ref(today.toISOString().slice(0, 10));

const bedTime = ref("");
const wakeTime = ref("");
const todayLog = ref({ duration: 0 });
const weeklyLogs = ref([]);
const dailyGoal = ref(8);
const isSubmitting = ref(false);
const sleepQuality = ref(0);
const sleepNotes = ref("");
const darkMode = ref(false);
const focusedField = ref(null);

// Helpers
function getSleepDayKey(dateString) {
  return new Date(dateString).toISOString().slice(0, 10);
}

function formatLogDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function toLocalDateString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDisplayDate(bedTimeISO, wakeTimeISO) {
  const wake = new Date(wakeTimeISO);
  return toLocalDateString(wake);
}

// Toast notifications
function triggerNotification(message, type = "success") {
  toast.add({
    severity: type,
    summary: type === "success" ? "Success" : "Error",
    detail: message,
    life: 3000,
  });
}

// Focus management
function setFocusedField(field) {
  focusedField.value = field;
}
function clearFocusedField(field) {
  if (focusedField.value === field) focusedField.value = null;
}

// Computed
const todayString = computed(() => today.toISOString().slice(0, 10));
const yesterdayString = computed(() => yesterday.toISOString().slice(0, 10));

const computedDuration = computed(() => {
  if (!bedTime.value || !wakeTime.value) return 0;
  const [bH, bM] = bedTime.value.split(":").map(Number);
  const [wH, wM] = wakeTime.value.split(":").map(Number);
  let minutes = wH * 60 + wM - (bH * 60 + bM);
  if (minutes < 0) minutes += 24 * 60;
  return (minutes / 60).toFixed(1);
});

const todayPercent = computed(() => {
  const duration = todayLog.value?.duration || 0;
  return Math.min(Math.round((duration / 60 / dailyGoal.value) * 100), 100);
});

const feedbackText = computed(() => {
  if (!todayLog.value || todayLog.value.duration === 0)
    return "Log your sleep to see progress.";
  if (todayPercent.value >= 100) return "Excellent, goal reached!";
  if (todayPercent.value >= 75) return "Great work, almost there.";
  if (todayPercent.value >= 50) return "You're halfway there.";
  return "Keep consistent for better rest.";
});

const weeklyLabels = computed(() => {
  const dayOfWeek = today.getDay(); // Sunday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const labels = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    labels.push({
      date: d,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }
  return labels;
});

const weeklyData = computed(() => {
  return weeklyLabels.value.map((d) => {
    const log = weeklyLogs.value.find(
      (l) => getSleepDayKey(l.displayDate) === getSleepDayKey(d.date)
    );
    return log ? Number(((log.duration || 0) / 60).toFixed(1)) : 0;
  });
});

// Recent logs (combine multiple logs per day)
const recentLogs = computed(() => {
  const dailyMap = {};
  weeklyLogs.value.forEach((log) => {
    const key = getSleepDayKey(log.displayDate);
    if (!dailyMap[key]) dailyMap[key] = { ...log };
    else dailyMap[key].duration += log.duration;
  });

  return Object.values(dailyMap)
    .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate))
    .slice(0, 4);
});

// Weekly average & consistency
const weeklyAverageDuration = computed(() => {
  const valid = weeklyLogs.value.filter((l) => l.duration > 0);
  if (!valid.length) return "0.0";
  const total = valid.reduce((s, l) => s + l.duration, 0);
  return (total / valid.length / 60).toFixed(1);
});

const sleepConsistencyScore = computed(() => {
  if (!weeklyLogs.value.length) return 0;

  const dailyBedTimes = {};
  weeklyLogs.value.forEach((l) => {
    if (!l.bedTime) return;
    const d = new Date(l.bedTime);
    const key = getSleepDayKey(d);
    if (!dailyBedTimes[key] || d < dailyBedTimes[key]) dailyBedTimes[key] = d;
  });

  const bedTimesArray = Object.values(dailyBedTimes);
  if (bedTimesArray.length < 2) return 0;

  const minutes = bedTimesArray.map((d) => d.getHours() * 60 + d.getMinutes());
  const mean = minutes.reduce((a, b) => a + b, 0) / minutes.length;
  const std = Math.sqrt(
    minutes.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) / minutes.length
  );

  return Math.max(0, Math.min(100, Math.round(100 - (std / 180) * 100)));
});

// ApexCharts options
const circularOptions = computed(() => ({
  chart: { type: "radialBar", sparkline: { enabled: true }, foreColor: darkMode.value ? "#f9fafb" : "#111827", animations: { enabled: true, easing: "easeinout", speed: 800 } },
  plotOptions: { radialBar: { hollow: { size: "70%" }, track: { background: darkMode.value ? "#374151" : "#e5e7eb", strokeWidth: "100%" }, dataLabels: { show: false } } },
  fill: { colors: [darkMode.value ? "#60a5fa" : "#000000"] },
  stroke: { lineCap: "round", width: 3 },
  labels: ["Progress"],
}));

const chartSeries = computed(() => [{ name: "Sleep (hrs)", data: weeklyData.value }]);
const chartOptions = computed(() => ({
  chart: { toolbar: { show: false }, animations: { enabled: true }, foreColor: darkMode.value ? "#f9fafb" : "#111827" },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2, colors: ["#000000"] },
  markers: { size: 0, hover: { size: 6, fillColor: "#000000", strokeColor: "#000000", strokeWidth: 2 } },
  fill: { type: "gradient", gradient: { shade: "dark", type: "vertical", gradientToColors: ["#1f2937"], shadeIntensity: 1, inverseColors: false, opacityFrom: 0.2, opacityTo: 0.1, stops: [0, 100] } },
  xaxis: { categories: weeklyLabels.value.map((d) => d.label), labels: { style: { colors: darkMode.value ? "#9ca3af" : "#6b7280", fontSize: "12px" } } },
  yaxis: { min: 0, max: 12, tickAmount: 4, labels: { formatter: (v) => `${v}h`, style: { colors: darkMode.value ? "#9ca3af" : "#6b7280" } } },
  tooltip: { theme: darkMode.value ? "dark" : "light", marker: { show: true, fillColors: ["#000000"] }, y: { formatter: (v) => `${v} hrs` } },
  grid: { borderColor: darkMode.value ? "#374151" : "#e5e7eb", strokeDashArray: 4 },
}));

const hasWeeklyData = computed(() =>
  Array.isArray(weeklyLogs.value) && weeklyLogs.value.some((l) => (l.duration || 0) > 0)
);

// Fetch logs
async function fetchToday() {
  try {
    const res = await api.get("/sleep/today");
    todayLog.value = res.data?.duration
      ? { ...res.data, displayDate: getDisplayDate(res.data.bedTime, res.data.wakeTime) }
      : { duration: 0, date: todayString.value, displayDate: todayString.value };
  } catch {
    todayLog.value = { duration: 0, date: todayString.value, displayDate: todayString.value };
  }
}

async function fetchWeekly() {
  try {
    const res = await api.get("/sleep/weekly");
    const logs = res.data || [];
    weeklyLogs.value = logs
      .map((l) => ({ ...l, displayDate: l.displayDate || getDisplayDate(l.bedTime, l.wakeTime) }))
      .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));
  } catch {
    weeklyLogs.value = [];
  }
}

// Add sleep log (combine durations if same day)
async function addSleepLog() {
  if (!bedTime.value || !wakeTime.value) {
    triggerNotification("Please fill in both bed time and wake time.", "error");
    return;
  }

  isSubmitting.value = true;
  try {
    const bedDate = new Date(`${sleepDate.value}T${bedTime.value}`);
    let wakeDate = new Date(`${sleepDate.value}T${wakeTime.value}`);
    if (wakeDate <= bedDate) wakeDate.setDate(wakeDate.getDate() + 1);

    const duration = (wakeDate - bedDate) / (1000 * 60);

    const payload = {
      bedTime: bedDate.toISOString(),
      wakeTime: wakeDate.toISOString(),
      duration,
      quality: sleepQuality.value,
      notes: sleepNotes.value,
    };

    const res = await api.post("/sleep", payload);
    const log = res.data;
    const displayDate = log.displayDate || getDisplayDate(log.bedTime, log.wakeTime);
    log.displayDate = displayDate;

    const existingIndex = weeklyLogs.value.findIndex((l) => l.displayDate === displayDate);
    if (existingIndex > -1) {
      weeklyLogs.value[existingIndex].duration += duration;
    } else {
      weeklyLogs.value.push(log);
    }

    if (displayDate === todayString.value) {
      todayLog.value.duration = (todayLog.value.duration || 0) + duration;
    }

    triggerNotification("Sleep log saved!");
    bedTime.value = "";
    wakeTime.value = "";
    sleepQuality.value = 0;
    sleepNotes.value = "";
  } catch (err) {
    console.error(err);
    triggerNotification("Failed to save sleep log.", "error");
  } finally {
    isSubmitting.value = false;
  }
}

// Sync radial chart
watch(todayPercent, (v) => {
  if (radialChart.value?.updateSeries) {
    try {
      radialChart.value.updateSeries([v]);
    } catch {}
  }
});

// Initial fetch
onMounted(async () => {
  await fetchWeekly();
  await fetchToday();
});
</script>



<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <div class="tracker-shell" :class="{ 'dark-mode': darkMode }">
      <header class="tracker-header">
        <div class="page-header">
          <button @click="toggleSidebar" class="sidebar-toggle">
            <i class="bi bi-layout-sidebar"></i>
          </button>
          <div class="separator"></div>
          <span class="page-title">Sleep Tracker</span>
        </div>
      </header>

      <main class="tracker-main">
        <!-- LEFT COLUMN -->
        <section class="left-column">
          <!-- Today's Progress -->
          <div class="card radial-card">
            <div class="card-head">
              <h3>Today's Progress</h3>
              <span class="pill">Goal: {{ dailyGoal }}h</span>
            </div>
            <div class="card-body radial-body">
              <div v-if="todayLog && todayLog.duration > 0" class="radial-wrap">
                <ApexCharts
                  type="radialBar"
                  height="244"
                  :options="circularOptions"
                  :series="[todayPercent]"
                  ref="radialChart"
                />
                <div class="radial-center">
                  <div class="hours">
                    {{ (todayLog.duration / 60).toFixed(1) }}
                  </div>
                  <div class="unit">hours</div>
                  <div class="goal-text">of {{ dailyGoal }}h goal</div>
                </div>
              </div>
              <div v-else class="radial-wrap">
                <div class="no-data">No sleep logged today</div>
              </div>
              <p class="feedback">{{ feedbackText }}</p>
            </div>
          </div>

          <!-- Add Sleep Form -->
          <div class="card quick-log-card">
            <div class="card-head">
              <h3>Add Sleep</h3>
            </div>

            <div class="card-body">
              <form @submit.prevent="addSleepLog" class="log-form">
                <div class="row two">
                  <div class="form-group">
                    <label>
                      <i class="bi-calendar-event"></i> Sleep Date (Night of)
                    </label>
                    <div class="input-wrapper">
                      <input
                        type="date"
                        v-model="sleepDate"
                        :max="todayString"
                        required
                        @focus="setFocusedField('date')"
                        @blur="clearFocusedField('date')"
                        :class="{ 'input-focused': focusedField === 'date' }"
                      />

                      <i
                        class="bi-calendar-event input-icon"
                        :class="{ 'icon-focused': focusedField === 'date' }"
                      ></i>
                    </div>
                  </div>
                  <div class="form-group">
                    <label><i class="bi-clock"></i> Duration Preview</label>
                    <div class="duration-preview">
                      {{ computedDuration }} hrs
                    </div>
                  </div>
                </div>

                <div class="row two">
                  <div class="form-group time-picker">
                    <label><i class="bi-moon-stars"></i> Bed</label>
                    <div class="input-wrapper">
                      <input
                        type="time"
                        v-model="bedTime"
                        required
                        @focus="setFocusedField('bed')"
                        @blur="clearFocusedField('bed')"
                        :class="{ 'input-focused': focusedField === 'bed' }"
                      />
                      <i
                        class="bi-clock input-icon"
                        :class="{ 'icon-focused': focusedField === 'bed' }"
                      ></i>
                    </div>
                  </div>

                  <div class="form-group time-picker">
                    <label><i class="bi-brightness-high"></i> Wake</label>
                    <div class="input-wrapper">
                      <input
                        type="time"
                        v-model="wakeTime"
                        required
                        @focus="setFocusedField('wake')"
                        @blur="clearFocusedField('wake')"
                        :class="{ 'input-focused': focusedField === 'wake' }"
                      />
                      <i
                        class="bi-clock input-icon"
                        :class="{ 'icon-focused': focusedField === 'wake' }"
                      ></i>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button
                    class="btn-primary add-log-btn"
                    :disabled="isSubmitting"
                  >
                    <span v-if="isSubmitting">Saving...</span>
                    <span v-else><i class="bi-plus-lg"></i> Add Log</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <!-- RIGHT COLUMN -->
        <section class="right-column">
          <!-- Weekly Insights -->
          <div class="card insights-card">
            <div class="card-head"><h3>Weekly Insights</h3></div>
            <div class="card-body">
              <div class="insights-top">
                <div class="insight">
                  <small>Avg Sleep</small>
                  <strong>{{ weeklyAverageDuration }}h</strong>
                </div>
                <div class="insight">
                  <small>Consistency</small>
                  <strong>{{ sleepConsistencyScore }}%</strong>
                </div>
              </div>

              <div class="chart-area">
                <ApexCharts
                  v-if="hasWeeklyData"
                  type="area"
                  height="220"
                  :options="chartOptions"
                  :series="chartSeries"
                />
                <div v-else class="empty">
                  <i class="bi-graph-up-arrow"></i>
                  <p>Log some nights to see trends.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card recent-card">
            <div class="card-head">
              <h3>Recent Activity</h3>
            </div>
            <div class="card-body">
              <ul class="activity-list">
                <li
                  v-if="recentLogs.length === 0"
                  class="activity-item no-logs"
                >
                  No recent activity
                </li>
                <li
                  v-for="logItem in recentLogs"
                  :key="logItem.date"
                  class="activity-item"
                >
                  <div class="left">
                    <div class="date">
                      {{ formatLogDate(logItem.displayDate) }}
                    </div>
                  </div>
                  <div class="right">
                    <div class="duration">
                      {{ (logItem.duration / 60).toFixed(1) }}h
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Toast />
    </div>
  </DefaultLayout>
</template>

<style scoped>
.input-icon {
  margin-top: -8px;
}

.icon-btn {
  background: none;
  box-shadow: none;
}

input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
  z-index: 1;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper input[type="date"],
.input-wrapper input[type="time"] {
  width: 100%;
  padding-right: 2.5rem;
  height: 2.5rem;
  line-height: 2.5rem;
  box-sizing: border-box;
  vertical-align: middle;
  font-size: 1rem;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  padding: 0.55rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  font-family: inherit;
  transition: border-color 0.2s ease;
  margin-bottom: 1rem;
}

.input-focused {
  border-color: #000000 !important;
  border-width: 1px !important;
  outline: none !important;
}

.input-wrapper i {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 1.2rem;
  color: #6b7280;
  transition: color 0.2s ease;
}

.icon-focused {
  color: #000000 !important;
}

.tracker-shell {
  --muted: #6b7280;
  --card: #fff;
  --border: #e5e7eb;
  --accent: #f9fafb;
  --success: #10b981;
  --error: #ef4444;
  min-height: 100vh;
}

.tracker-shell * {
  color: var(--foreground);
}

i {
  padding-right: 0.25rem;
}

label {
  margin-top: 0.5rem;
}

.tracker-shell .subtitle,
.tracker-shell .pill,
.tracker-shell small,
.tracker-shell .notes {
  color: var(--muted) !important;
}

.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--foreground);
  font-size: 1.05rem;
  transition: background-color 0.2s ease;
}

.sidebar-toggle:hover {
  background: var(--accent);
}

.separator {
  width: 1px;
  height: 1.5rem;
  background: var(--border);
}

.page-title {
  font-size: 1.25rem;
  letter-spacing: -0.2px;
  color: var(--foreground) !important;
  font-weight: 600;
}

.right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.goal-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.goal-control label {
  color: var(--foreground);
  font-weight: 500;
}

.goal-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.goal-input input[type="range"] {
  flex: 1;
  background: var(--accent);
  border-radius: 10px;
  height: 6px;
}

.goal-value {
  width: 40px;
  text-align: right;
  flex-shrink: 0;
  font-weight: 600;
  color: var(--foreground) !important;
}

.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: opacity 0.2s ease;
  margin-top: 0.25rem;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary.add-log-btn {
  background: #fff;
  border: 1px solid #000;
  color: #000;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 1rem;
}

.btn-primary.add-log-btn i {
  color: inherit; 
}

.save-btn {
  background: #000;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: "Geist", "Poppins", sans-serif;
}

.save-btn:hover {
  background: #333;
}

.btn-ghost {
  background: #fff;
  color: #000;
  border: 1px solid #000;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: "Geist", "Poppins", sans-serif;
}

.btn-ghost:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}
.btn-ghost:hover i {
  color: #fff;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.tracker-main {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 1.25rem;
  align-items: start;
}

.card {
  background: var(--card);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card .card-head,
.card .card-body {
  padding: 1rem 1.1rem;
}

.card .card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.card .card-head h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--foreground) !important;
}

.card .pill {
  font-size: 0.85rem;
  color: var(--muted) !important;
  background: var(--accent);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}

.card.insights-card {
  min-height: 380px;
  margin-bottom: 1rem;
}

.left-column .radial-card {
  margin-bottom: 1rem;
}

.radial-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  position: relative;
  padding-bottom: 1.25rem;
}

.radial-wrap {
  width: 100%;
  max-width: 260px;
  margin: 0 auto;
  position: relative;
}

.no-data {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 1rem;
}

.radial-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.radial-center .hours {
  font-weight: 800;
  font-size: 2.4rem;
  color: var(--foreground) !important;
}

.radial-center .unit {
  font-size: 0.9rem;
  color: var(--muted) !important;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.radial-center .goal-text {
  font-size: 0.75rem;
  color: var(--muted) !important;
  margin-top: 0.25rem;
}

.feedback {
  text-align: center;
  margin: 0.5rem 0;
  color: var(--foreground) !important;
}

.quick-log-card .quick-actions {
  display: flex;
  gap: 0.5rem;
}

.log-form .row.two {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.log-form .form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.log-form label {
  color: var(--foreground) !important;
  font-weight: 500;
  font-size: 0.9rem;
  padding-bottom: 0.45rem;
  padding-left: 0.25rem;
}

.log-form input[type="date"],
.log-form input[type="time"],
.log-form input[type="text"],
.log-form input[type="number"],
.log-form textarea,
.log-form select,
.log-form .duration-preview {
  padding: 0.55rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  font-family: inherit;
  transition: border-color 0.2s ease;
  margin-bottom: 1rem;
  height: 42px;
  box-sizing: border-box;
}

.log-form input[type="date"]:focus,
.log-form input[type="time"]:focus,
.log-form input[type="text"]:focus,
.log-form input[type="number"]:focus,
.log-form textarea:focus,
.log-form select:focus {
  outline: none;
}

.duration-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.log-form input:focus,
.log-form select:focus,
.log-form textarea:focus {
  outline: none;
  border-color: #000000 !important;
}

.insights-top {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  justify-content: space-between;
  width: 100%;
  padding: 0 1rem;
}

.insight small {
  color: var(--muted) !important;
  display: block;
}

.insight strong {
  font-size: 1.25rem;
  color: var(--foreground) !important;
}

.chart-area {
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  text-align: center;
  color: var(--muted) !important;
}

.empty i {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}

.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-height: 400px;
  overflow: auto;
  padding-right: 0.25rem;
  min-height: 235px;
  padding-top: 0.75rem;
}

.activity-item.no-logs {
  color: #6b7280;
  text-align: center;
  font-size: 1.35rem;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem;
  border-radius: 10px;
  background: var(--accent);
  border: 1px solid var(--border);
}

.activity-item .date {
  font-weight: 600;
  color: var(--foreground) !important;
}

.activity-item .notes {
  color: var(--muted) !important;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.activity-item .duration {
  font-weight: 600;
  color: var(--foreground) !important;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: min(500px, 95%);
  background: var(--card);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
}

.modal-head h4 {
  margin: 0;
  color: var(--foreground) !important;
}

.modal-body {
  padding: 1rem;
}

.modal-form .row.two {
  display: flex;
  gap: 0.75rem;
}

.modal-form .form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-form label {
  color: var(--foreground) !important;
  font-weight: 500;
}

.modal-form input,
.modal-form select,
.modal-form textarea {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.55rem;
  color: var(--foreground);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.4;
  box-sizing: border-box;
  width: 100%;
  transition: border-color 0.2s ease;
}

.modal-form input:focus,
.modal-form select:focus,
.modal-form textarea:focus {
  outline: none;
  border-color: #000000 !important;
  border-width: 1px;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* Scrollbar styling */
*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--muted);
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: content-box;
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
}

@media (max-width: 1300px) {
  .tracker-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tracker-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .tracker-header .right {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .modal {
    width: 95%;
  }

  .insights-top {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .tracker-header .page-title {
    font-size: 1.1rem;
  }

  .radial-center .hours {
    font-size: 2rem;
  }

  .radial-center .unit {
    font-size: 0.8rem;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }

  .activity-item .right {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .btn-primary,
  .btn-ghost {
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
    font-family: "Geist", "Poppins", sans-serif;
  }

  .log-form .form-group input,
  .log-form .form-group select {
    font-size: 0.9rem;
    padding: 0.45rem;
  }

  .chart-area {
    min-height: 180px;
  }

  .modal-form .row.two {
    flex-direction: column;
  }
}
</style>