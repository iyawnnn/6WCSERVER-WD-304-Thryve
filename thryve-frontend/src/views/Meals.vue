<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
        <i class="bi bi-layout-sidebar"></i>
      </button>
      <div class="separator"></div>
      <span class="page-title">Meal</span>
    </div>

    <!-- Grid Layout -->
    <div class="grid-layout">
      <!-- Left side: Form + History -->
      <div class="left-panel">
        <section class="card">
          <MealForm />
        </section>

        <section class="card">
          <MealHistory />
        </section>
      </div>

      <!-- Right side: Summary + Analytics -->
      <div class="right-panel">
        <section class="card">
          <div class="summary-cards">
            <div class="summary-box">
              <p>Total Meals</p>
              <h3>{{ totalMeals }}</h3>
            </div>
            <div class="summary-box">
              <p>Total Calories</p>
              <h3>{{ totalCalories }} cal</h3>
            </div>
            <div class="summary-box full-width">
              <p>Total Protein</p>
              <h3>{{ totalProtein }} g</h3>
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

    <!-- RESPONSIVE MOBILE -->
    <div class="meal-page">

    <!-- Mobile version -->
    <MobileMealForm class="mobile-form" @mealAdded="onMealAdded" />
  </div>

  <MobileMealHistory class="mobile-form" @mealAdded="onMealAdded" />


  </DefaultLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch, onUnmounted } from "vue";
import Chart from "chart.js/auto";
import MealForm from "../components/MealForm.vue";
import MealHistory from "../components/MealHistory.vue";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
import { meals, fetchMeals } from "../composables/useMeals.js";
import MobileMealForm from "../components/mobileMealForm.vue";
import MobileMealHistory from "../components/mobileMealHistory.vue";


const onMealAdded = () => {
  // refresh meals, update list, etc.
};

const chartCanvas = ref(null);
let chartInstance = null;

// Summary
const totalMeals = computed(() => meals.value.length);
const totalCalories = computed(() =>
  meals.value.reduce((sum, m) => sum + (Number(m.calories) || 0), 0)
);
const totalProtein = computed(() =>
  meals.value.reduce((sum, m) => sum + (Number(m.protein) || 0), 0)
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

  // Build last 7 days labels
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Format: "Month Day" (e.g., "Oct 4")
    last7Days.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
  }

  // Map calories per day
  const caloriesMap = {};
  items.forEach((m) => {
    const d = parseDateSafe(m.date);
    if (!d) return;
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    caloriesMap[label] = (caloriesMap[label] || 0) + (Number(m.calories) || 0);
  });

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
  destroyChart();
  const ctx = chartCanvas.value.getContext("2d");
  const { labels, data } = buildChartData(meals.value);

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Calories Consumed",
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
  const { labels, data } = buildChartData(meals.value);
  chartInstance.data.labels = labels;
  chartInstance.data.datasets[0].data = data;
  chartInstance.update();
};

onMounted(async () => {
  try {
    await fetchMeals();
  } catch (e) {
    console.warn("fetchMeals failed on mounted:", e);
  }
  createChart();
});

watch(
  meals,
  () => {
    try {
      updateChart();
    } catch (err) {
      console.error("Chart update failed:", err);
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
  margin-bottom:0.75rem;
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

.mobile-form {
  display: none;
}

/* On small screens: show mobile, hide desktop */
@media (max-width: 768px) {
  .card {
    display: none;
  }
  .desktop-form {
    display: none;
  }
  .mobile-form {
    display: block;
  }
}

@media (min-width: 768px) and (max-width: 1600px) {
  .mobilecard{
    display: none;
  }

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