<script setup>
import { ref } from "vue";
import api from "../utils/api";
import { workouts } from "../composables/useWorkouts.js";

const type = ref("");
const duration = ref("");
const calories = ref("");
const date = ref(new Date().toISOString().split("T")[0]);

const today = date.value;

const addWorkout = async () => {
  if (!type.value.trim()) {
    alert("Please enter a workout type.");
    return;
  }
  if (!/^[A-Za-z\s\-]+$/.test(type.value.trim())) {
    alert("Workout type must contain only letters, spaces, or hyphens.");
    return;
  }
  if (!duration.value || duration.value < 1) {
    alert("Duration must be 1 minute or higher.");
    return;
  }
  if (!calories.value || calories.value < 1) {
    alert("Calories burned must be 1 or higher.");
    return;
  }
  if (!date.value) {
    alert("Please select a date.");
    return;
  }
  if (new Date(date.value) > new Date(today)) {
    alert("Date cannot be in the future.");
    return;
  }

  try {
    const res = await api.post("/workouts", {
      type: type.value.trim(),
      duration: Number(duration.value),
      calories: Number(calories.value),
      date: new Date(date.value),
    });

    // ✅ add to reactive workouts array
    workouts.value.unshift(res.data);

    type.value = "";
    duration.value = "";
    calories.value = "";
    date.value = today;
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Failed to add workout. Check your inputs.");
  }
};
</script>

<template>
  <form @submit.prevent="addWorkout">
    <div class="mb-2">
      <input v-model="type" placeholder="Workout type" required />
    </div>
    <div class="mb-2">
      <input v-model.number="duration" type="number" placeholder="Duration (min)" min="1" required />
    </div>
    <div class="mb-2">
      <input v-model.number="calories" type="number" placeholder="Calories burned" min="1" required />
    </div>
    <div class="mb-2">
      <input v-model="date" type="date" :max="today" required />
    </div>
    <button type="submit">Add Workout</button>
  </form>
</template>


<style scoped>
.calories-hint {
  color: var(--muted-foreground);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.zero-calories {
  border-color: var(--destructive) !important;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
input[type="date"],
:deep(.p-cascadeselect),
:deep(.p-inputtext),
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
input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: none !important;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-datepicker .p-inputtext:enabled:focus),
:deep(.p-cascadeselect.p-focus),
:deep(.p-cascadeselect:focus),
:deep(.p-cascadeselect:focus-within) {
  outline: none !important;
  border-color: var(--primary) !important;
  box-shadow: none !important;
}

/* Make DatePicker input flexible */
:deep(.p-datepicker .p-inputtext) {
  width: 100% !important;
  height: 42px !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) 0 0 var(--radius) !important;
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
/* Make the submit button span full width */
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
}

.btn-submit:hover {
  background-color: var(--primary-hover);
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

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.button-wrap {
  display: flex;
  align-items: flex-end;
}

.w-full {
  width: 100%;
}

/* Override PrimeVue DatePicker CSS variables to match your design */
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

/* Focus states */
:deep(.p-datepicker:focus-within .p-inputtext),
:deep(.p-datepicker:focus-within .p-datepicker-dropdown) {
  border-color: var(--primary) !important;
}

:deep(.p-datepicker-dropdown:hover) {
  background: var(--background) !important;
  border-color: var(--border) !important;
}

:deep(.p-datepicker:focus-within .p-datepicker-dropdown:hover) {
  border-color: var(--primary) !important;
}

.form-row.three-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 equal-width columns */
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  width: 100%; /* ensures each fills its grid cell */
}

.calories-output {
  background-color: var(--muted) !important;     
  border: 1px dashed var(--border) !important;    
  color: var(--foreground);            
  font-weight: 600;                    
  cursor: default;                   
}

/* remove focus ring */
.calories-output:focus {
  outline: none;
  border-color: var(--border);
  box-shadow: none;
}

/* Remove shadow just for DatePicker input */
:deep(.p-datepicker .p-inputtext) {
  box-shadow: none !important;
}




</style>






