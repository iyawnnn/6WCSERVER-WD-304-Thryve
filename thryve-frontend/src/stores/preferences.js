import { defineStore } from "pinia";

export const usePreferencesStore = defineStore("preferences", {
  state: () => ({
    dailyCaloriesGoal: 2000,
    dailyProteinGoal: 100,
    dailyWorkoutMinutesGoal: 30,
  }),
  actions: {
    setGoals(goals) {
      Object.assign(this, goals);
    }
  }
});
