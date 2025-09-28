<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <div class="profile container py-3">
      <div class="page-header">
        <button @click="toggleSidebar" class="sidebar-toggle">
          <i class="bi bi-layout-sidebar"></i>
        </button>
        <div class="separator"></div>
        <span class="page-title">Profile</span>
      </div>

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
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
import api from "@/utils/api";

// Profile state
const age = ref("");
const weight = ref("");
const weightDisplay = ref("");
const weightUnit = ref("kg");

const height = ref(""); // stored internally in cm
const heightDisplay = ref("");
const heightUnit = ref("cm");

// Daily goals
const dailyCaloriesGoal = ref(null);
const dailyProteinGoal = ref(null);
const dailyWorkoutMinutesGoal = ref(null);

// Weight conversions
const convertLbToKg = (lb) => lb * 0.453592;
const convertKgToLb = (kg) => kg / 0.453592;

// Height conversions
const convertFtInToCm = (ftIn) => {
  const match = /^(\d{1,2})'(\d{1,2})$/.exec(ftIn);
  if (!match) return null;
  const feet = parseInt(match[1], 10);
  const inches = parseInt(match[2], 10);
  return Math.round((feet * 12 + inches) * 2.54);
};

const convertCmToFtIn = (cm) => {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}`;
};

// Sync height display when switching units
const syncHeightDisplay = () => {
  if (!height.value) {
    heightDisplay.value = "";
    return;
  }
  if (heightUnit.value === "ft") {
    heightDisplay.value = convertCmToFtIn(height.value);
  } else {
    heightDisplay.value = height.value.toString();
  }
};

// Handle typing in height input
const formatHeight = () => {
  if (heightUnit.value === "ft") {
    let val = heightDisplay.value.replace(/[^\d']/g, "");
    if (/^\d{1,2}$/.test(val)) val = val + "'";
    if (/^(\d{1,2})'(\d{1,2})$/.test(val)) {
      height.value = convertFtInToCm(val);
    }
    heightDisplay.value = val;
  } else {
    height.value = parseFloat(heightDisplay.value) || "";
  }
};

// Load profile on mount
onMounted(async () => {
  try {
    const res = await api.get("/users/profile");
    age.value = res.data.age ?? "";
    weight.value = res.data.weight ?? "";
    weightDisplay.value = weight.value;
    height.value = res.data.height ?? "";
    syncHeightDisplay();

    const prefRes = await api.get("/users/preferences");
    dailyCaloriesGoal.value = prefRes.data.dailyCaloriesGoal;
    dailyProteinGoal.value = prefRes.data.dailyProteinGoal;
    dailyWorkoutMinutesGoal.value = prefRes.data.dailyWorkoutMinutesGoal;
  } catch (err) {
    console.error("Failed to load profile:", err.response?.data || err.message);
  }
});

// Save profile
const saveProfile = async () => {
  try {
    let heightCm = height.value;
    let weightKg = weightDisplay.value;

    if (heightUnit.value === "ft") heightCm = convertFtInToCm(heightDisplay.value);
    if (weightUnit.value === "lb") weightKg = convertLbToKg(weightDisplay.value);

    await api.put("/users/profile", {
      age: age.value,
      weight: weightKg,
      height: heightCm,
    });
    alert("Profile updated!");
  } catch (err) {
    console.error("Failed to update profile:", err.response?.data || err.message);
    alert("Failed to update profile. Try again.");
  }
};

// Save goals
const saveGoals = async () => {
  try {
    await api.put("/users/preferences", {
      dailyCaloriesGoal: dailyCaloriesGoal.value,
      dailyProteinGoal: dailyProteinGoal.value,
      dailyWorkoutMinutesGoal: dailyWorkoutMinutesGoal.value,
    });
    alert("Goals updated!");
  } catch (err) {
    console.error("Failed to save preferences:", err.response?.data || err.message);
    alert("Failed to update goals. Try again.");
  }
};
</script>

<style scoped>
</style>
