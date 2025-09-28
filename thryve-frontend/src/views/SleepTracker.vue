<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
        <i class="bi bi-layout-sidebar"></i>
      </button>

      <div class="separator"></div>
      <span class="page-title">Sleep Tracker</span>
    </div>

    <div class="dashboard-body">
      <!-- Today's Sleep Circular Progress -->
      <div class="daily-progress" v-if="todayLog">
        <apexchart
          type="radialBar"
          height="250"
          :options="circularOptions"
          :series="[todayPercent]"
        />
        <p class="progress-text">
          {{ (todayLog.duration / 60).toFixed(1) }} / {{ dailyGoal }} hrs
        </p>
        <p class="feedback">{{ feedbackText }}</p>
      </div>

      <!-- Sleep Logging Form -->
      <div class="sleep-form">
        <label>Date:</label>
        <input type="date" v-model="sleepDate" :max="todayString" />

        <label>Bedtime:</label>
        <input type="time" v-model="bedTime" />

        <label>Wake Time:</label>
        <input type="time" v-model="wakeTime" />

        <p v-if="bedTime && wakeTime">Duration: {{ computedDuration }} hrs</p>

        <button @click="addSleepLog">Add Sleep Log</button>
      </div>

      <!-- Weekly Sleep Chart -->
      <h3>Last 7 Days</h3>
      <apexchart
        type="line"
        height="250"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ApexCharts from "vue3-apexcharts";
import api from "../utils/api";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";

const sleepDate = ref(new Date().toISOString().slice(0, 10));
const bedTime = ref(null);
const wakeTime = ref(null);
const todayLog = ref(null);
const weeklyLogs = ref([]);
const dailyGoal = ref(8); // hours
const apexchart = ApexCharts;

// Computed
const todayString = computed(() => new Date().toISOString().slice(0, 10));

const computedDuration = computed(() => {
  if (!bedTime.value || !wakeTime.value) return 0;
  const [bH, bM] = bedTime.value.split(":").map(Number);
  const [wH, wM] = wakeTime.value.split(":").map(Number);
  let duration = wH * 60 + wM - (bH * 60 + bM);
  if (duration <= 0) duration += 24 * 60;
  return (duration / 60).toFixed(1);
});

const todayPercent = computed(() => {
  if (!todayLog.value) return 0;
  const hours = todayLog.value.duration / 60;
  return Math.min(Math.round((hours / dailyGoal.value) * 100), 100);
});

const feedbackText = computed(() => {
  if (todayPercent.value >= 100) return "Goal Achieved!";
  if (todayPercent.value >= 50) return "Keep going!";
  return "💤 Keep sleeping!";
});

const circularOptions = computed(() => ({
  chart: { type: "radialBar", animations: { enabled: true } },
  plotOptions: {
    radialBar: {
      hollow: { size: "60%" },
      dataLabels: { show: false },
      track: { background: "#e0f0ff" },
    },
  },
  fill: { colors: ["#7b5cf5"] },
}));

const chartSeries = computed(() => [
  {
    name: "Sleep Duration (hrs)",
    data: weeklyLogs.value.map((l) => (l.duration / 60).toFixed(1)),
  },
]);

const chartOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: { categories: weeklyLogs.value.map((l) => l.date.slice(5)) },
  yaxis: { min: 0, max: 12 },
  stroke: { curve: "smooth" },
  tooltip: { y: { formatter: (val) => `${val} hrs` } },
}));

// Methods
const fetchToday = async () => {
  try {
    const res = await api.get("/sleep/today");
    todayLog.value = res.data || {
      duration: 0,
      date: new Date().toISOString(),
    };
  } catch (err) {
    console.error(err);
  }
};

const fetchWeekly = async () => {
  try {
    const res = await api.get("/sleep/weekly");
    const logs = res.data || [];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = logs.find((l) => l.date.slice(0, 10) === key);
      last7Days.push(found || { date: key, duration: 0 });
    }
    weeklyLogs.value = last7Days;
  } catch (err) {
    console.error(err);
  }
};

const addSleepLog = async () => {
  if (!bedTime.value || !wakeTime.value || !sleepDate.value)
    return alert("Enter all fields");

  try {
    const bedDate = new Date(`${sleepDate.value}T${bedTime.value}`);
    const wakeDate = new Date(`${sleepDate.value}T${wakeTime.value}`);
    if (wakeDate <= bedDate) wakeDate.setDate(wakeDate.getDate() + 1);

    const duration = (wakeDate - bedDate) / (1000 * 60); // minutes

    await api.post("/sleep", {
      date: sleepDate.value,
      bedTime: bedDate,
      wakeTime: wakeDate,
      duration,
    });

    bedTime.value = wakeTime.value = null;
    await fetchToday();
    await fetchWeekly();
  } catch (err) {
    console.error(err);
    alert("Failed to log sleep");
  }
};

// Lifecycle
onMounted(async () => {
  await fetchToday();
  await fetchWeekly();
});
</script>

<style scoped>
.sleep-tracker {
  margin: auto;
  padding: 20px;
  text-align: center;
}

.daily-progress {
  margin-bottom: 20px;
  position: relative;
}

.progress-text {
  margin-top: -135px;
  font-weight: bold;
  font-size: 1.2rem;
}

.feedback {
  margin-top: 7rem;
  font-weight: 500;
  color: #7b5cf5;
}

.sleep-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.sleep-form input {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.sleep-form button {
  padding: 10px;
  background: #7b5cf5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.sleep-form button:hover {
  background: #5a3adf;
}
</style>
