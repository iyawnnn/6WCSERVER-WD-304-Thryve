<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
        <i class="bi bi-layout-sidebar"></i>
      </button>

      <div class="separator"></div>
      <!-- line -->
      <span class="page-title">Water Tracker</span>
    </div>

    <div class="dashboard-body">

      <!-- Daily Circular Progress -->
      <div class="daily-progress">
        <apexchart
          type="radialBar"
          height="250"
          :options="circularOptions"
          :series="[percent]"
        />
        <p class="progress-text">{{ todayWater }} / {{ dailyGoal }} ml</p>
        <p class="feedback">{{ feedbackText }}</p>
      </div>

      <!-- Quick Add Buttons (cups) -->
      <div class="buttons">
        <button @click="logWaterCups(1)">+1 cup</button>
        <button @click="logWaterCups(2)">+2 cups</button>
      </div>

      <!-- Custom Input (ml) -->
      <div class="custom-input">
        <input
          type="number"
          v-model.number="customAmount"
          placeholder="Enter ml"
        />
        <button @click="logWaterCustom">Add</button>
      </div>

      <!-- Weekly Bar Chart -->
      <h3>Last 7 Days</h3>
      <apexchart
        type="bar"
        height="200"
        :options="weeklyOptions"
        :series="weeklySeries"
      />
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
import ApexCharts from "vue3-apexcharts";
import api from "../utils/api";

// State
const todayWater = ref(0);
const dailyGoal = ref(2000);
const weeklyLogs = ref([]);
const customAmount = ref(null);
const cupMl = 250;
const apexchart = ApexCharts;

// Computed
const percent = computed(() =>
  Math.min(Math.round((todayWater.value / dailyGoal.value) * 100), 100)
);

const feedbackText = computed(() => {
  if (percent.value >= 100) return "Goal Achieved!";
  if (percent.value >= 50) return "Keep going!";
  return "Keep drinking!";
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
  fill: { colors: ["#4aa1f3"] },
}));

const weeklySeries = computed(() => [
  {
    name: "Water (ml)",
    data: weeklyLogs.value.map((log) => log.amount),
  },
]);

const weeklyOptions = computed(() => ({
  chart: { animations: { enabled: true }, toolbar: { show: false } },
  xaxis: { categories: weeklyLogs.value.map((log) => log.date) },
  yaxis: { min: 0 },
  plotOptions: { bar: { borderRadius: 6, columnWidth: "40%" } },
  colors: ["#4aa1f3"],
}));

// Methods
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(5, 10));
  }
  return days;
}

async function fetchToday() {
  try {
    const res = await api.get("/water");
    todayWater.value = res.data.amount || 0;
  } catch (err) {
    console.error(err);
  }
}

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
  } catch (err) {
    console.error(err);
  }
}

async function logWater(amount) {
  try {
    const res = await api.post("/water", { amount });
    todayWater.value = res.data.amount || todayWater.value;
    await fetchWeekly();
  } catch (err) {
    console.error(err);
  }
}

function logWaterCups(cups) {
  logWater(cups * cupMl);
}

function logWaterCustom() {
  if (!customAmount.value || customAmount.value <= 0) return alert("Enter valid amount");
  logWater(customAmount.value);
  customAmount.value = null;
}

// Lifecycle
onMounted(async () => {
  await fetchToday();
  await fetchWeekly();
});
</script>


<style scoped>
.water-tracker {
  margin: auto;
  text-align: center;
  padding: 20px;
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
  margin-top: 5rem;
  font-size: 1rem;
  color: #357bc1;
  font-weight: 500;
}

.buttons button,
.custom-input button {
  margin: 5px;
  padding: 10px 20px;
  background: #4aa1f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.buttons button:hover,
.custom-input button:hover {
  background: #357bc1;
}

.custom-input input {
  width: 100px;
  padding: 8px;
  margin-right: 5px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style>
