<script setup>
import { ref, computed, onMounted } from "vue";
import MobileWorkoutEditModal from "./mobileWorkoutEditModal.vue";
import {
  workouts,
  deleteWorkout,
  fetchWorkouts,
} from "../composables/useWorkouts.js";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const editingWorkout = ref(null);
const deleteTarget = ref(null);
const deleteDialogVisible = ref(false);
const isDeleting = ref(false);
const deletingRows = ref(new Set());
const currentPage = ref(1);
const workoutsPerPage = 5;
const isEditModalVisible = ref(false);
const loading = ref(true);

const editWorkout = (workout) => {
  editingWorkout.value = { ...workout };
  isEditModalVisible.value = true;
};

// Sort workouts (newest first)
const sortedWorkouts = computed(() => {
  return [...workouts.value].sort((a, b) => {
    const da = new Date(a.date || a.createdAt || 0);
    const db = new Date(b.date || b.createdAt || 0);
    return (isNaN(db) ? 0 : db.getTime()) - (isNaN(da) ? 0 : da.getTime());
  });
});

// Summary calculations
const totalWorkouts = computed(() => sortedWorkouts.value.length);
const totalDuration = computed(() =>
  sortedWorkouts.value.reduce(
    (sum, workout) => sum + (workout.duration || 0),
    0
  )
);
const totalCalories = computed(() =>
  sortedWorkouts.value.reduce(
    (sum, workout) => sum + (workout.calories || 0),
    0
  )
);

// Paginated workouts
const paginatedWorkouts = computed(() => {
  const startIndex = (currentPage.value - 1) * workoutsPerPage;
  const endIndex = startIndex + workoutsPerPage;
  return sortedWorkouts.value.slice(startIndex, endIndex);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(sortedWorkouts.value.length / workoutsPerPage);
});

// Page numbers for pagination
const pageNumbers = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    const startPage = Math.max(1, currentPage.value - 2);
    const endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
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

const confirmDelete = (workout) => {
  deleteTarget.value = workout;
  deleteDialogVisible.value = true;
};

const handleDelete = async (id) => {
  isDeleting.value = true;
  try {
    deletingRows.value.add(id);
    setTimeout(async () => {
      await deleteWorkout(id);
      deletingRows.value.delete(id);
      deleteDialogVisible.value = false;
      toast.add({
        severity: "success",
        summary: "Deleted",
        detail: "Workout deleted",
        life: 2000,
      });
      if (paginatedWorkouts.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
    }, 300);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to delete workout",
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

const handleWorkoutUpdated = (updatedWorkout) => {
  const index = workouts.value.findIndex((w) => w._id === updatedWorkout.id);
  if (index !== -1) {
    workouts.value[index] = { ...workouts.value[index], ...updatedWorkout };
  }
};

// Show range of workouts being displayed
const showingRange = computed(() => {
  const start = (currentPage.value - 1) * workoutsPerPage + 1;
  const end = Math.min(
    currentPage.value * workoutsPerPage,
    sortedWorkouts.value.length
  );
  return `${start}-${end} of ${sortedWorkouts.value.length}`;
});

// Fetch workouts on mount
onMounted(async () => {
  try {
    await fetchWorkouts();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="mobile-history">
    <div class="header-section">
      <h3 class="history-title">Workout Log</h3>
      <div class="workout-count">
        {{ totalWorkouts }} workout{{ totalWorkouts !== 1 ? "s" : "" }}
      </div>
    </div>

    <!-- Summary Section -->
    <section class="summary-card">
      <h4 class="summary-title">Summary</h4>
      <div class="summary-cards">
        <div class="summary-box">
          <p class="summary-label">Total Workouts</p>
          <h3 class="summary-value">{{ totalWorkouts }}</h3>
        </div>
        <div class="summary-box">
          <p class="summary-label">Total Duration</p>
          <h3 class="summary-value">{{ totalDuration }} min</h3>
        </div>
        <div class="summary-box full-width">
          <p class="summary-label">Total Calories</p>
          <h3 class="summary-value">{{ totalCalories }} cal</h3>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading workouts...</p>
    </div>

    <!-- Workout Cards / Empty State -->
    <div v-else>
      <div v-if="sortedWorkouts.length > 0" class="pagination-info">
        <span class="showing-text">Showing {{ showingRange }}</span>
      </div>

      <div v-if="sortedWorkouts.length > 0" class="workout-cards">
        <div
          v-for="w in paginatedWorkouts"
          :key="w._id"
          :class="[
            'workout-card',
            {
              deleting: deletingRows.has(w._id),
              'pending-delete': deleteTarget && deleteTarget._id === w._id,
            },
          ]"
        >
          <div class="card-header">
            <div class="workout-type">{{ w.type ?? "—" }}</div>
            <div class="workout-date">{{ formatDate(w.date) }}</div>
          </div>

          <div class="card-stats">
            <div class="stat">
              <div class="stat-label">Duration</div>
              <div class="stat-value">{{ w.duration }} min</div>
            </div>
            <div class="stat">
              <div class="stat-label">Burned</div>
              <div class="stat-value calories">{{ w.calories }} cal</div>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-edit" @click="editWorkout(w)">
              <i class="bi bi-pencil-square"></i>
              Edit
            </button>
            <button class="btn-delete" @click="confirmDelete(w)">
              <i class="bi bi-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <h4>No Workouts Yet</h4>
        <p>Start tracking your fitness journey by adding your first workout!</p>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination-controls">
        <button
          class="pagination-btn prev-btn"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
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
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteDialogVisible" class="modal-backdrop">
      <div class="modal">
        <h4>Delete Workout?</h4>
        <p>
          Are you sure you want to delete this workout? This action cannot be
          undone.
        </p>
        <div class="modal-actions">
          <button
            class="btn-cancel"
            @click="
              deleteDialogVisible = false;
              deleteTarget = null;
            "
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
    <MobileWorkoutEditModal
      v-if="editingWorkout"
      :workout="editingWorkout"
      :isVisible="isEditModalVisible"
      @update:isVisible="isEditModalVisible = $event"
      @workoutUpdated="handleWorkoutUpdated"
    />
  </div>
</template>

<style scoped>
.mobile-history {
  font-family: "Geist", "Poppins", sans-serif;
  padding: 1rem;
  max-width: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

/* Summary Section */
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

.summary-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  font-size: 0.8rem;
  color: var(--muted-foreground);
  margin: 0 0 0.25rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-box.full-width .summary-label {
  color: rgba(255, 255, 255, 0.9);
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--foreground);
  margin: 0;
}

.summary-box.full-width .summary-value {
  color: var(--primary-foreground);
}

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

/* Workout Cards */
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
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.workout-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.workout-card.deleting {
  opacity: 0.5;
  transform: translateX(-100%);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.workout-type {
  font-size: 1.1rem;
  font-weight: 600;
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
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.card-actions button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.btn-edit {
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
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
  transform: translateY(-1px);
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 1rem 0;
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
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--muted);
  border-color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.page-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--card);
  color: var(--foreground);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover {
  background: var(--muted);
  border-color: var(--primary);
}

.page-btn.active {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.page-ellipsis {
  color: var(--muted-foreground);
  padding: 0 0.5rem;
  font-weight: 500;
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

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--card);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #c0392b;
}

.modal h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--foreground);
}

.modal p {
  color: var(--muted-foreground);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: var(--muted);
  color: var(--foreground);
  border: 1px solid var(--border);
}

.btn-cancel:hover {
  background: var(--muted-hover);
}

.btn-confirm-delete {
  background: var(--destructive);
  color: var(--destructive-foreground);
}

.btn-confirm-delete:hover:not(:disabled) {
  background: var(--destructive-hover);
}

.btn-confirm-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pending-delete {
  border: 2px solid var(--destructive);
  background: rgba(255, 0, 0, 0.05);
  transform: scale(0.98);
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.2);
}

/* Mobile Optimizations */
@media (max-width: 480px) {
  .mobile-history {
    padding: 0.75rem;
  }

  .header-section {
    margin-bottom: 1rem;
  }

  .history-title {
    font-size: 1.35rem;
  }

  .summary-card {
    padding: 1rem;
    margin-bottom: 1.25rem;
  }

  .summary-cards {
    gap: 0.5rem;
  }

  .summary-box {
    padding: 0.6rem;
  }

  .summary-value {
    font-size: 1.25rem;
  }

  .workout-card {
    padding: 1rem;
    border-radius: 10px;
  }

  .card-stats {
    gap: 1rem;
  }

  .stat-value {
    font-size: 1rem;
  }

  .card-actions {
    gap: 0.5rem;
  }

  .card-actions button {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
  }

  .pagination-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .page-btn {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.85rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .modal {
    padding: 1.5rem;
  }
}

@media (max-width: 360px) {
  .card-stats {
    flex-direction: column;
    gap: 0.75rem;
  }

  .header-section {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .workout-count {
    align-self: flex-start;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .page-numbers {
    order: -1;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .summary-box.full-width {
    grid-column: 1;
  }
}
</style>