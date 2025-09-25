<template>
  <div class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content p-3">
        <h5>Edit Meal</h5>
        <form @submit.prevent="updateMeal">
          <div class="mb-2">
            <label class="form-label">Food Name</label>
            <input v-model="meal.foodName" class="form-control" required />
          </div>
          <div class="mb-2">
            <label class="form-label">Calories</label>
            <input
              v-model.number="meal.calories"
              type="number"
              class="form-control"
              min="0"
              required
            />
          </div>
          <div class="mb-2">
            <label class="form-label">Protein (g)</label>
            <input
              v-model.number="meal.protein"
              type="number"
              class="form-control"
              min="0"
            />
          </div>
          <div class="mb-2">
            <label class="form-label">Date</label>
            <input
              v-model="mealDate"
              type="date"
              class="form-control"
              :max="today"
              required
            />
          </div>
          <div class="d-flex justify-content-end">
            <button
              type="button"
              class="btn btn-secondary me-2"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../utils/api";
import { meals } from "../composables/useMeals.js";
import { ref, watch } from "vue";

export default {
  props: ["meal"],
  setup(props, { emit }) {
    const mealDate = ref(props.meal.date?.slice(0, 10) || "");

    watch(mealDate, (val) => {
      props.meal.date = val ? new Date(val).toISOString() : null;
    });

    const updateMeal = async () => {
      try {
        const res = await api.put(`/meals/${props.meal._id}`, props.meal);
        const index = meals.value.findIndex((m) => m._id === res.data._id);
        if (index !== -1) meals.value[index] = res.data;

        emit("close");
      } catch (err) {
        alert("Failed to update meal");
        console.error(err.response?.data || err.message);
      }
    };

    return { mealDate, updateMeal };
  },
};
</script>
