<script setup>
import { ref, computed, onMounted } from "vue";
import {
  meals,
  fetchMeals,
  deleteMeal as deleteMealApi,
} from "../composables/useMeals.js";
import MealEditModal from "./MealEditModal.vue";
import { useToast } from "primevue/usetoast";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";

const toast = useToast();

const editingMeal = ref(null);
const deleteTarget = ref(null);
const deleteDialogVisible = ref(false);
const isDeleting = ref(false);

const deletingRows = ref(new Set());

// Sort meals by date (newest first)
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
  } catch (e) {
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
      meals.value = meals.value.filter((m) => m._id !== id);
      deletingRows.value.delete(id);

      deleteDialogVisible.value = false;
      toast.add({
        severity: "success",
        summary: "Meal Deleted",
        detail: "The meal has been removed.",
        life: 3000,
      });
    }, 300);
  } catch (error) {
    console.error("Delete error:", error);
    toast.add({
      severity: "error",
      summary: "Delete Failed",
      detail: "Something went wrong while deleting the meal.",
      life: 4000,
    });
  } finally {
    isDeleting.value = false;
    deleteTarget.value = null;
  }
};

onMounted(() => {
  fetchMeals();
});

const rowClass = (data) => {
  return {
    "row-highlight":
      deleteDialogVisible.value && deleteTarget.value?._id === data._id,
    "row-deleting": deletingRows.value.has(data._id),
  };
};
</script>

<template>
  <div>
    <DataTable
      v-if="sortedMeals.length > 0"
      :value="sortedMeals"
      paginator
      :rows="6"
      :rowsPerPageOptions="[6, 12, 24, 50]"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      tableStyle="min-width: 50rem"
      :rowClass="rowClass"
    >
      <Column field="foodName" header="Meal Name">
        <template #body="slotProps">
          {{ slotProps.data.foodName ?? "—" }}
        </template>
      </Column>
      <Column field="calories" header="Calories">
        <template #body="slotProps">
          {{ slotProps.data.calories }} cal
        </template>
      </Column>
      <Column field="protein" header="Protein">
        <template #body="slotProps"> {{ slotProps.data.protein }} g </template>
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
              @click="editMeal(slotProps.data)"
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
      <h4>No Meals Yet</h4>
      <p>Start tracking your nutrition by adding your first meal!</p>
    </div>

    <!-- Edit Modal -->
    <MealEditModal
      v-if="editingMeal"
      :meal="editingMeal"
      @close="editingMeal = null"
    />

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Confirm Delete"
      :modal="true"
      style="width: 350px"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle"></i>
        <p>Are you sure you want to delete this meal?</p>
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
          class="p-button-danger"
          autofocus
        />
      </template>
    </Dialog>
  </div>
</template>

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

:deep(.p-datatable-tbody > tr.row-highlight td) {
  background-color: rgba(220, 53, 69, 0.1);
}

:deep(.p-datatable-tbody > tr.row-deleting td) {
  animation: fadeOutRow 0.3s forwards ease-out;
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

.action-buttons :deep(.p-button.p-button-text.p-button-secondary:hover) {
  background: var(--muted);
  color: var(--primary);
}

.action-buttons :deep(.p-button.p-button-text.p-button-danger:hover) {
  background: var(--destructive);
  color: var(--destructive-foreground);
}
</style>
