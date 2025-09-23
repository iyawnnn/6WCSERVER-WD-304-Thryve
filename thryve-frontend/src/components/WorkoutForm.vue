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
