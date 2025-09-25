<template>
  <div class="profile container py-3">
    <h2>Daily Goals</h2>
    <form @submit.prevent="saveGoals">
      <div class="mb-3">
        <label class="form-label">Calories Target</label>
        <input
          v-model.number="dailyCaloriesGoal"
          type="number"
          class="form-control"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Protein Target (g)</label>
        <input
          v-model.number="dailyProteinGoal"
          type="number"
          class="form-control"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Workout Minutes Target</label>
        <input
          v-model.number="dailyWorkoutMinutesGoal"
          type="number"
          class="form-control"
        />
      </div>
      <button type="submit" class="btn btn-primary">Save Goals</button>
    </form>
  </div>
</template>

<script>
import api from "@/utils/api"; // path to your utils folder

export default {
  name: "Profile",
  data() {
    return {
      dailyCaloriesGoal: 2000,
      dailyProteinGoal: 100,
      dailyWorkoutMinutesGoal: 30,
    };
  },
  async mounted() {
    try {
      const res = await api.get("/users/preferences");
      this.dailyCaloriesGoal = res.data.dailyCaloriesGoal ?? 2000;
      this.dailyProteinGoal = res.data.dailyProteinGoal ?? 100;
      this.dailyWorkoutMinutesGoal =
        res.data.dailyWorkoutMinutesGoal ?? 30;
    } catch (err) {
      console.error(
        "Failed to load preferences:",
        err.response?.data || err.message
      );
    }
  },
  methods: {
    async saveGoals() {
      try {
        const payload = {
          dailyCaloriesGoal: this.dailyCaloriesGoal,
          dailyProteinGoal: this.dailyProteinGoal,
          dailyWorkoutMinutesGoal: this.dailyWorkoutMinutesGoal,
        };

        await api.put("/users/preferences", payload);

        // Emit event so Dashboard can refresh
        this.$emit("goals-updated");

        alert("Goals updated!");
      } catch (err) {
        console.error(
          "Failed to save preferences:",
          err.response?.data || err.message
        );
        alert("Failed to update goals. Try again.");
      }
    },
  },
};
</script>


<style scoped>
.profile {
  max-width: 500px;
  margin: auto;
}
</style>
