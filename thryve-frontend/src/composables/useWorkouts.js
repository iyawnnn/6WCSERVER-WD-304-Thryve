import { ref } from "vue";
import api from "../utils/api";

export const workouts = ref([]);

export const fetchWorkouts = async () => {
  try {
    const response = await api.get("/workouts");
    workouts.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch workouts:", error);
    workouts.value = [];
  }
};

const makeLocalId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const addWorkout = async (workoutData) => {
  try {
    const response = await api.post("/workouts", workoutData);
    console.log("Workout response data:", response && response.data);

    // If server returned a created object, use it. Otherwise build an optimistic entry.
    let created = response && response.data && typeof response.data === "object"
      ? { ...response.data }
      : null;

    if (!created) {
      // backend didn't return an object — create a safe optimistic item
      created = {
        _id: makeLocalId(),
        type: workoutData.type ?? "Unknown",
        duration: Number(workoutData.duration ?? 0),
        calories: Number(workoutData.calories ?? 0),
        // normalize date to ISO so parsing in other components is safe
        date: (workoutData.date && new Date(workoutData.date).toISOString()) || new Date().toISOString(),
        // optional flag to help debugging / reconciliation
        _optimistic: true,
      };
      // append to local state (optimistic update)
      workouts.value = Array.isArray(workouts.value) ? [...workouts.value, created] : [created];

      // attempt to re-sync from server so we won't keep optimistic IDs
      try {
        await fetchWorkouts();
      } catch (err) {
        console.warn("Failed to re-sync after optimistic add:", err);
      }
    } else {
      // ensure _id exists
      if (!created._id && created.id) created._id = created.id;
      // normalize numeric fields and date string
      created.duration = Number(created.duration || workoutData.duration || 0);
      created.calories = Number(created.calories || workoutData.calories || 0);
      if (created.date instanceof Date) {
        created.date = created.date.toISOString();
      } else if (typeof created.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(created.date)) {
        created.date = new Date(created.date + "T00:00:00").toISOString();
      } else if (!created.date) {
        created.date = new Date().toISOString();
      }

      workouts.value = Array.isArray(workouts.value) ? [...workouts.value, created] : [created];
    }

    return created;
  } catch (error) {
    console.error("Failed to add workout:", error);
    throw error;
  }
};

export const updateWorkout = async (id, workoutData) => {
  try {
    const response = await api.put(`/workouts/${id}`, workoutData);
    const updated = response.data;
    workouts.value = workouts.value.map((w) => (w._id === id ? updated : w));
    return updated;
  } catch (error) {
    console.error("Failed to update workout:", error);
    throw error;
  }
};

export const deleteWorkout = async (id) => {
  try {
    await api.delete(`/workouts/${id}`);
    workouts.value = workouts.value.filter((w) => w._id !== id);
    console.log("Workout deleted, remaining workouts:", workouts.value);
  } catch (error) {
    console.error("Failed to delete workout:", error);
    throw error;
  }
};
