<script setup>
import { ref } from "vue";
import api from "../utils/api";
import { meals } from "../composables/useMeals.js";


const emit = defineEmits(["mealAdded"]);

const foodName = ref("");
const calories = ref(null);
const protein = ref(null);
const date = ref(new Date().toISOString().slice(0, 10));
const maxDate = new Date().toISOString().slice(0, 10);

const addMeal = async () => {
  try {
    const selectedDate = new Date(date.value);
    selectedDate.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (!foodName.value.trim()) throw new Error("Food name is required");
    if (calories.value < 0) throw new Error("Calories must be 0 or higher");
    if (protein.value < 0) throw new Error("Protein must be 0 or higher");
    if (selectedDate > todayDate)
      throw new Error("Date cannot be in the future");

    const res = await api.post("/meals", {
      foodName: foodName.value.trim(),
      calories: Number(calories.value),
      protein: Number(protein.value),
      date: date.value, 
    });

    meals.value.unshift(res.data);
    emit("mealAdded");

    // Reset form
    foodName.value = "";
    calories.value = null;
    protein.value = null;
    date.value = maxDate;
  } catch (err) {
    alert(err.message || "Failed to add meal");
    console.error(err.response?.data || err.message);
  }
};
</script>

<template>
  <form @submit.prevent="addMeal">
    <div class="mb-2">
      <input v-model="foodName" placeholder="Meal name" />
    </div>
    <div class="mb-2">
      <input
        v-model.number="calories"
        type="number"
        placeholder="Calories"
        min="0"
      />
    </div>
    <div class="mb-2">
      <input
        v-model.number="protein"
        type="number"
        placeholder="Protein (g)"
        min="0"
      />
    </div>
    <div class="mb-2">
      <input v-model="date" type="date" :max="maxDate" />
    </div>
    <button type="submit">Add Meal</button>
  </form>
</template>
