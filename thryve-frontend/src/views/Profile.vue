<template>
  <div class="profile container py-3">
    <h2>Profile Information</h2>
    <form @submit.prevent="saveProfile" class="mb-4">
      <!-- Age -->
      <div class="mb-3">
        <label class="form-label">Age</label>
        <input
          v-model.number="age"
          type="number"
          class="form-control"
          min="10"
          max="120"
        />
      </div>

      <!-- Weight -->
      <div class="mb-3">
        <label class="form-label">Weight</label>
        <div class="d-flex">
          <input
            v-model.number="weightDisplay"
            type="number"
            class="form-control me-2"
          />
          <select
            v-model="weightUnit"
            class="form-select"
            style="max-width: 100px"
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </div>
      </div>

      <!-- Height -->
      <div class="mb-3">
        <label class="form-label">Height</label>
        <div class="d-flex">
          <input
            v-model="heightDisplay"
            @input="formatHeight"
            type="text"
            class="form-control me-2"
            placeholder="e.g. 180 or 5'11"
          />
          <select
            v-model="heightUnit"
            class="form-select"
            style="max-width: 100px"
            @change="syncHeightDisplay"
          >
            <option value="cm">cm</option>
            <option value="ft">ft</option>
          </select>
        </div>
      </div>

      <button type="submit" class="btn btn-dark">Save Profile</button>
    </form>

    <!-- Daily Goals -->
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
import api from "@/utils/api";

export default {
  name: "Profile",
  data() {
    return {
      age: "",
      weight: "",
      weightUnit: "kg",
      weightDisplay: "", // what user sees and types

      height: "", // always in cm internally
      heightUnit: "cm",
      heightDisplay: "",

      dailyCaloriesGoal: null,
      dailyProteinGoal: null,
      dailyWorkoutMinutesGoal: null,
    };
  },
  async mounted() {
    try {
      const res = await api.get("/users/profile");

      this.age = res.data.age ?? "";
      this.weight = res.data.weight ?? "";
      this.weightDisplay = this.weight; // initialize display
      this.height = res.data.height ?? "";
      this.syncHeightDisplay();

      // fetch preferences for goals
      const prefRes = await api.get("/users/preferences");
      this.dailyCaloriesGoal = prefRes.data.dailyCaloriesGoal;
      this.dailyProteinGoal = prefRes.data.dailyProteinGoal;
      this.dailyWorkoutMinutesGoal = prefRes.data.dailyWorkoutMinutesGoal;
    } catch (err) {
      console.error(
        "Failed to load profile:",
        err.response?.data || err.message
      );
    }
  },
  methods: {
    // Weight conversions
    convertLbToKg(lb) {
      return lb * 0.453592;
    },
    convertKgToLb(kg) {
      return kg / 0.453592;
    },

    // Height conversions
    convertFtInToCm(ftIn) {
      const match = /^(\d{1,2})'(\d{1,2})$/.exec(ftIn);
      if (!match) return null;
      const feet = parseInt(match[1], 10);
      const inches = parseInt(match[2], 10);
      return Math.round((feet * 12 + inches) * 2.54);
    },
    convertCmToFtIn(cm) {
      const totalInches = Math.round(cm / 2.54);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return `${feet}'${inches}`;
    },

    // Sync height display when switching units
    syncHeightDisplay() {
      if (!this.height) {
        this.heightDisplay = "";
        return;
      }
      if (this.heightUnit === "ft") {
        this.heightDisplay = this.convertCmToFtIn(this.height);
      } else {
        this.heightDisplay = this.height.toString();
      }
    },

    // Handle typing in height input
    formatHeight() {
      if (this.heightUnit === "ft") {
        let val = this.heightDisplay.replace(/[^\d']/g, "");
        if (/^\d{1,2}$/.test(val)) val = val + "'";
        if (/^(\d{1,2})'(\d{1,2})$/.test(val)) {
          this.height = this.convertFtInToCm(val);
        }
        this.heightDisplay = val;
      } else {
        this.height = parseFloat(this.heightDisplay) || "";
      }
    },

    async saveProfile() {
      try {
        let heightCm = this.height;
        let weightKg = this.weightDisplay;

        if (this.heightUnit === "ft") {
          heightCm = this.convertFtInToCm(this.heightDisplay);
        }
        if (this.weightUnit === "lb") {
          weightKg = this.convertLbToKg(this.weightDisplay);
        }

        const payload = {
          age: this.age,
          weight: weightKg,
          height: heightCm,
        };

        await api.put("/users/profile", payload);
        alert("Profile updated!");
      } catch (err) {
        console.error(
          "Failed to update profile:",
          err.response?.data || err.message
        );
        alert("Failed to update profile. Try again.");
      }
    },

    async saveGoals() {
      try {
        const payload = {
          dailyCaloriesGoal: this.dailyCaloriesGoal,
          dailyProteinGoal: this.dailyProteinGoal,
          dailyWorkoutMinutesGoal: this.dailyWorkoutMinutesGoal,
        };
        await api.put("/users/preferences", payload);
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
