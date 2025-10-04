<template>
  <div>
    <DataTable
      v-if="sortedWorkouts.length > 0"
      :value="sortedWorkouts"
      paginator
      :rows="6"
      :rowsPerPageOptions="[6, 12, 24, 50]"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      tableStyle="min-width: 50rem"
      :rowClass="rowClass"
    >
      <Column field="type" header="Type">
        <template #body="slotProps">
          {{ slotProps.data.type ?? "—" }}
        </template>
      </Column>
      <Column field="duration" header="Duration">
        <template #body="slotProps">
          {{ slotProps.data.duration }} min
        </template>
      </Column>
      <Column field="calories" header="Burned">
        <template #body="slotProps">
          {{ slotProps.data.calories }} cal
        </template>
      </Column>
      <Column field="date" header="Date">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </Column>
      <Column header="Actions" style="width: 120px">
        <template #body="slotProps">
          <div class="action-buttons">
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-sm p-button-secondary"
              @click="editWorkout(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              @click="confirmDelete(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <div v-else class="empty-state-desktop">
      <h4>No Workouts Yet</h4>
      <p>Start tracking your fitness journey by adding your first workout!</p>
    </div>

    <!-- Edit Modal -->
    <WorkoutEditModal
      v-if="editingWorkout"
      :workout="editingWorkout"
      @close="editingWorkout = null"
    />

    <!-- Delete Confirmation Modal -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Confirm Delete"
      :modal="true"
      style="width: 350px"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle"></i>
        <p>Are you sure you want to delete this workout?</p>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          @click="deleteDialogVisible = false"
          class="p-button-text"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          @click="handleDelete(deleteTarget._id)"
          :disabled="isDeleting"
          class="p-button-danger confirm-yes"
          autofocus
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  workouts,
  deleteWorkout,
  fetchWorkouts,
} from "../composables/useWorkouts.js";
import WorkoutEditModal from "./WorkoutEditModal.vue";
import { useToast } from "primevue/usetoast";

// PrimeVue Components
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";

const toast = useToast();

const editingWorkout = ref(null);
const deleteTarget = ref(null);
const deleteDialogVisible = ref(false);
const isDeleting = ref(false);

// Sort workouts by date (newest first)
const sortedWorkouts = computed(() => {
  return [...workouts.value].sort((a, b) => {
    const da = new Date(a.date || a.createdAt || 0);
    const db = new Date(b.date || b.createdAt || 0);
    const ta = isNaN(da) ? 0 : da.getTime();
    const tb = isNaN(db) ? 0 : db.getTime();
    return tb - ta;
  });
});

const formatDate = (dateString) => {
  if (!dateString) return "No Date";
  try {
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

const editWorkout = (workout) => {
  editingWorkout.value = { ...workout };
};

const confirmDelete = (workout) => {
  deleteTarget.value = workout;
  deleteDialogVisible.value = true;
};

const deletingRows = ref(new Set());

const handleDelete = async (id) => {
  isDeleting.value = true;
  try {
    // Mark row as deleting → will trigger CSS animation
    deletingRows.value.add(id);

    // Wait for animation (300ms) before removing
    setTimeout(async () => {
      await deleteWorkout(id);
      deletingRows.value.delete(id);

      deleteDialogVisible.value = false;
      toast.add({
        severity: "success",
        summary: "Workout Deleted",
        detail: "The workout log has been removed.",
        life: 3000,
      });
    }, 300); // match CSS animation duration
  } catch (error) {
    console.error("Delete error:", error);
    toast.add({
      severity: "error",
      summary: "Delete Failed",
      detail: "Something went wrong while deleting the workout.",
      life: 4000,
    });
  } finally {
    isDeleting.value = false;
    deleteTarget.value = null;
  }
};

// run initial fetch when component mounts
onMounted(() => {
  fetchWorkouts();
});

const rowClass = (data) => {
  return {
    "row-highlight":
      deleteDialogVisible.value && deleteTarget.value?._id === data._id,
    "row-deleting": deletingRows.value.has(data._id),
  };
};
</script>

<style scoped>
.empty-state-desktop {
  text-align: center;
  padding: 7.6rem 1rem;
  color: var(--muted-foreground);
}

.empty-state-desktop h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--foreground);
}

.empty-state-desktop p {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #737373;
  font-weight: 400;
}

h3 {
  font-size: 2rem;
}

.workout-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.workout-table th,
.workout-table td {
  border: 1px solid #ddd;
  padding: 0.6rem;
  text-align: center;
}

.workout-table th {
  background: var(--muted);
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: var(--radius);
  transition: background 0.2s;
  font-size: 1rem;
}

.btn-icon:hover {
  background: var(--muted);
}

.btn-danger {
  color: var(--destructive);
}

.btn-danger:hover {
  background: rgba(220, 53, 69, 0.1);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: var(--card);
  color: var(--card-foreground);
  padding: 1.5rem;
  border-radius: var(--radius);
  width: 320px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal h4 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.2rem;
}

.btn-confirm {
  background: var(--destructive);
  color: var(--destructive-foreground);
  border: none;
  padding: 0.4rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirm:hover {
  background: var(--destructive-hover);
}

.btn-cancel {
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: none;
  padding: 0.4rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: var(--third-hover);
}

:deep(.p-datatable-tbody > tr.row-highlight td) {
  background-color: rgba(220, 53, 69, 0.1);
}

:deep(.p-paginator .p-dropdown.p-component) {
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  background-color: var(--background) !important;
  color: var(--foreground) !important;
  min-width: 4rem !important;
}

:deep(.p-paginator .p-dropdown.p-component .p-dropdown-label) {
  padding: 0.25rem 0.75rem !important;
  font-size: 0.9rem !important;
  color: var(--foreground) !important;
}

:deep(.p-paginator .p-dropdown.p-component .p-dropdown-trigger) {
  color: var(--muted-foreground) !important;
}

/* Focus/active state */
:deep(.p-paginator .p-dropdown.p-component.p-focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.confirmation-content i {
  font-size: 2rem;
  color: var(--destructive);
  flex-shrink: 0;
}

.confirmation-content p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--foreground);
}

:deep(.p-datatable-tbody > tr.row-deleting td) {
  animation: fadeOutRow 0.3s forwards ease-out;
}

.confirm-yes {
  color: white;
}

@keyframes fadeOutRow {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}
.action-buttons :deep(.p-button.p-button-text.p-button-secondary:hover) {
  background: var(--muted);
  color: var(--primary);
}

.action-buttons :deep(.p-button.p-button-text.p-button-danger:hover) {
  background: var(--destructive);
  color: var(--destructive-foreground);
}
</style>
