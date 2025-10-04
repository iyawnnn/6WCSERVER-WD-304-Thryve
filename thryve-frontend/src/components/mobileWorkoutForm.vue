<script setup>
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast"; 
import { workouts, addWorkout, fetchWorkouts } from "../composables/useWorkouts.js";
import { workoutOptions } from "../composables/useWorkoutOptions.js";
import { calculateCalories } from "../utils/calcCalories";
import { useAuthStore } from "../stores/auth";

const toast = useToast(); 

const auth = useAuthStore();
const userWeight = computed(() => auth.user?.weight);

const type = ref("");
const duration = ref("");
const date = ref(new Date().toLocaleDateString("en-CA")); 
const today = new Date().toLocaleDateString("en-CA");
const isLoading = ref(false);

const openPicker = (event) => {
  const input = event.target;
  if (input.showPicker) {
    input.showPicker(); 
  }
};

// calories calc
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

const addWorkoutHandler = async () => {
  if (!type.value) {
    toast.add({ severity: "warn", summary: "Missing Type", detail: "Please select a workout type.", life: 3000 });
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
  if (date.value > today) {
    toast.add({ severity: "warn", summary: "Invalid Date", detail: "Date cannot be in the future.", life: 3000 });
    return;
  }

  isLoading.value = true;

  try {
    const workoutData = {
      type: type.value.trim(),
      duration: Number(duration.value),
      calories: Number(calories.value),
      date: date.value,
    };

    console.log("Adding workout (mobile):", workoutData);

    const created = await addWorkout(workoutData);
    if (created && String(created._id).startsWith("local_")) {
      try { await fetchWorkouts(); } catch (e) { console.warn("Re-sync failed:", e); }
    }

    toast.add({ severity: "success", summary: "Workout Added", detail: "Your workout has been logged!", life: 3000 });

    // reset
    type.value = "";
    duration.value = "";
    date.value = new Date().toISOString().split("T")[0];

  } catch (error) {
    console.error("Add workout error (mobile):", error);
    toast.add({ severity: "error", summary: "Error", detail: "Could not add workout. Try again.", life: 4000 });
  } finally {
    isLoading.value = false;
  }
};
</script>


<template>
  <form @submit.prevent="addWorkoutHandler" class="mobile-form">
    <!-- Workout Type -->
    <div class="input-group">
      <label>Workout Type</label>
      <select v-model="type" :disabled="isLoading">
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
      <label>Duration (min)</label>
      <input 
        v-model.number="duration" 
        type="number" 
        min="1" 
        required 
        placeholder="Enter duration"
        :disabled="isLoading"
      />
    </div>

    <!-- Date -->
    <div class="input-wrapper">
      <input 
        v-model="date" 
        type="date" 
        :max="today"
        required 
        :disabled="isLoading"
        @click="openPicker($event)"
      />
      <i class="pi pi-calendar calendar-icon"></i>
    </div>


    <!-- Calories -->
    <div class="input-group">
      <label>Calories Burned</label>
      <input 
        :value="calories" 
        type="number" 
        readonly
        class="readonly"
      />
      <small v-if="calories === 0 && (type || duration)">
        Select workout type and duration to calculate calories
      </small>
    </div>

    <!-- Submit -->
    <div class="input-group">
      <button type="submit" :disabled="isLoading || calories === 0">
        {{ isLoading ? "Adding..." : "Add Workout" }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.mobile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: "Geist", sans-serif;
}

.input-group {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.35rem;
}

input, select, button {
  padding: 0.75rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  font-size: 1rem;
}

input.readonly {
  background: var(--muted);
  border: 1px dashed var(--border);
  font-weight: bold;
}

button {
  background: var(--primary);
  color: var(--primary-foreground);
  cursor: pointer;
  border: none;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

select {
  background: white; 
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem;
  font-size: 1rem;
  appearance: none; 
}

select:disabled {
  background: var(--muted);
  color: var(--muted-foreground);
  cursor: not-allowed;
}

option {
  background: var(--muted); 
  color: var(--foreground);
  padding: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input[type="date"] {
  width: 100%;
  padding-right: 2.5rem; 
}

.calendar-icon {
  position: absolute;
  right: 0.75rem;
  pointer-events: none;
  color: var(--muted-foreground);
}

</style>
