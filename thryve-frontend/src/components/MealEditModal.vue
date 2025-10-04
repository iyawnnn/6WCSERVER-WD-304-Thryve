<script setup>
import { ref } from "vue";
import { meals } from "../composables/useMeals.js";
import api from "../utils/api";
import { useToast } from "primevue/usetoast";
import DatePicker from "primevue/datepicker";

const toast = useToast();

const props = defineProps(["meal"]);
const emit = defineEmits(["close"]);

const today = new Date();
const isLoading = ref(false);

// Initialize form data
const foodName = ref(props.meal.foodName || "");
const calories = ref(props.meal.calories || 0);
const protein = ref(props.meal.protein || 0);
const date = ref(props.meal.date ? new Date(props.meal.date) : new Date());

const updateMealHandler = async () => {
  if (!foodName.value.trim()) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Food name is required.",
      life: 3000,
    });
    return;
  }

  if (!calories.value || calories.value < 0) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Calories must be 0 or higher.",
      life: 3000,
    });
    return;
  }

  if (protein.value < 0) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Protein cannot be negative.",
      life: 3000,
    });
    return;
  }

  if (!date.value) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Please select a date.",
      life: 3000,
    });
    return;
  }

  if (date.value > today) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Date cannot be in the future.",
      life: 3000,
    });
    return;
  }

  isLoading.value = true;

  try {
    const mealData = {
      foodName: foodName.value.trim(),
      calories: Number(calories.value),
      protein: Number(protein.value),
      date: `${date.value.getFullYear()}-${(date.value.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.value.getDate().toString().padStart(2, "0")}`,
    };

    const res = await api.put(`/meals/${props.meal._id}`, mealData);
    const index = meals.value.findIndex((m) => m._id === res.data._id);
    if (index !== -1) meals.value[index] = res.data;

    toast.add({
      severity: "success",
      summary: "Meal Updated",
      detail: "Your meal has been successfully updated.",
      life: 3000,
    });

    emit("close");
  } catch (error) {
    console.error("Update error:", error);
    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: "Something went wrong while updating your meal.",
      life: 4000,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-dialog">
      <div class="modal-content">
        <h5>Edit Meal</h5>
        <form @submit.prevent="updateMealHandler" class="form-grid">
          <div class="form-row three-cols">
            <div class="input-group">
              <label class="input-label">Meal Name</label>
              <input
                v-model="foodName"
                type="text"
                placeholder="Enter meal name"
                required
                :disabled="isLoading"
              />
            </div>
            <div class="input-group">
              <label class="input-label">Calories</label>
              <input
                v-model.number="calories"
                type="number"
                min="0"
                required
                placeholder="Enter calories"
                :disabled="isLoading"
              />
            </div>
            <div class="input-group">
              <label class="input-label">Protein (g)</label>
              <input
                v-model.number="protein"
                type="number"
                min="0"
                placeholder="Enter protein"
                :disabled="isLoading"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="input-group full">
              <label class="input-label">Meal Date</label>
              <DatePicker
                v-model="date"
                showIcon
                :maxDate="today"
                dateFormat="yy-mm-dd"
                placeholder="Select Date"
                class="w-full"
                :disabled="isLoading"
              />
            </div>
          </div>

          <div class="form-row">
            <button
              type="button"
              class="btn-submit secondary"
              @click="$emit('close')"
              :disabled="isLoading"
            >
              Cancel
            </button>
            <button type="submit" class="btn-submit" :disabled="isLoading">
              {{ isLoading ? "Updating..." : "Update Meal" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* === Modal Backdrop === */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 998;
}

/* === Modal Dialog === */
.modal-dialog {
  max-width: 700px;
  width: 90%;
}

.modal-content {
  background: var(--card);
  color: var(--card-foreground);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 1.5rem;
  font-family: "Geist", sans-serif;
}

/* === Title === */
.modal-content h5 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--foreground);
}

/* === Form Layout === */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-row.three-cols > .input-group {
  flex: 1 1 calc(33.333% - 0.75rem);
  min-width: 200px;
}

.input-group.full {
  flex: 1 1 100%;
}

/* === Labels === */
.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.35rem;
  color: var(--foreground);
}

/* === Inputs === */
input,
:deep(.p-inputtext) {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.65rem 0.9rem;
  font-size: 0.95rem;
  background: var(--background);
  color: var(--foreground);
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
:deep(.p-inputtext:focus) {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

/* === Buttons === */
.btn-submit {
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.55rem 1.2rem;
  transition: background 0.25s ease;
  border: none;
  cursor: pointer;
}

.btn-submit.secondary {
  background: var(--muted);
  color: var(--muted-foreground);
}

.btn-submit.secondary:hover {
  background: var(--third-hover);
}

.btn-submit:not(.secondary) {
  background: var(--primary);
  color: var(--primary-foreground);
}

.btn-submit:not(.secondary):hover {
  background: var(--primary-hover);
}

/* DatePicker styling overrides */
:deep(.p-datepicker .p-inputtext) {
  border: 1px solid var(--border) !important;
  border-right: none !important;
  border-radius: var(--radius) 0 0 var(--radius) !important;
  height: 42px !important;
  z-index: 999 !important;
}

:deep(.p-datepicker-dropdown) {
  border-radius: 0 var(--radius) var(--radius) 0 !important;
  border: 1px solid var(--border) !important;
  background: var(--background) !important;
  color: var(--foreground) !important;
  z-index: 999 !important;
}

:deep(input[type="number"]::-webkit-inner-spin-button),
:deep(input[type="number"]::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

:deep(input[type="number"]) {
  -moz-appearance: textfield;
}
</style>
