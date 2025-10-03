<script setup>
import { ref, computed, onMounted } from "vue";
import { meals, fetchMeals, deleteMeal as deleteMealApi } from "../composables/useMeals.js";
import MealEditModal from "./MealEditModal.vue";

const editingMeal = ref(null);
const deleteTarget = ref(null);
const deleteDialogVisible = ref(false);
const isDeleting = ref(false);
const deletingRows = ref(new Set());

const sortedMeals = computed(() => {
  return [...meals.value].sort((a, b) => {
    const da = new Date(a.date || 0);
    const db = new Date(b.date || 0);
    return db.getTime() - da.getTime();
  });
});

const formatDate = (dateString) => {
  if (!dateString) return "No Date";
  try {
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toLocaleDateString();
  } catch {
    return dateString;
  }
};

const editMeal = (meal) => {
  editingMeal.value = { ...meal };
};

const confirmDelete = (meal) => {
  deleteTarget.value = meal;
  deleteDialogVisible.value = true;
};

const handleDelete = async (id) => {
  isDeleting.value = true;
  try {
    deletingRows.value.add(id);
    setTimeout(async () => {
      await deleteMealApi(id);
      meals.value = meals.value.filter(m => m._id !== id);
      deletingRows.value.delete(id);
      deleteDialogVisible.value = false;
    }, 300);
  } catch (error) {
    console.error("Delete error:", error);
  } finally {
    isDeleting.value = false;
    deleteTarget.value = null;
  }
};

onMounted(() => {
  fetchMeals();
});



const totalMeals = computed(() => meals.value.length);
const totalCalories = computed(() =>
  meals.value.reduce((sum, m) => sum + (Number(m.calories) || 0), 0)
);
const totalProtein = computed(() =>
  meals.value.reduce((sum, m) => sum + (Number(m.protein) || 0), 0)
);
</script>

<template>
  <div class="mobile-meal-history">
    <h1>Meal History</h1>

    <div v-if="sortedMeals.length > 0" class="meal-list">
      <div
        v-for="meal in sortedMeals"
        :key="meal._id"
        class="meal-card"
        :class="{
          highlight: deleteDialogVisible && deleteTarget?._id === meal._id,
          deleting: deletingRows.has(meal._id)
        }"
      >
        <div class="meal-info">
          <h4>{{ meal.foodName ?? "—" }}</h4>
          <p>{{ meal.calories }} cal | {{ meal.protein }} g</p>
          <small>{{ formatDate(meal.date) }}</small>
        </div>
        <div class="meal-actions">
          <button @click="editMeal(meal)" class="icon-btn">🖊️</button>
          <button @click="confirmDelete(meal)" class="icon-btn danger">🗑️</button>
        </div>
      </div>
    </div>

    <p v-else>No meals yet.</p>

    <!-- Edit Modal -->
    <MealEditModal
      v-if="editingMeal"
      :meal="editingMeal"
      @close="editingMeal = null"
    />

    <!-- Delete Confirmation -->
    <div v-if="deleteDialogVisible" class="modal-overlay">
      <div class="modal">
        <h4>Delete Meal?</h4>
        <p>Are you sure you want to delete <b>{{ deleteTarget?.foodName }}</b>?</p>
        <div class="modal-actions">
          <button class="btn cancel" @click="deleteDialogVisible = false">Cancel</button>
          <button
            class="btn danger"
            :disabled="isDeleting"
            @click="handleDelete(deleteTarget._id)"
          >
            {{ isDeleting ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </div>
    </div>


    <section class="card">
          <h1>Summary</h1>
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
  </div>
</template>

<style scoped>
.mobile-meal-history {
  padding: 1rem;
}

h1 {
  font-size: 25px;
  margin-bottom: 1rem;
}

.meal-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Each meal card */
.meal-card {
  background: #fff;
  border-radius: 10px;
  padding: 0.75rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meal-card.highlight {
  background: rgba(220, 53, 69, 0.1);
}

.meal-card.deleting {
  animation: fadeOutRow 0.3s forwards ease-out;
}

@keyframes fadeOutRow {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-20px); }
}

.meal-info h4 {
  margin: 0;
  font-size: 1rem;
}

.meal-info p {
  margin: 0.25rem 0;
  font-size: 0.85rem;
  color: #444;
}

.meal-info small {
  font-size: 0.75rem;
  color: #777;
}

/* Action buttons */
.icon-btn {
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.45rem;
  font-size: 15px;
}

.icon-btn.danger {
  color: #dc3545;
}

/* Mobile modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  width: 90%;
  max-width: 320px;
  text-align: center;
}

.modal h4 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.modal p {
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.btn {
  flex: 1;
  margin: 0 0.25rem;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn.cancel {
  background: #ccc;
}

.btn.danger {
  background: #dc3545;
  color: white;
}





.summary-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
    margin-top: 1rem;
  }

  /* Each card */
  .summary-box {
    background: #fff;
    border: 1px solid #000;
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: transform 0.2s ease;
  }

  .summary-box.full-width {
    grid-column: span 2;
  }

  /* Interactivity feedback */
  .summary-box:active {
    transform: scale(0.98);
  }

  /* Typography */
  .summary-box p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
  }

  .summary-box h3 {
    margin-top: 0.4rem;
    font-size: 1rem;
    font-weight: 700;
    color: #000;
  }

  .card {
    margin-top: 20px;
  }
</style>
