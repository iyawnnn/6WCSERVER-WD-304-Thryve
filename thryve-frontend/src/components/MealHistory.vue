<script setup>
import { ref, onMounted } from "vue";
import api from "../utils/api"; // ✅ important!
import { meals, fetchMeals } from "../composables/useMeals.js";
import MealEditModal from "./MealEditModal.vue";

const editingMeal = ref(null);

const editMeal = (meal) => {
  editingMeal.value = { ...meal }; 
};

const deleteMeal = async (id) => {
  try {
    await api.delete(`/meals/${id}`);
    // Remove from reactive array
    meals.value = meals.value.filter((m) => m._id !== id);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

onMounted(fetchMeals);
</script>


<template>
  <div>
    <h2>Meal History</h2>
    <ul>
      <li v-for="meal in meals" :key="meal._id">
        {{ meal.foodName }} - {{ meal.calories }} cal - {{ new Date(meal.date).toLocaleDateString() }}
        <button @click="editMeal(meal)">Edit</button>
        <button @click="deleteMeal(meal._id)">Delete</button>
      </li>
    </ul>

    <MealEditModal
      v-if="editingMeal"
      :meal="editingMeal"
      @close="editingMeal = null"
      @updated="() => {}"
    />
  </div>
</template>
