<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import api from "../utils/api";
import { meals } from "../composables/useMeals.js";
import DatePicker from "primevue/datepicker";

const toast = useToast();

const emit = defineEmits(["mealAdded"]);

const foodName = ref("");
const calories = ref(null);
const protein = ref(null);
const date = ref(new Date());
const today = new Date();
const isLoading = ref(false);

const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addMeal = async () => {
  if (!foodName.value.trim()) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Meal name is required.",
      life: 3000,
    });
    return;
  }
  if (calories.value === null || calories.value < 0) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Calories must be 0 or higher.",
      life: 3000,
    });
    return;
  }
  if (protein.value !== null && protein.value < 0) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Protein must be 0 or higher.",
      life: 3000,
    });
    return;
  }
  if (stripTime(date.value) > stripTime(today)) {
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
    const res = await api.post("/meals", {
      foodName: foodName.value.trim(),
      calories: Number(calories.value),
      protein: protein.value ? Number(protein.value) : 0,
      date: `${date.value.getFullYear()}-${(date.value.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.value.getDate().toString().padStart(2, "0")}`,
    });

    meals.value.unshift(res.data);
    emit("mealAdded");

    toast.add({
      severity: "success",
      summary: "Meal Added",
      detail: "Your meal was saved successfully.",
      life: 3000,
    });

    // Reset form
    foodName.value = "";
    calories.value = null;
    protein.value = null;
    date.value = new Date();
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to add meal. Try again.",
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="addMeal" class="form-grid">
    <!-- Row 1: Food Name + Calories + Protein -->
    <div class="form-row three-cols">
      <div class="input-group">
        <label class="input-label">Meal Name</label>
        <input
          v-model="foodName"
          type="text"
          placeholder="Enter meal name"
          :disabled="isLoading"
        />
      </div>
      <div class="input-group">
        <label class="input-label">Calories</label>
        <input
          v-model.number="calories"
          type="number"
          min="0"
          placeholder="Calories"
          :disabled="isLoading"
        />
      </div>
      <div class="input-group">
        <label class="input-label">Protein (g)</label>
        <input
          v-model.number="protein"
          type="number"
          min="0"
          placeholder="Protein"
          :disabled="isLoading"
        />
      </div>
    </div>

    <!-- Row 2: Date Picker -->
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

    <!-- Row 3: Submit Button -->
    <div class="form-row">
      <button type="submit" class="btn-submit" :disabled="isLoading">
        {{ isLoading ? "Adding..." : "Add Meal" }}
      </button>
    </div>
  </form>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

form {
  font-family: "Geist", sans-serif;
  color: var(--foreground);
}

.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.35rem;
  color: var(--foreground);
}

input[type="text"],
input[type="number"],
:deep(.p-datepicker .p-inputtext),
:deep(.p-datepicker .p-datepicker-trigger) {
  width: 100%;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: "Geist", sans-serif;
  padding: 0 0.75rem;
  box-sizing: border-box;
  background-color: var(--background);
  transition: border 0.2s ease, background 0.2s ease;
}

/* Focus states */
input:focus,
:deep(.p-inputtext:enabled:focus),
:deep(.p-datepicker .p-inputtext:enabled:focus) {
  outline: none !important;
  border-color: var(--primary) !important;
  box-shadow: none !important;
}

/* DatePicker button */
:deep(.p-datepicker .p-datepicker-trigger) {
  border: 1px solid var(--border) !important;
  border-left: none !important;
  border-radius: 0 var(--radius) var(--radius) 0 !important;
  height: 42px !important;
  background: var(--background) !important;
  cursor: pointer;
}

/* Submit button */
.form-row button.btn-submit {
  width: 100%;
}

.btn-submit {
  color: var(--primary-foreground);
  border: none;
  padding: 0.5rem;
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: "Geist", sans-serif;
  cursor: pointer;
  transition: background 0.25s ease;
  text-align: center;
}

.btn-submit:hover {
  background-color: var(--primary-hover);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row.full {
  flex-direction: column;
}

.form-row.three-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.w-full {
  width: 100%;
}

/* Override PrimeVue DatePicker CSS */
:deep(.p-datepicker) {
  --p-datepicker-dropdown-border-radius: var(--radius) !important;
  border-radius: var(--radius) !important;
}

:deep(.p-datepicker .p-inputtext) {
  border: 1px solid var(--border) !important;
  border-right: none !important;
  border-radius: var(--radius) 0 0 var(--radius) !important;
  height: 42px !important;
}

:deep(.p-datepicker-dropdown) {
  border-radius: 0 var(--radius) var(--radius) 0 !important;
  border: 1px solid var(--border) !important;
  background: var(--background) !important;
  color: var(--foreground) !important;
}

:deep(.p-datepicker:focus-within .p-inputtext),
:deep(.p-datepicker:focus-within .p-datepicker-dropdown) {
  border-color: var(--primary) !important;
}
</style>
