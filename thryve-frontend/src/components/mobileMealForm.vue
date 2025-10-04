<script setup>
import { ref } from "vue";
import api from "../utils/api";
import { meals } from "../composables/useMeals.js";
import { useToast } from "primevue/usetoast"; 

const toast = useToast();
const emit = defineEmits(["mealAdded"]);

const foodName = ref("");
const calories = ref(null);
const protein = ref(null);
const date = ref(new Date().toISOString().split("T")[0]);
const today = new Date().toISOString().split("T")[0];
const isLoading = ref(false);

const addMeal = async () => {
  if (!foodName.value.trim()) {
    toast.add({ severity: "warn", summary: "Validation", detail: "Meal name is required.", life: 3000 });
    return;
  }
  if (calories.value === null || calories.value < 0) {
    toast.add({ severity: "warn", summary: "Validation", detail: "Calories must be 0 or higher.", life: 3000 });
    return;
  }
  if (protein.value !== null && protein.value < 0) {
    toast.add({ severity: "warn", summary: "Validation", detail: "Protein must be 0 or higher.", life: 3000 });
    return;
  }
  if (date.value > today) {
    toast.add({ severity: "warn", summary: "Validation", detail: "Date cannot be in the future.", life: 3000 });
    return;
  }

  isLoading.value = true;
  try {
    const res = await api.post("/meals", {
      foodName: foodName.value.trim(),
      calories: Number(calories.value),
      protein: protein.value ? Number(protein.value) : 0,
      date: date.value,
    });

    meals.value.unshift(res.data);
    emit("mealAdded");

    toast.add({ severity: "success", summary: "Meal Added", detail: "Your meal was saved successfully.", life: 3000 });

    // Reset form
    foodName.value = "";
    calories.value = null;
    protein.value = null;
    date.value = new Date().toISOString().split("T")[0];
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "Error", detail: "Failed to add meal. Try again.", life: 3000 });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="addMeal" class="form-grid mobile-form">
    <!-- Row 1: Meal Name -->
    <div class="form-row full">
      <div class="input-group full">
        <label class="input-label">Meal Name</label>
        <input 
          v-model="foodName"
          type="text"
          placeholder="Enter meal name"
          :disabled="isLoading"
        />
      </div>
    </div>

    <!-- Row 2: Calories -->
    <div class="form-row full">
      <div class="input-group full">
        <label class="input-label">Calories</label>
        <input 
          v-model.number="calories"
          type="number"
          min="0"
          placeholder="Calories"
          :disabled="isLoading"
        />
      </div>
    </div>

    <!-- Row 3: Protein -->
    <div class="form-row full">
      <div class="input-group full">
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

    <!-- Row 4: Meal Date -->
    <div class="form-row full">
      <div class="input-group full">
        <label class="input-label">Meal Date</label>
        <div class="input-wrapper">
          <input 
            v-model="date"
            type="date"
            :max="today"
            :disabled="isLoading"
          />
          <i class="pi pi-calendar calendar-icon"></i>
        </div>
      </div>
    </div>

    <!-- Row 5: Submit Button -->
    <div class="form-row full">
      <button 
        type="submit" 
        class="btn-submit"
        :disabled="isLoading"
      >
        {{ isLoading ? "Adding..." : "Add Meal" }}
      </button>
    </div>
  </form>
</template>

<style scoped>
form {
  font-family: "Geist", sans-serif;
  color: var(--foreground);
  margin-bottom: 20px;
}

.form-grid h1 {
  margin-bottom: 20px;
  font-size: 25px;
}

.input-label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: var(--foreground);
  margin-top:1rem;
  margin-left:0.5rem;
}

input[type="text"],
input[type="number"],
input[type="date"] {
  width: 100%;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: "Geist", sans-serif;
  padding: 0 0.75rem;
  background-color: var(--background);
  transition: border 0.2s ease, background 0.2s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: var(--primary);
}

/* Date picker wrapper */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input[type="date"] {
  width: 100%;
  height: 42px;
  padding-right: 2.5rem; 
  cursor: pointer;
}

.calendar-icon {
  position: absolute;
  right: 2rem;
  color: var(--muted-foreground);
  pointer-events: none;
}

/* Submit button */
.form-row button.btn-submit {
  width: 100%;
}

.btn-submit {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border: none;
  padding: 0.5rem;
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: "Geist", sans-serif;
  cursor: pointer;
  transition: background 0.25s ease;
  text-align: center;
  margin-top: 15px;
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
  margin-bottom: 10px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>