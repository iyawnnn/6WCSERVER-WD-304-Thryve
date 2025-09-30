import { ref } from "vue";
import api from "../utils/api";

export const workouts = ref([]);

export const fetchWorkouts = async () => {
  try {
    const res = await api.get("/workouts");
    workouts.value = res.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};
