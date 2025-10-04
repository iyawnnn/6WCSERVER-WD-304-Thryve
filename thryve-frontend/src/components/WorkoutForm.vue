<script setup>
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";  
import { workouts, addWorkout, fetchWorkouts } from "../composables/useWorkouts.js";
import { workoutOptions } from "../composables/useWorkoutOptions.js";
import { calculateCalories } from "../utils/calcCalories";
import { useAuthStore } from "../stores/auth";
import CascadeSelect from "primevue/cascadeselect";
import DatePicker from "primevue/datepicker";

const toast = useToast();

const auth = useAuthStore();
const userWeight = computed(() => auth.user?.weight);

const type = ref(null);
const duration = ref("");
const date = ref(new Date());
const today = new Date();
const isLoading = ref(false);

const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const calories = computed(() => {
  if (!type.value || !duration.value || duration.value <= 0 || !userWeight.value) {
    return 0;
  }
  try {
    const workoutKey = type.value.name.replace(/\s|\(|\)/g, "");
    const result = calculateCalories(workoutKey, duration.value, userWeight.value);
    return isNaN(result) ? 0 : Math.round(result);
  } catch (error) {
    console.error("Calories calculation error:", error);
    return 0;
  }
});

const addWorkoutHandler = async () => {
  if (!type.value) {
    toast.add({ severity: "warn", summary: "Missing Data", detail: "Please select a workout type.", life: 3000 });
    return;
  }
  if (!duration.value || duration.value < 1) {
    toast.add({ severity: "warn", summary: "Invalid Duration", detail: "Duration must be 1 minute or higher.", life: 3000 });
    return;
  }
  if (!date.value) {
    toast.add({ severity: "warn", summary: "Missing Date", detail: "Please select a workout date.", life: 3000 });
    return;
  }
  if (stripTime(date.value) > stripTime(today)) {
    toast.add({ severity: "warn", summary: "Invalid Date", detail: "Date cannot be in the future.", life: 3000 });
    return;
  }

  isLoading.value = true;

  try {
    const workoutData = {
      type: type.value.name.trim(),
      duration: Number(duration.value),
      calories: Number(calories.value),
      date: `${date.value.getFullYear()}-${(date.value.getMonth() + 1).toString().padStart(2, "0")}-${date.value.getDate().toString().padStart(2, "0")}`,
    };

    console.log("Adding workout:", workoutData);

    const created = await addWorkout(workoutData);
    if (created && String(created._id).startsWith("local_")) {
      try { await fetchWorkouts(); } catch (e) { console.warn("Re-sync failed:", e); }
    }

    toast.add({ severity: "success", summary: "Workout Added", detail: "Your workout was saved successfully.", life: 3000 });

    // Reset form
    type.value = null;
    duration.value = "";
    date.value = new Date();

  } catch (error) {
    console.error("Add workout error:", error);
    toast.add({ severity: "error", summary: "Failed", detail: "Could not add workout. Try again.", life: 3000 });
  } finally {
    isLoading.value = false;
  }
};
</script>


<template>
  <form @submit.prevent="addWorkoutHandler" class="form-grid desktop-form">
    <!-- Row 1: Workout Type + Duration + Date -->
    <div class="form-row three-cols">
      <div class="input-group">
        <label class="input-label">Workout Type</label>
        <CascadeSelect 
          v-model="type" 
          :options="workoutOptions" 
          optionLabel="name" 
          optionGroupLabel="name" 
          :optionGroupChildren="['activities']" 
          class="w-full" 
          placeholder="Select Workout"
          :disabled="isLoading"
        />
      </div>
      <div class="input-group">
        <label class="input-label">Duration (min)</label>
        <input 
          v-model.number="duration" 
          type="number" 
          min="1" 
          required 
          placeholder="Enter duration"
          :disabled="isLoading"
        />
      </div>
      <div class="input-group">
        <label class="input-label">Workout Date</label>
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
    
    <!-- Row 2: Calories Burned -->
    <div class="form-row">
      <div class="input-group full">
        <label class="input-label">Calculated Calories Burned</label>
        <input 
          :value="calories" 
          type="number" 
          readonly 
          class="calories-output"
          :class="{ 'zero-calories': calories === 0 }"
        />
        <small v-if="calories === 0 && (type || duration)" class="calories-hint">
          Select workout type and duration to calculate calories
        </small>
      </div>
    </div>
    
    <!-- Row 3: Button -->
    <div class="form-row">
      <button 
        type="submit" 
        class="btn-submit"
        :disabled="isLoading || calories === 0"
      >
        {{ isLoading ? "Adding..." : "Add Workout" }}
      </button>
    </div>
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

:deep(.p-datepicker .p-inputtext) {
  width: 100% !important;
  height: 42px !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) 0 0 var(--radius) !important;
}

:deep(.p-datepicker .p-datepicker-trigger) {
  border: 1px solid var(--border) !important;
  border-left: none !important;
  border-radius: 0 var(--radius) var(--radius) 0 !important;
  height: 42px !important;
  background: var(--background) !important;
  cursor: pointer;
}

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
  grid-template-columns: repeat(3, 1fr); 
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  width: 100%; 
}

.calories-output {
  background-color: var(--muted) !important;     
  border: 1px dashed var(--border) !important;    
  color: var(--foreground);            
  font-weight: 600;                    
  cursor: default;                   
}

.calories-output:focus {
  outline: none;
  border-color: var(--border);
  box-shadow: none;
}

:deep(.p-datepicker .p-inputtext) {
  box-shadow: none !important;
}

.form-grid {
  transform: none !important;
}

.form-row.three-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.form-row.three-cols .input-group {
  min-width: 0; 
}

form.form-grid {
  width: 100%;
  box-sizing: border-box;
}

form .btn-submit {
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
