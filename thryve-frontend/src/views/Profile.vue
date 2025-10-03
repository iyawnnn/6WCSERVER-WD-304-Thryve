<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <div class="profile">
      <!-- Page header -->
      <div class="page-header">
        <!-- Sidebar toggle button -->
        <button @click="toggleSidebar" class="sidebar-toggle">
          <i class="bi bi-layout-sidebar"></i>
        </button>
        <div class="separator"></div>
        <span class="page-title">Profile</span>
      </div>

      <div class="profile-grid">
        <!-- Left: hero + stats -->
        <div class="profile-left">
          <div class="card hero-card">
            <div class="hero-info">
              <!-- Avatar -->
              <!-- Avatar -->
              <div class="avatar-wrap">
                <img
                  :src="avatarPreview || defaultAvatar"
                  alt="Avatar"
                  class="avatar"
                />
              </div>

              <!-- Name + Meta -->
              <div class="hero-meta">
                <h3 class="hero-name">{{ userName || "Your Name" }}</h3>

                <!-- Stats -->
                <div class="hero-stats">
                  <div class="stat">
                    <span class="stat-label">BMI</span>
                    <span class="stat-value">{{ bmi ?? "—" }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">BMR</span>
                    <span class="stat-value">
                      {{ bmr ?? "—" }} <span class="unit">kcal</span>
                    </span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Daily Rec.</span>
                    <span class="stat-value">
                      {{ recommendedCalories ?? "—" }}
                      <span class="unit">kcal</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: profile form & goals side by side -->
        <div class="profile-sections">
          <!-- Profile Information -->
          <div class="card p-3">
            <h4 class="mb-3">Profile Information</h4>
            <form @submit.prevent="saveProfile" class="form-grid">
              <!-- Age -->
              <div class="form-group">
                <label class="form-label">Age</label>
                <input
                  v-model.number="age"
                  type="number"
                  min="10"
                  max="120"
                  class="form-control"
                />
              </div>

              <!-- Weight -->
              <div class="form-group span-2">
                <label class="form-label">Weight</label>
                <div class="inline-inputs">
                  <input
                    v-model.number="weightDisplay"
                    type="number"
                    class="form-control"
                  />
                  <select v-model="weightUnit" class="form-control unit-select">
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>

              <!-- Height -->
              <div class="form-group span-2">
                <label class="form-label">Height</label>
                <div class="inline-inputs">
                  <input
                    v-model="heightDisplay"
                    @input="formatHeight"
                    type="text"
                    placeholder="e.g. 180 or 5'11"
                    class="form-control"
                  />
                  <select v-model="heightUnit" class="form-control unit-select">
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>

              <div class="form-group span-2">
                <button type="submit" class="btn btn-primary">
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          <!-- Goals -->
          <div class="card p-3">
            <h4 class="mb-3">Daily Goals</h4>
            <form @submit.prevent="saveGoals" class="form-grid">
              <div class="form-group">
                <label class="form-label">Calories Target</label>
                <input
                  v-model.number="dailyCaloriesGoal"
                  type="number"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Protein Target (g)</label>
                <input
                  v-model.number="dailyProteinGoal"
                  type="number"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Workout Minutes Target</label>
                <input
                  v-model.number="dailyWorkoutMinutesGoal"
                  type="number"
                  class="form-control"
                />
              </div>
              <div class="form-group span-3">
                <button type="submit" class="btn btn-primary">
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
import api from "@/utils/api";

/* ---------- profile state ---------- */
const userName = ref("");
const age = ref(null);
const gender = ref("");
const activityLevel = ref("sedentary");

const weightDisplay = ref(""); // shown in chosen unit
const weightUnit = ref("kg");

const height = ref(""); // internal cm
const heightDisplay = ref("");
const heightUnit = ref("cm");

const defaultAvatar = "https://i.pravatar.cc/40?img=12";
const avatarFile = ref(null);

/* goals & quick logs */
const dailyCaloriesGoal = ref(null);
const dailyProteinGoal = ref(null);
const dailyWorkoutMinutesGoal = ref(null);
const dailyCaloriesConsumed = ref(0); // quick local log to demo progress

/* conversions */
const convertLbToKg = (lb) => lb * 0.453592;
const convertKgToLb = (kg) => kg / 0.453592;
const convertFtInToCm = (ftIn) => {
  const match = /^(\d{1,2})'(\d{1,2})$/.exec(ftIn);
  if (!match) return null;
  const feet = parseInt(match[1], 10);
  const inches = parseInt(match[2], 10);
  return Math.round((feet * 12 + inches) * 2.54);
};
const convertCmToFtIn = (cm) => {
  if (!cm && cm !== 0) return "";
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}`;
};

/* unit sync */
const syncHeightDisplay = () => {
  if (!height.value) {
    heightDisplay.value = "";
    return;
  }
  if (heightUnit.value === "ft") {
    heightDisplay.value = convertCmToFtIn(height.value);
  } else {
    heightDisplay.value = String(height.value);
  }
};

/* typing in height input */
const formatHeight = () => {
  if (heightUnit.value === "ft") {
    let val = heightDisplay.value.replace(/[^\d']/g, "");
    // if only digits typed, add a trailing single quote for UX
    if (/^\d{1,2}$/.test(val)) val = val + "'";
    if (/^(\d{1,2})'(\d{1,2})$/.test(val)) {
      const cm = convertFtInToCm(val);
      if (cm) height.value = cm;
    }
    heightDisplay.value = val;
  } else {
    const parsed = parseFloat(heightDisplay.value);
    height.value = !isNaN(parsed) ? parsed : "";
  }
};

/* computed numbers for UI */
const weightKg = computed(() => {
  const raw = parseFloat(weightDisplay.value);
  if (isNaN(raw) || raw <= 0) return null;
  return weightUnit.value === "lb" ? convertLbToKg(raw) : raw;
});
const heightCm = computed(() => {
  if (heightUnit.value === "ft") {
    const cm = convertFtInToCm(heightDisplay.value);
    return cm || null;
  }
  const parsed = parseFloat(heightDisplay.value);
  return !isNaN(parsed) && parsed > 0 ? parsed : height.value || null;
});
const bmi = computed(() => {
  if (!weightKg.value || !heightCm.value) return null;
  const val = weightKg.value / (heightCm.value / 100) ** 2;
  return Math.round(val * 10) / 10;
});
const bmr = computed(() => {
  if (!weightKg.value || !heightCm.value || !age.value || !gender) return null;
  // Mifflin-St Jeor
  const w = weightKg.value;
  const h = heightCm.value;
  const a = Number(age.value);
  if (gender === "male") return Math.round(10 * w + 6.25 * h - 5 * a + 5);
  return Math.round(10 * w + 6.25 * h - 5 * a - 161);
});
const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};
const recommendedCalories = computed(() => {
  if (!bmr.value) return null;
  return Math.round(
    bmr.value * (activityMultipliers[activityLevel.value] || 1.2)
  );
});

/* calories progress for circular chart */
const caloriesProgress = computed(() => {
  if (!dailyCaloriesGoal.value || dailyCaloriesGoal.value <= 0) return 0;
  const pct = Math.round(
    (dailyCaloriesConsumed.value / dailyCaloriesGoal.value) * 100
  );
  return Math.min(100, Math.max(0, pct));
});

/* ---------- lifecycle: load profile ---------- */
onMounted(async () => {
  try {
    const res = await api.get("/users/profile");
    const data = res.data || {};
    userName.value = data.name || "";
    age.value = data.age ?? null;
    gender.value = data.gender ?? "";
    // store weight in kg internally but display in current unit
    if (data.weight) {
      // API weight assumed kg
      const kg = Number(data.weight);
      if (!isNaN(kg)) {
        if (weightUnit.value === "lb")
          weightDisplay.value = Math.round(convertKgToLb(kg));
        else weightDisplay.value = Math.round(kg);
      }
    }
    if (data.height) {
      height.value = data.height; // cm
      syncHeightDisplay();
    }

    // preferences/goals
    const prefRes = await api.get("/users/preferences");
    const prefs = prefRes.data || {};
    dailyCaloriesGoal.value = prefs.dailyCaloriesGoal ?? null;
    dailyProteinGoal.value = prefs.dailyProteinGoal ?? null;
    dailyWorkoutMinutesGoal.value = prefs.dailyWorkoutMinutesGoal ?? null;

    // optionally load today's consumed (if API provides it)
    dailyCaloriesConsumed.value = prefs.todayCalories ?? 0;
  } catch (err) {
    console.error(
      "Failed to load profile:",
      err?.response?.data || err?.message
    );
  }
});

/* ---------- save profile ---------- */
const saveProfile = async () => {
  try {
    // normalize/sync height & weight to send to backend (kg, cm)
    let heightCmToSend = height.value;
    if (heightUnit.value === "ft") {
      const cm = convertFtInToCm(heightDisplay.value);
      if (cm) heightCmToSend = cm;
    } else {
      const parsed = parseFloat(heightDisplay.value);
      if (!isNaN(parsed)) heightCmToSend = parsed;
    }

    let weightKgToSend = null;
    const parsedW = parseFloat(weightDisplay.value);
    if (!isNaN(parsedW)) {
      weightKgToSend =
        weightUnit.value === "lb" ? convertLbToKg(parsedW) : parsedW;
    }

    await api.put("/users/profile", {
      age: age.value,
      gender: gender.value,
      weight: weightKgToSend,
      height: heightCmToSend,
    });

    // optimistic UI message
    alert("Profile updated!");
  } catch (err) {
    console.error(
      "Failed to update profile:",
      err?.response?.data || err?.message
    );
    alert("Failed to update profile. Try again.");
  }
};

/* ---------- save goals ---------- */
const saveGoals = async () => {
  try {
    await api.put("/users/preferences", {
      dailyCaloriesGoal: dailyCaloriesGoal.value,
      dailyProteinGoal: dailyProteinGoal.value,
      dailyWorkoutMinutesGoal: dailyWorkoutMinutesGoal.value,
    });
    alert("Goals updated!");
  } catch (err) {
    console.error(
      "Failed to save preferences:",
      err?.response?.data || err?.message
    );
    alert("Failed to update goals. Try again.");
  }
};

/* quick helpers */
const addCaloriesLog = () => {
  // simple local add; ideally you'd call an endpoint
  if (!dailyCaloriesConsumed.value || dailyCaloriesConsumed.value < 0) return;
  dailyCaloriesConsumed.value = Math.max(0, dailyCaloriesConsumed.value);
  // show quick toast (use alert for demo)
  // in production replace with proper toast UI
  // (we don't persist here by default)
};

const applyQuickPreset = (which) => {
  if (which === "lose") {
    dailyCaloriesGoal.value = Math.max(
      1200,
      recommendedCalories.value
        ? Math.round(recommendedCalories.value * 0.8)
        : 1800
    );
    dailyProteinGoal.value = 140;
    dailyWorkoutMinutesGoal.value = 40;
  } else {
    // maintain
    dailyCaloriesGoal.value =
      recommendedCalories.value || dailyCaloriesGoal.value || 2200;
    dailyProteinGoal.value = 100;
    dailyWorkoutMinutesGoal.value = 30;
  }
};

const suggestGoal = () => {
  if (recommendedCalories.value)
    dailyCaloriesGoal.value = recommendedCalories.value;
};

const resetToday = () => {
  dailyCaloriesConsumed.value = 0;
};

const copyProfileLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    alert("Profile link copied!");
  } catch {
    alert("Unable to copy.");
  }
};
</script>

<style scoped>
.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Page header */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
}

/* Layout as stacked rows */
.profile-grid {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.hero-card {
  display: flex;
  justify-content: center; 
  flex-direction: column;
  padding: 1rem;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(27, 31, 35, 0.06);
  height: 150px;
}

.hero {
  display: flex;
  align-items: center; 
  justify-content: center;
  min-height: 100%;
}

/* Layout for avatar + meta */
.hero-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Avatar */
.avatar-wrap {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 6px 12px rgba(17, 24, 39, 0.06);
  border: 2px solid rgba(0, 0, 0, 0.04);
}

/* Meta */
.hero-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1; 
  max-width: 400px; 
}
.hero-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Stats under name */
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 0.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.stat-value {
  font-weight: 700;
  font-size: 1.1rem;
}

/* Profile Card */
.profile-right .card {
  border: 1px solid hsl(0, 0%, 90%);
  border-radius: 12px;
  background: hsl(0, 0%, 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.profile-right .card h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: hsl(0, 0%, 20%);
  margin-bottom: 1rem;
}

.profile-sections {
  display: flex;
  gap: 1.5rem; 
  margin-top: 1rem;
}

.profile-sections .card {
  flex: 1; 
  min-width: 0; 
}

h4 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Form Grid */
.form-grid {
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.span-2 {
  grid-column: span 2;
}

/* Labels */
.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: hsl(0, 0%, 35%);
  margin-bottom: 0.4rem;
}

/* Inputs & Selects */
.form-control {
  border: 1px solid hsl(0, 0%, 85%);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  font-size: 0.9rem;
  color: hsl(0, 0%, 15%);
  background: hsl(0, 0%, 100%);
  transition: all 0.2s ease;
  height: 38px;
  box-sizing: border-box;
  width: 100%;
  display: block;
  margin-bottom: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: none;
}

/* Inline inputs (weight + unit, height + unit) */
.inline-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Unit select override */
.form-control.unit-select {
  flex: 0 0 80px;
  height: 38px;
  font-size: 0.9rem;
  padding: 0 1.75rem 0 0.5rem;
  line-height: 1.4;
  cursor: pointer;

  /* Custom arrow */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23666' height='50' viewBox='0 0 24 24' width='50' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  background-size: 0.8rem;
}

/* Remove number input spinners in Chrome, Edge, Safari */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Remove number input spinners in Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

/* Button */
.btn.btn-dark {
  background: hsl(0, 0%, 15%);
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn.btn-dark:hover {
  background: hsl(0, 0%, 10%);
  transform: translateY(-1px);
}

/* Cards */
.card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* ---------- Responsive ---------- */
@media (max-width: 1024px) {
  .hero-info {
    gap: 1rem;
  }
  .hero-stats {
    gap: 1rem;
  }
}

@media (max-width: 900px) {
  .profile-sections {
    flex-direction: column;
  }
  .form-grid {
    grid-template-columns: 1fr; 
  }
  .inline-inputs {
    flex-direction: column; 
    gap: 0.3rem;
  }
  .form-control.unit-select {
    flex: 1 0 auto;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .hero-card {
    height: auto;
    padding: 0.8rem;
  }
  .avatar-wrap {
    width: 70px;
    height: 70px;
  }
  .hero-name {
    font-size: 1.2rem;
  }
  .stat-value {
    font-size: 1rem;
  }
}

@media (max-width: 500px) {
  .hero-info {
    flex-direction: column; 
    align-items: center;
    gap: 0.8rem;
  }

  .hero-meta {
    align-items: center; 
    text-align: center;
    width: 100%; 
    max-width: none; 
    margin: 0 auto; 
  }

  .avatar-wrap {
    width: 80px;
    height: 80px;
  }

  .stat {
    flex: 1;
  }

  .hero-name {
    font-size: 1.5rem;
    text-align: center;
  }

  .hero-stats {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    text-align: center;
    width: 100%;
    max-width: 250px;
  }

  .stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-label {
    font-size: 0.9rem;
  }

  .stat-value {
    font-size: 1.1rem;
  }

  .stat-value .unit {
    display: none;
  }

  h4 {
    text-align: center;
  }

  .hero-card {
    height: auto;
    padding: 0.8rem;
  }
}
</style>
