<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <div class="profile container py-4">
      <!-- Page header -->
      <div class="page-header d-flex align-items-center mb-4">
        <button @click="toggleSidebar" class="sidebar-toggle btn btn-ghost me-3" aria-label="Toggle sidebar">
          <i class="bi bi-layout-sidebar"></i>
        </button>
        <h1 class="page-title mb-0">Profile</h1>
        <div class="ms-auto">
          <button class="btn btn-outline-secondary me-2" @click="copyProfileLink" title="Copy profile link">Share</button>
          <button class="btn btn-dark" @click="saveProfile">Save</button>
        </div>
      </div>

      <div class="row g-4">
        <!-- Left: hero + stats -->
        <div class="col-lg-4">
          <div class="card hero-card">
            <div class="hero-top d-flex align-items-center gap-3">
              <div class="avatar-wrap">
                <img :src="avatarPreview || '/default-avatar.png'" alt="Avatar" class="avatar" />
                <label class="avatar-upload" title="Upload photo">
                  <i class="bi bi-camera"></i>
                  <input type="file" accept="image/*" @change="onAvatarChange" />
                </label>
              </div>
              <div>
                <h3 class="mb-0">{{ userName || 'Your Name' }}</h3>
                <small class="text-muted">Member</small>
              </div>
            </div>

            <div class="hero-stats mt-3">
              <div class="stat-row d-flex justify-content-between">
                <div>
                  <div class="stat-label">BMI</div>
                  <div class="stat-value">{{ bmi ?? '—' }}</div>
                </div>
                <div>
                  <div class="stat-label">BMR</div>
                  <div class="stat-value">{{ bmr ?? '—' }} kcal</div>
                </div>
                <div>
                  <div class="stat-label">Daily Rec.</div>
                  <div class="stat-value">{{ recommendedCalories ?? '—' }} kcal</div>
                </div>
              </div>
            </div>

            <div class="hero-actions mt-3 d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" @click="suggestGoal">Use Suggestion</button>
              <button class="btn btn-sm btn-outline-secondary" @click="resetToday">Reset Day</button>
            </div>
          </div>

          <!-- quick goals progress -->
          <div class="card mt-3 p-3 d-flex align-items-center gap-3">
            <div class="me-3 progress-block">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="circle"
                  :stroke-dasharray="caloriesProgress + ', 100'"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <text x="18" y="20.35" class="percentage">{{ caloriesProgress }}%</text>
              </svg>
            </div>
            <div class="flex-grow-1">
              <div class="small text-muted">Calories today</div>
              <div class="d-flex gap-2 align-items-center mt-2">
                <input v-model.number="dailyCaloriesConsumed" type="number" class="form-control form-control-sm" min="0" />
                <button class="btn btn-sm btn-primary" @click="addCaloriesLog">Log</button>
              </div>
              <div class="small mt-2 text-muted">Goal: {{ dailyCaloriesGoal || '—' }} kcal</div>
            </div>
          </div>
        </div>

        <!-- Right: profile form & goals -->
        <div class="col-lg-8">
          <div class="card p-3">
            <h4 class="mb-3">Profile Information</h4>
            <form @submit.prevent="saveProfile">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Age</label>
                  <input v-model.number="age" type="number" class="form-control" min="10" max="120" />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Gender</label>
                  <select v-model="gender" class="form-select">
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Activity</label>
                  <select v-model="activityLevel" class="form-select" title="Activity level helps estimate your daily calorie needs">
                    <option value="sedentary">Sedentary (little/no exercise)</option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="veryActive">Very active / physical job</option>
                  </select>
                </div>

                <!-- Weight -->
                <div class="col-md-6">
                  <label class="form-label">Weight</label>
                  <div class="d-flex">
                    <input v-model.number="weightDisplay" type="number" class="form-control" />
                    <select v-model="weightUnit" class="form-select ms-2" style="max-width:110px">
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>

                <!-- Height -->
                <div class="col-md-6">
                  <label class="form-label">Height</label>
                  <div class="d-flex">
                    <input v-model="heightDisplay" @input="formatHeight" type="text" class="form-control" placeholder="e.g. 180 or 5'11" />
                    <select v-model="heightUnit" class="form-select ms-2" style="max-width:110px" @change="syncHeightDisplay">
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>

                <div class="col-12">
                  <button type="submit" class="btn btn-dark">Save Profile</button>
                </div>
              </div>
            </form>
          </div>

          <!-- Goals card -->
          <div class="card p-3 mt-3">
            <h4 class="mb-3">Daily Goals</h4>
            <form @submit.prevent="saveGoals" class="row g-3 align-items-end">
              <div class="col-md-4">
                <label class="form-label">Calories Target</label>
                <input v-model.number="dailyCaloriesGoal" type="number" class="form-control" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Protein Target (g)</label>
                <input v-model.number="dailyProteinGoal" type="number" class="form-control" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Workout Minutes Target</label>
                <input v-model.number="dailyWorkoutMinutesGoal" type="number" class="form-control" />
              </div>
              <div class="col-12">
                <button type="submit" class="btn btn-primary">Save Goals</button>
                <button type="button" class="btn btn-outline-secondary ms-2" @click="applyQuickPreset('lose')">Preset: Lose</button>
                <button type="button" class="btn btn-outline-secondary ms-1" @click="applyQuickPreset('maintain')">Preset: Maintain</button>
              </div>
            </form>
          </div>
        </div> <!-- end right column -->
      </div> <!-- end row -->
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

/* avatar */
const avatarFile = ref(null);
const avatarPreview = ref("");

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
  return !isNaN(parsed) && parsed > 0 ? parsed : (height.value || null);
});
const bmi = computed(() => {
  if (!weightKg.value || !heightCm.value) return null;
  const val = weightKg.value / ((heightCm.value / 100) ** 2);
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
  return Math.round(bmr.value * (activityMultipliers[activityLevel.value] || 1.2));
});

/* calories progress for circular chart */
const caloriesProgress = computed(() => {
  if (!dailyCaloriesGoal.value || dailyCaloriesGoal.value <= 0) return 0;
  const pct = Math.round((dailyCaloriesConsumed.value / dailyCaloriesGoal.value) * 100);
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
        if (weightUnit.value === "lb") weightDisplay.value = Math.round(convertKgToLb(kg));
        else weightDisplay.value = Math.round(kg);
      }
    }
    if (data.height) {
      height.value = data.height; // cm
      syncHeightDisplay();
    }
    if (data.avatarUrl) avatarPreview.value = data.avatarUrl;

    // preferences/goals
    const prefRes = await api.get("/users/preferences");
    const prefs = prefRes.data || {};
    dailyCaloriesGoal.value = prefs.dailyCaloriesGoal ?? null;
    dailyProteinGoal.value = prefs.dailyProteinGoal ?? null;
    dailyWorkoutMinutesGoal.value = prefs.dailyWorkoutMinutesGoal ?? null;

    // optionally load today's consumed (if API provides it)
    dailyCaloriesConsumed.value = prefs.todayCalories ?? 0;
  } catch (err) {
    console.error("Failed to load profile:", err?.response?.data || err?.message);
  }
});

/* ---------- avatar ---------- */
const onAvatarChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

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
      weightKgToSend = weightUnit.value === "lb" ? convertLbToKg(parsedW) : parsedW;
    }

    await api.put("/users/profile", {
      age: age.value,
      gender: gender.value,
      weight: weightKgToSend,
      height: heightCmToSend,
    });

    // upload avatar if present (example endpoint)
    if (avatarFile.value) {
      try {
        const fd = new FormData();
        fd.append("avatar", avatarFile.value);
        // endpoint might differ - adjust to your backend
        await api.post("/users/avatar", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        console.warn("Avatar upload failed (non-blocking):", err?.response?.data || err?.message);
      }
    }

    // optimistic UI message
    alert("Profile updated!");
  } catch (err) {
    console.error("Failed to update profile:", err?.response?.data || err?.message);
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
    console.error("Failed to save preferences:", err?.response?.data || err?.message);
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
    dailyCaloriesGoal.value = Math.max(1200, (recommendedCalories.value ? Math.round(recommendedCalories.value * 0.8) : 1800));
    dailyProteinGoal.value = 140;
    dailyWorkoutMinutesGoal.value = 40;
  } else {
    // maintain
    dailyCaloriesGoal.value = recommendedCalories.value || dailyCaloriesGoal.value || 2200;
    dailyProteinGoal.value = 100;
    dailyWorkoutMinutesGoal.value = 30;
  }
};

const suggestGoal = () => {
  if (recommendedCalories.value) dailyCaloriesGoal.value = recommendedCalories.value;
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
/* colors and general card styling */
:root {
  --card-bg: #fff;
  --muted: #6c757d;
  --accent: #111827; /* dark accent */
  --glass: rgba(255,255,255,0.6);
}

.profile .page-header { border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 1rem; }

.card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(27,31,35,0.06);
  padding: 1rem;
}

/* Hero */
.hero-card { display:flex; flex-direction:column; gap:0.75rem; }
.hero-top { align-items:center; }
.avatar-wrap { position:relative; width:72px; height:72px; }
.avatar {
  width:72px; height:72px; border-radius:14px; object-fit:cover;
  box-shadow: 0 6px 12px rgba(17,24,39,0.06);
  border: 2px solid rgba(0,0,0,0.04);
}
.avatar-upload {
  position:absolute; right:-6px; bottom:-6px;
  background:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center;
  width:30px; height:30px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
}
.avatar-upload input { display:none; }

/* hero stats */
.stat-row { gap: 1rem; display:flex; }
.stat-label { font-size: 0.75rem; color: var(--muted); }
.stat-value { font-weight:700; font-size: 1.1rem; }

/* circular progress */
.circular-chart { width:64px; height:64px; transform: rotate(-90deg); }
.circle-bg { fill: none; stroke: #eee; stroke-width: 3.5; }
.circle { fill: none; stroke-width: 3.5; stroke: #3b82f6; stroke-linecap: round; transition: stroke-dasharray .6s ease; }
.percentage { font-size: 7px; text-anchor: middle; fill: #111; transform: rotate(90deg); }

/* small responsive tweaks */
@media (max-width: 768px) {
  .hero-top { gap: 0.5rem; }
  .avatar { width:56px; height:56px; }
  .circular-chart { width:56px; height:56px; }
}

/* Inputs and buttons look */
.btn-ghost { background: transparent; border: none; color: var(--accent); }
.form-control:focus { box-shadow: 0 0 0 0.125rem rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.8); }

/* subtle hover */
.card:hover { transform: translateY(-2px); transition: transform .15s ease; }

/* small helpers */
.small { font-size: .85rem; }
.text-muted { color: var(--muted); }
</style>
