<template>
  <div class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content p-3">
        <h5>Edit Workout</h5>
        <form @submit.prevent="updateWorkout">
          <div class="mb-2">
            <label class="form-label">Workout Type</label>
            <input v-model="workout.type" class="form-control" required />
          </div>
          <div class="mb-2">
            <label class="form-label">Duration (minutes)</label>
            <input v-model.number="workout.duration" type="number" min="1" class="form-control" required />
          </div>
          <div class="mb-2">
            <label class="form-label">Calories Burned</label>
            <input v-model.number="workout.calories" type="number" min="1" class="form-control" required />
          </div>
          <div class="mb-2">
            <label class="form-label">Date</label>
            <input v-model="workoutDate" type="date" :max="today" class="form-control" required />
          </div>
          <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-secondary me-2" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import api from "../utils/api";
import { workouts } from "../composables/useWorkouts.js"; // import reactive array

export default {
  props: ["workout"],
  setup(props, { emit }) {
    const today = new Date().toISOString().split("T")[0];
    const workoutDate = ref(props.workout.date?.slice(0, 10) || today);

    // Sync date back to workout object
    watch(workoutDate, (val) => {
      props.workout.date = val ? new Date(val).toISOString() : null;
    });

    const updateWorkout = async () => {
      // --- Validation ---
      if (!props.workout.type.trim()) {
        alert("Workout type is required.");
        return;
      }
      if (!/^[A-Za-z\s\-]+$/.test(props.workout.type.trim())) {
        alert("Workout type must contain only letters, spaces, or hyphens.");
        return;
      }
      if (!props.workout.duration || props.workout.duration < 1) {
        alert("Duration must be 1 minute or higher.");
        return;
      }
      if (!props.workout.calories || props.workout.calories < 1) {
        alert("Calories burned must be 1 or higher.");
        return;
      }
      if (!props.workout.date) {
        alert("Please select a date.");
        return;
      }
      if (new Date(props.workout.date) > new Date(today)) {
        alert("Date cannot be in the future.");
        return;
      }

      try {
        const res = await api.put(`/workouts/${props.workout._id}`, props.workout);

        // ✅ Update the reactive workouts array instantly
        const index = workouts.value.findIndex(w => w._id === props.workout._id);
        if (index !== -1) workouts.value[index] = res.data;

        emit("close");
      } catch (err) {
        console.error(err.response?.data || err.message);
        alert("Failed to update workout. Check your inputs.");
      }
    };

    return { workoutDate, updateWorkout, today };
  },
};
</script>
