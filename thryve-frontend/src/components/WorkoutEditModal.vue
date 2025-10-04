<script setup>
import { ref, computed } from "vue";
import { workouts, updateWorkout } from "../composables/useWorkouts.js";
import { workoutOptions } from "../composables/useWorkoutOptions.js";
import { calculateCalories } from "../utils/calcCalories";
import { useAuthStore } from "../stores/auth";

// PrimeVue
import CascadeSelect from "primevue/cascadeselect";
import DatePicker from "primevue/datepicker";
import { useToast } from "primevue/usetoast"; 

const toast = useToast(); 

const auth = useAuthStore();
const userWeight = computed(() => auth.user?.weight);

const props = defineProps(["workout"]);
const emit = defineEmits(["close"]);

const today = new Date();
const isLoading = ref(false);

// Initialize form data
const type = ref(null);
const duration = ref(props.workout.duration || 0);
const date = ref(props.workout.date ? new Date(props.workout.date) : new Date());

// Find the initial workout type
if (props.workout.type) {
  const decodedType = decodeURIComponent(props.workout.type);
  type.value =
    workoutOptions.flatMap((g) => g.activities).find((a) => a.name === decodedType) || null;
}

// Compute calories reactively
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

const updateWorkoutHandler = async () => {
  if (!type.value) {
    toast.add({ severity: "warn", summary: "Validation", detail: "Please select a workout type.", life: 3000 });
    return;
  }

  if (!duration.value || duration.value < 1) {
    toast.add({ severity: "warn", summary: "Validation", detail: "Duration must be at least 1 minute.", life: 3000 });
    return;
  }

  if (!date.value) {
    toast.add({ severity: "warn", summary: "Validation", detail: "Please select a date.", life: 3000 });
    return;
  }

  if (date.value > today) {
    toast.add({ severity: "warn", summary: "Validation", detail: "Date cannot be in the future.", life: 3000 });
    return;
  }

  isLoading.value = true;

  try {
    const workoutData = {
      type: type.value.name.trim(),
      duration: Number(duration.value),
      calories: Number(calories.value),
      date: `${date.value.getFullYear()}-${(date.value.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.value.getDate().toString().padStart(2, "0")}`,
    };

    await updateWorkout(props.workout._id, workoutData);

    toast.add({
      severity: "success",
      summary: "Workout Updated",
      detail: "Your workout has been successfully updated.",
      life: 3000,
    });

    emit("close");
  } catch (error) {
    console.error("Update error:", error);

    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: "Something went wrong while updating your workout.",
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
        <h5>Edit Workout</h5>
        <form @submit.prevent="updateWorkoutHandler" class="form-grid">
          <!-- Form fields remain the same -->
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
            <button 
              type="submit" 
              class="btn-submit"
              :disabled="isLoading || calories === 0"
            >
              {{ isLoading ? "Updating..." : "Update Workout" }}
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
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
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
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
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
:deep(.p-cascadeselect),
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
  box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
}

/* Readonly Calories */
.calories-output {
  background: var(--muted);
  color: var(--foreground);
  font-weight: 500;
  cursor: not-allowed;
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

/* Remove shadow just for DatePicker input */
:deep(.p-datepicker .p-inputtext) {
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

:deep(.p-cascadeselect) {
  width: 100%;
  height: 42px; 
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

:deep(.p-cascadeselect .p-inputtext) {
  height: 40px !important;
  border: none !important;
  padding: 0.65rem 0.9rem;
  font-size: 0.95rem;
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

@media (max-width: 600px) {
  .form-row.three-cols > .input-group {
    flex: 1 1 100%;
  }
}
</style>

