// src/composables/useMeals.js
import { ref } from "vue";
import api from "../utils/api";

export const meals = ref([]);

export const fetchMeals = async () => {
  try {
    const res = await api.get("/meals");
    meals.value = res.data;
  } catch (err) {
    console.error("Failed to fetch meals:", err.response?.data || err.message);
  }
};
