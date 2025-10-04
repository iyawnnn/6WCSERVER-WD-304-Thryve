<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
        <i class="bi bi-layout-sidebar"></i>
      </button>
      <div class="separator"></div>
      <span class="page-title">Workout</span>
    </div>

    <!-- Grid Layout -->
    <div class="grid-layout">
      <!-- Left side: Form + History -->
      <div class="left-panel">
        <section class="card form-container">
          <WorkoutForm />
        </section>

        <section class="card">
          <WorkoutHistory />
        </section>

        <section class="mobilecard form-page">
          <MobileWorkoutForm />       
        </section>
        
        <section class="mobilecard">
          <mobileWorkoutHistory />       
        </section>
      </div>

      <!-- Right side: Summary + Analytics -->
      <div class="right-panel">
        <section class="card">

          <div class="summary-cards">
            <div class="summary-box">
              <p>Total Workouts</p>
              <h3>{{ totalWorkouts }}</h3>
            </div>
            <div class="summary-box">
              <p>Total Duration</p>
              <h3>{{ totalDuration }} min</h3>
            </div>
            <div class="summary-box full-width">
              <p>Total Calories</p>
              <h3>{{ totalCalories }} cal</h3>
            </div>
          </div>
        </section>

        <section class="card analytics-card">
          <h4>Analytics</h4>
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </section>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch, onUnmounted } from "vue";
import Chart from "chart.js/auto";
import WorkoutForm from "../components/WorkoutForm.vue";
import MobileWorkoutForm from "../components/mobileWorkoutForm.vue";
import WorkoutHistory from "../components/WorkoutHistory.vue";
import mobileWorkoutHistory from "../components/mobileWorkoutHistory.vue";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
import { workouts, fetchWorkouts } from "../composables/useWorkouts.js";

const chartCanvas = ref(null);
let chartInstance = null;

// Summary
const totalWorkouts = computed(() => workouts.value.length);
const totalDuration = computed(() =>
  workouts.value.reduce((sum, w) => sum + (Number(w.duration) || 0), 0)
);
const totalCalories = computed(() =>
  workouts.value.reduce((sum, w) => sum + (Number(w.calories) || 0), 0)
);

// Helpers
const parseDateSafe = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  if (!isNaN(d)) return d;
  // try YYYY-MM-DD fallback
  const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  return null;
};


const buildChartData = (items) => {
  const today = new Date();
  const last7Days = [];

  // Generate last 7 days labels in "Month Day" format
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last7Days.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
  }

  // Map calories per day
  const caloriesMap = {};
  items.forEach((w) => {
    const d = parseDateSafe(w.date);
    if (!d) return;
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    caloriesMap[label] = (caloriesMap[label] || 0) + (Number(w.calories) || 0);
  });

  // Fill data for each of last 7 days, 0 if no log
  const data = last7Days.map((label) => caloriesMap[label] || 0);

  return { labels: last7Days, data };
};

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};

const createChart = () => {
  if (!chartCanvas.value) return;
  
  // Destroy existing chart before creating a new one
  destroyChart();
  
  const ctx = chartCanvas.value.getContext("2d");
  const { labels, data } = buildChartData(workouts.value);
  
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Calories Burned",
          data,
          backgroundColor: "#000",
        },
      ],
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
  });
};

const updateChart = () => {
  if (!chartInstance) {
    createChart();
    return;
  }
  
  const { labels, data } = buildChartData(workouts.value);
  chartInstance.data.labels = labels;
  chartInstance.data.datasets[0].data = data;
  chartInstance.update();
};

onMounted(async () => {
  // make sure we have initial workouts
  try {
    await fetchWorkouts();
  } catch (e) {
    console.warn("fetchWorkouts failed on mounted:", e);
  }
  createChart();
});

// rebuild chart when workouts change
watch(
  workouts,
  () => {
    try {
      updateChart();
    } catch (err) {
      console.error("Chart update failed:", err);
      // If update fails, recreate the chart completely
      createChart();
    }
  },
  { deep: true }
);

onUnmounted(() => {
  destroyChart();
});
</script>

<style scoped>
h4 {
  font-size:1.5rem;
  margin-bottom:1rem;
}

.grid-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: white;
  padding: 1.25rem;
  border-radius: var(--radius);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.summary-cards {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.summary-box.full-width {
  grid-column: span 2;
}

.summary-box {
  background: var(--muted);
  padding: 1rem;
  border-radius: var(--radius);
  text-align: center;
}

.summary-box h3 {
  margin: 0.25rem 0 0;
  font-size: 1.25rem;
}

.analytics-card {
  height: 350px;
  display: flex;
  flex-direction: column;
}

.chart-container {
  flex: 1;
  position: relative;
  height: 100%;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Ensure WorkoutForm fills the card without overflow */
.form-container {
  width: 100%;
  max-width: 100%; /* prevent overflow */
  overflow: hidden; /* cut off any stray overflow */
}

.form-container form {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Fix grid inside the form so it scales properly */
.form-container .form-grid {
  width: 100%;
  max-width: 100%;
}

.mobilecard{
  display: none;
}

/* phone */
@media (max-width: 767px) {
   .grid-layout {
    grid-template-columns: 1fr; 
  }

  .card{
    display: none;
  }

  .mobilecard {
    display: block; 
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .mobilecard{
    display: none;
  }

   .grid-layout {
    display: flex;         /* or grid */
    flex-direction: column; /* stack vertically */
  }

  .left-panel,
  .right-panel {
    width: 100%;  /* take full width */
  }
}

/* Large screen (up to 1600px) -> stack panels */
@media (max-width: 1600px) {
  .grid-layout {
    display: flex;
    flex-direction: column; 
  }

  .left-panel,
  .right-panel {
    width: 100%; 
  }
}

</style>