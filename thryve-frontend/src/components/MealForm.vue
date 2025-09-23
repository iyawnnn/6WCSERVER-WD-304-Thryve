<script setup>
import { ref } from "vue";
import api from "../utils/api";
import { meals } from "../composables/useMeals.js";


const foodName = ref("");
const calories = ref("");
const date = ref(new Date().toISOString().split("T")[0]); // today

const today = date.value;

const addMeal = async () => {
  try {
    if (!foodName.value.trim()) {
      alert("Please enter a food name.");
      return;
    }

    if (!calories.value || calories.value < 0) {
      alert("Calories must be 0 or higher.");
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

    const res = await api.post("/meals", {
      foodName: foodName.value.trim(),
      calories: Number(calories.value),
      date: new Date(date.value),
    });

    // ✅ Add new meal directly to meals array
    meals.value.unshift(res.data);

    // Reset form
    foodName.value = "";
    calories.value = "";
    date.value = today;
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Failed to add meal.");
  }
};
</script>

<template>
  <form @submit.prevent="addMeal">
    <div class="mb-2">
      <input v-model="foodName" placeholder="Meal name" required />
    </div>
    <div class="mb-2">
      <input v-model.number="calories" type="number" placeholder="Calories" min="1" required />
    </div>
    <div class="mb-2">
      <input v-model="date" type="date" :max="today" required />
    </div>
    <button type="submit">Add Meal</button>
  </form>
</template>
