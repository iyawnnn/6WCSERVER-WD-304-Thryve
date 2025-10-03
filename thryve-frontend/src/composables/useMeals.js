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

export const deleteMeal = async (id) => {
  try {
    await api.delete(`/meals/${id}`);
    meals.value = meals.value.filter((m) => m._id !== id);
  } catch (err) {
    console.error("Failed to delete meal:", err);
    throw err;
  }
};