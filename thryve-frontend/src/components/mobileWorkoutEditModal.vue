<script setup>
import { ref, computed, onMounted } from "vue";
import { workoutOptions } from "../composables/useWorkoutOptions.js";
import { calculateCalories } from "../utils/calcCalories";
import { useAuthStore } from "../stores/auth";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  workout: {
    type: Object,
    required: true
  },
  isVisible: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:isVisible', 'workoutUpdated']);

const auth = useAuthStore();
const userWeight = computed(() => auth.user?.weight);
const toast = useToast(); 

const type = ref("");
const duration = ref("");
const date = ref("");
const today = new Date().toLocaleDateString("en-CA");
const isLoading = ref(false);

// Initialize form with workout data
onMounted(() => {
  if (props.workout) {
    type.value = props.workout.type || "";
    duration.value = props.workout.duration || "";
    date.value = props.workout.date || new Date().toLocaleDateString("en-CA");
  }
});

const openPicker = (event) => {
  const input = event.target;
  if (input.showPicker) {
    input.showPicker(); 
  }
};

// Calories calculation
const calories = computed(() => {
  if (!type.value || !duration.value || duration.value <= 0 || !userWeight.value) {
    return 0;
  }
  try {
    const workoutKey = type.value.replace(/\s|\(|\)/g, "");
    const result = calculateCalories(workoutKey, duration.value, userWeight.value);
    return isNaN(result) ? 0 : Math.round(result);
  } catch (error) {
    console.error("Calories calculation error:", error);
    return 0;
  }
});

const updateWorkoutHandler = async () => {
  if (!type.value) return toast.add({ severity: "warn", summary: "Missing Data", detail: "Please select a workout type.", life: 2500 });
  if (!duration.value || duration.value < 1) return toast.add({ severity: "warn", summary: "Invalid Duration", detail: "Duration must be 1 minute or higher.", life: 2500 });
  if (!date.value) return toast.add({ severity: "warn", summary: "Missing Data", detail: "Please select a workout date.", life: 2500 });
  if (date.value > today) return toast.add({ severity: "error", summary: "Invalid Date", detail: "Date cannot be in the future.", life: 2500 });

  isLoading.value = true;

  try {
    const workoutData = {
      id: props.workout._id,
      type: type.value.trim(),
      duration: Number(duration.value),
      calories: Number(calories.value),
      date: date.value,
    };

    console.log("Updating workout:", workoutData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate API

    emit("workoutUpdated", workoutData);
    emit("update:isVisible", false);

    toast.add({
      severity: "success",
      summary: "Workout Updated",
      detail: "Your workout has been updated successfully.",
      life: 2000
    });

  } catch (error) {
    console.error("Update workout error:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Could not update workout. Try again.",
      life: 2500
    });
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => emit("update:isVisible", false);
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Edit Workout</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="updateWorkoutHandler" class="mobile-form">
        <!-- Workout Type -->
        <div class="input-group">
          <label class="input-label">Workout Type</label>
          <select 
            v-model="type" 
            :disabled="isLoading"
            class="workout-select"
          >
            <option value="" disabled>Select Workout</option>
            <optgroup 
              v-for="group in workoutOptions" 
              :label="group.name" 
              :key="group.name"
            >
              <option 
                v-for="activity in group.activities" 
                :key="activity.name" 
                :value="activity.name"
              >
                {{ activity.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Duration -->
        <div class="input-group">
          <label class="input-label">Duration (min)</label>
          <input 
            v-model.number="duration" 
            type="number" 
            min="1" 
            required 
            placeholder="Enter duration"
            :disabled="isLoading"
            class="mobile-input"
          />
        </div>

        <!-- Workout Date -->
        <div class="input-group">
          <label class="input-label">Workout Date</label>
          <div class="input-wrapper">
            <input 
              v-model="date" 
              type="date" 
              :max="today"
              required 
              :disabled="isLoading"
              class="mobile-input"
              @click="openPicker($event)"
            />
            <div class="calendar-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Calories Burned -->
        <div class="input-group">
          <label class="input-label">Calculated Calories Burned</label>
          <input 
            :value="calories" 
            type="number" 
            readonly 
            class="calories-output mobile-input"
            :class="{ 'zero-calories': calories === 0 }"
          />
          <small v-if="calories === 0 && (type || duration)" class="calories-hint">
            Select workout type and duration to calculate calories
          </small>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal" :disabled="isLoading">
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
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--card);
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--foreground);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: var(--muted-foreground);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--muted);
  color: var(--foreground);
}

.mobile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0 1.5rem 1.5rem;
  font-family: "Geist", sans-serif;
}

.input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--foreground);
}

.mobile-input,
.workout-select {
  width: 100%;
  height: 48px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: "Geist", sans-serif;
  padding: 0 0.75rem;
  box-sizing: border-box;
  background-color: var(--muted);
  transition: all 0.2s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  color: var(--foreground);
}

.workout-select {
  background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 0.65rem;
  padding-right: 2.5rem;
}

.mobile-input:focus,
.workout-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb, 59, 130, 246), 0.1);
  background-color: var(--background);
}

.mobile-input:disabled,
.workout-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .mobile-input {
  padding-right: 2.5rem;
}

.calendar-icon {
  position: absolute;
  right: 0.75rem;
  pointer-events: none;
  color: var(--muted-foreground);
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.zero-calories {
  border-color: var(--destructive) !important;
}

.calories-hint {
  color: var(--muted-foreground);
  font-size: 0.8rem;
  margin-top: 0.5rem;
  line-height: 1.3;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Geist", sans-serif;
}

.btn-cancel {
  background: var(--muted);
  color: var(--foreground);
  border: 1px solid var(--border);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--muted-hover);
}

.btn-submit {
  background: var(--primary);
  color: var(--primary-foreground);
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-submit:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .workout-select {
    background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23ccc' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
  }
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1.25rem 1.25rem 0;
  }
  
  .modal-title {
    font-size: 1.35rem;
  }
  
  .mobile-form {
    padding: 0 1.25rem 1.25rem;
    gap: 1rem;
  }
  
  .mobile-input,
  .workout-select {
    height: 44px;
    font-size: 16px;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-actions button {
    padding: 0.875rem 1rem;
  }
}

@media (max-width: 360px) {
  .modal-header {
    padding: 1rem 1rem 0;
  }
  
  .mobile-form {
    padding: 0 1rem 1rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
}
</style>