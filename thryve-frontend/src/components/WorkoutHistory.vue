<script setup>
import { ref } from "vue";
import api from "../utils/api";
import WorkoutEditModal from "./WorkoutEditModal.vue";
import { workouts, fetchWorkouts } from "../composables/useWorkouts.js";

const editingWorkout = ref(null);

const editWorkout = (workout) => {
  editingWorkout.value = { ...workout };
};

const deleteWorkout = async (id) => {
  try {
    await api.delete(`/workouts/${id}`);
    workouts.value = workouts.value.filter(w => w._id !== id);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

// fetch once on mount
fetchWorkouts();
</script>

<template>
  <div>
    <h3>Workout History</h3>
    <ul v-if="workouts.length">
      <li v-for="workout in workouts" :key="workout._id">
        {{ workout.type }} - {{ workout.duration }} min - {{ workout.calories }} cal -
        {{ workout.date ? new Date(workout.date).toLocaleDateString() : "No Date" }}
        <button @click="editWorkout(workout)">Edit</button>
        <button @click="deleteWorkout(workout._id)">Delete</button>
      </li>
    </ul>
    <p v-else>No workouts yet.</p>

    <WorkoutEditModal
      v-if="editingWorkout"
      :workout="editingWorkout"
      @close="editingWorkout = null"
    />
  </div>
</template>
