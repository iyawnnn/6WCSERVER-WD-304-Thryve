<script setup>
import { ref, computed, onMounted } from "vue";
import { meals, deleteMeal, fetchMeals } from "../composables/useMeals.js";
import { useToast } from "primevue/usetoast";
import MealEditModal from "../components/MealEditModal.vue";

const toast = useToast();

const editingMeal = ref(null);
const deleteTarget = ref(null);
const deleteDialogVisible = ref(false);
const isDeleting = ref(false);
const deletingRows = ref(new Set());
const currentPage = ref(1);
const mealsPerPage = 5;
const isEditModalVisible = ref(false);

const editMeal = (meal) => {
  editingMeal.value = { ...meal };
  isEditModalVisible.value = true;
};

// Sort meals (newest first)
const sortedMeals = computed(() => {
  return [...meals.value].sort((a, b) => {
    const da = new Date(a.date || a.createdAt || 0);
    const db = new Date(b.date || b.createdAt || 0);
    return (isNaN(db) ? 0 : db.getTime()) - (isNaN(da) ? 0 : da.getTime());
  });
});

// Summary calculations
const totalMeals = computed(() => sortedMeals.value.length);
const totalCalories = computed(() =>
  sortedMeals.value.reduce((sum, meal) => sum + (meal.calories || 0), 0)
);
const totalProtein = computed(() =>
  sortedMeals.value.reduce((sum, meal) => sum + (meal.protein || 0), 0)
);

// Paginated meals
const paginatedMeals = computed(() => {
  const startIndex = (currentPage.value - 1) * mealsPerPage;
  const endIndex = startIndex + mealsPerPage;
  return sortedMeals.value.slice(startIndex, endIndex);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(sortedMeals.value.length / mealsPerPage);
});

// Page numbers for pagination
const pageNumbers = computed(() => {
  const pages = [];
  const maxVisiblePages = window.innerWidth <= 768 ? 3 : 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  } else {
    let startPage = currentPage.value - Math.floor(maxVisiblePages / 2);
    let endPage = currentPage.value + Math.floor(maxVisiblePages / 2);

    if (startPage < 1) {
      startPage = 1;
      endPage = maxVisiblePages;
    }
    if (endPage > totalPages.value) {
      endPage = totalPages.value;
      startPage = totalPages.value - maxVisiblePages + 1;
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);
  }

  return pages;
});

const formatDate = (dateString) => {
  if (!dateString) return "No Date";
  try {
    const d = new Date(dateString);
    return isNaN(d) ? dateString : d.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
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
      await deleteMeal(id);
      deletingRows.value.delete(id);
      deleteDialogVisible.value = false;
      toast.add({
        severity: "success",
        summary: "Deleted",
        detail: "Meal deleted",
        life: 2000,
      });
      if (paginatedMeals.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
    }, 300);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to delete meal",
      life: 2500,
    });
  } finally {
    isDeleting.value = false;
    deleteTarget.value = null;
  }
};

// Pagination functions
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const handleMealUpdated = (updatedMeal) => {
  const index = meals.value.findIndex((m) => m._id === updatedMeal.id);
  if (index !== -1) {
    meals.value[index] = { ...meals.value[index], ...updatedMeal };
  }
};

// Show range of meals being displayed
const showingRange = computed(() => {
  const start = (currentPage.value - 1) * mealsPerPage + 1;
  const end = Math.min(
    currentPage.value * mealsPerPage,
    sortedMeals.value.length
  );
  return `${start}-${end} of ${sortedMeals.value.length}`;
});

onMounted(() => {
  fetchMeals();
});
</script>

<template>
  <div class="mobile-history">
    <div class="header-section">
      <h3 class="history-title">Meal Log</h3>
      <div class="workout-count">
        {{ totalMeals }} meal{{ totalMeals !== 1 ? "s" : "" }}
      </div>
    </div>

    <!-- Summary Section -->
    <section class="summary-card">
      <h4 class="summary-title">Summary</h4>
      <div class="summary-cards">
        <div class="summary-box">
          <p class="summary-label">TOTAL MEALS</p>
          <h3 class="summary-value">{{ totalMeals }}</h3>
        </div>
        <div class="summary-box">
          <p class="summary-label">TOTAL CALORIES</p>
          <h3 class="summary-value">{{ totalCalories }} cal</h3>
        </div>
        <div class="summary-box full-width">
          <p class="summary-label-black">TOTAL PROTEIN</p>
          <h3 class="summary-value">{{ totalProtein }} g</h3>
        </div>
      </div>
    </section>

    <!-- Meals & Pagination Wrapper -->
    <div v-if="sortedMeals.length > 0">
      <!-- Pagination Info -->
      <div class="pagination-info">
        <span class="showing-text">Showing {{ showingRange }}</span>
      </div>

      <!-- Meal Cards -->
      <div class="workout-cards">
        <div
          v-for="m in paginatedMeals"
          :key="m._id"
          :class="[
            'workout-card',
            {
              deleting: deletingRows.has(m._id),
              'pending-delete': deleteTarget && deleteTarget._id === m._id,
            },
          ]"
        >
          <div class="card-header">
            <div class="workout-type">{{ m.foodName ?? "—" }}</div>
            <div class="workout-date">{{ formatDate(m.date) }}</div>
          </div>

          <div class="card-stats">
            <div class="stat">
              <div class="stat-label">Calories</div>
              <div class="stat-value calories">{{ m.calories }} cal</div>
            </div>
            <div class="stat">
              <div class="stat-label">Protein</div>
              <div class="stat-value">{{ m.protein }} g</div>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-edit" @click="editMeal(m)">
              <i class="bi bi-pencil-square"></i>
              Edit
            </button>
            <button class="btn-delete" @click="confirmDelete(m)">
              <i class="bi bi-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination-controls">
        <button
          class="pagination-btn prev-btn"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <i class="bi bi-chevron-left"></i>
          Previous
        </button>

        <div class="page-numbers">
          <button
            v-for="page in pageNumbers"
            :key="page"
            :class="['page-btn', { active: page === currentPage }]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <span
            v-if="pageNumbers[pageNumbers.length - 1] < totalPages"
            class="page-ellipsis"
          >
            ...
          </span>
        </div>

        <button
          class="pagination-btn next-btn"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          Next
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <h4>No Meals Yet</h4>
      <p>Start tracking your nutrition by adding your first meal!</p>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteDialogVisible" class="modal-backdrop">
      <div class="modal">
        <div class="modal-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <h4>Delete Meal?</h4>
        <p>Are you sure you want to delete this meal? This action cannot be undone.</p>
        <div class="modal-actions">
          <button
            class="btn-cancel"
            @click="deleteDialogVisible = false; deleteTarget = null;"
          >
            Cancel
          </button>
          <button
            class="btn-confirm-delete"
            :disabled="isDeleting"
            @click="handleDelete(deleteTarget._id)"
          >
            {{ isDeleting ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <MealEditModal
      v-if="editingMeal"
      :meal="editingMeal"
      @close="editingMeal = null"
    />
  </div>
</template>


<style scoped>
.mobile-history {
  font-family: "Geist", "Poppins", sans-serif;
  max-width: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  margin-top: 3rem;
}

.history-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--foreground);
  margin: 0;
}

.workout-count {
  background: var(--muted);
  color: var(--muted-foreground);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Summary */
.summary-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--foreground);
  margin: 0 0 1rem 0;
  text-align: center;
}

.summary-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.summary-box {
  background: var(--muted);
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
  transition: all 0.2s ease;
}

.summary-box.full-width {
  grid-column: 1 / -1;
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-hover) 100%
  );
  color: var(--primary-foreground);
}

.summary-label {
  color: #737373;
  font-weight: 500;
  font-size: 0.75rem;
  margin-bottom: 4px;
}

.summary-label-black {
  color: #fff;
  font-weight: 500;
}

.summary-value {
  font-weight: 700;
}

/* Pagination info */
.pagination-info {
  margin-bottom: 1rem;
  text-align: center;
}

.showing-text {
  font-size: 0.9rem;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
}

/* Cards */
.workout-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.workout-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between; /* pushes name left, date right */
  align-items: center;
  margin-bottom: 0.5rem;
}

.workout-type {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--foreground);
}

.workout-date {
  font-size: 0.85rem;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.card-stats {
  box-sizing: border-box;
  column-gap: 1rem;
  row-gap: 1rem;
  display: flex;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--muted-foreground);
  text-transform: uppercase;
  font-weight: 500;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--foreground);
}

.stat-value.calories {
  color: var(--primary);
}

/* Actions */
.card-actions {
  display: flex;
  gap: 0.75rem;
}

.card-actions button {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: center;
  border: 1px solid var(--border);
}

.btn-edit {
  background: var(--secondary);
  color: var(--secondary-foreground);
}

.btn-edit:hover {
  background: var(--secondary-hover);
}

.btn-delete {
  background: var(--primary);
  color: var(--destructive-foreground);
}

.btn-delete:hover {
  background: var(--destructive-hover);
}

/* Pagination controls */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem 0;
  gap: 0.5rem;
}

@media (max-width: 400px) {
  .pagination-btn,
  .page-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  color: var(--foreground);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--muted);
  border-color: var(--primary);
}

.page-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--card);
  color: var(--foreground);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn.active {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--muted-foreground);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--foreground);
}

.empty-state p {
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--card);
  border-radius: 16px;
  padding: 2rem;
  max-width: 320px;
  width: 100%;
  text-align: center;
}

.modal-icon {
  font-size: 40px;
  color: #e74c3c;
  margin-bottom: 16px;
}

.modal h4 {
  font-size: 20px;
  margin-bottom: 12px;
  font-weight: 600;
}

.modal p {
  font-size: 16px;
  color: #555;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm-delete {
  flex: 1;
  background: #e74c3c; /* red */
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirm-delete:hover {
  background: #c0392b;
}

.btn-confirm-delete:disabled {
  background: #f5b7b1;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
