<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../utils/api"; // Axios instance

const router = useRouter();
const auth = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isPasswordFocused = ref(false);

// validation rules
// Password Validation
const hasUppercase = computed(() => /[A-Z]/.test(password.value));
const hasLowercase = computed(() => /[a-z]/.test(password.value));
const hasNumber = computed(() => /[0-9]/.test(password.value));
const isMinLength = computed(() => password.value.length >= 8);

const firstPasswordError = computed(() => {
  if (!hasUppercase.value) return "1 uppercase letter (A-Z)";
  if (!hasLowercase.value) return "1 lowercase letter (a-z)";
  if (!hasNumber.value) return "1 number (0-9)";
  if (!isMinLength.value) return "At least 8 characters";
  return null;
});

// overall valid
const isPasswordValid = computed(() =>
  hasUppercase.value && hasLowercase.value && hasNumber.value && isMinLength.value
);

// ================= Email Validation =================
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = computed(() => emailRegex.test(email.value));
const emailError = computed(() => {
  if (!email.value) return null;
  if (!isEmailValid.value) return "Please enter a valid email address";
  return null;
});

// ================= Age Validation =================
const isAgeValid = computed(() => {
  const val = Number(age.value);
  return val >= 10 && val <= 100;
});
const ageError = computed(() => {
  if (!age.value) return null;
  if (!isAgeValid.value) return "Age must be between 10 and 100";
  return null;
});

// ================= Weight Validation =================
const isWeightValid = computed(() => {
  const val = Number(weight.value);
  if (weightUnit.value === "kg") return val > 20 && val < 300; // reasonable range
  if (weightUnit.value === "lb") return val > 40 && val < 660;
  return false;
});
const weightError = computed(() => {
  if (!weight.value) return null;
  if (!isWeightValid.value) return "Enter a valid weight";
  return null;
});

// ================= Height Validation =================
const isHeightValid = computed(() => {
  if (!heightDisplay.value) return true;
  if (heightUnit.value === "cm") {
    const val = Number(heightDisplay.value);
    return val >= 50 && val <= 250;
  }
  if (heightUnit.value === "ft") {
    return /^(\d{1,2})'(\d{1,2})$/.test(heightDisplay.value);
  }
  return false;
});
const heightError = computed(() => {
  if (!heightDisplay.value) return null;
  if (!isHeightValid.value) return "Enter a valid height";
  return null;
});


const age = ref("");
const weight = ref("");
const weightUnit = ref("kg");
const heightDisplay = ref("");
const heightUnit = ref("cm");

const error = ref("");

const convertFtInToCm = (ftIn) => {
  const match = /^(\d{1,2})'(\d{1,2})$/.exec(ftIn);
  if (!match) return null;
  const feet = parseInt(match[1], 10);
  const inches = parseInt(match[2], 10);
  return Math.round((feet * 12 + inches) * 2.54);
};

const convertLbToKg = (lb) => Math.round(lb * 0.453592);

const formatHeightFt = (event) => {
  if (heightUnit.value !== "ft") return;

  let val = heightDisplay.value.replace(/[^\d']/g, ""); // keep only numbers + '

  // If user is typing (not backspacing) and only typed digits → auto-add '
  if (event.inputType !== "deleteContentBackward" && /^\d{1,2}$/.test(val)) {
    val = val + "'";
  }

  heightDisplay.value = val;
};



const register = async () => {
  try {
    const weightInKg =
      weightUnit.value === "lb" ? convertLbToKg(weight.value) : weight.value;
    const heightInCm =
      heightUnit.value === "ft" && heightDisplay.value.includes("'")
        ? convertFtInToCm(heightDisplay.value)
        : Number(heightDisplay.value) || null;

    const res = await auth.doRegister({
      name: name.value,
      email: email.value,
      password: password.value,
      age: age.value || null,
      weight: weightInKg || null,
      height: heightInCm || null,
    });

    // ✅ Make sure the token is set in Axios
    api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;

    // ✅ Optional but recommended: fetch user data
    await auth.fetchMe();

    // 1–2 second delay for UX
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  } catch (err) {
    error.value = err.response?.data?.error || "Registration failed";
  }
};


</script>

<template>
  <div class="register-page">
    <!-- Left Column: Form -->
    <div class="register-form-container">
      <div class="register-card">
        <div class="register-header">
          <h1 class="register-title">Create an Account</h1>
          <p class="register-subtitle">
            Enter your details below to create your account
          </p>
        </div>

        <form @submit.prevent="register" class="register-form">
          <div class="form-group">
            <label>Name</label>
            <input v-model="name" type="text" placeholder="John Doe" required />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label>Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="johndoe@gmail.com"
              :class="{ 'is-invalid': email && emailError, 'is-valid': email && !emailError }"
              required
            />
            <p v-if="emailError" class="input-hint">{{ emailError }}</p>
          </div>

          <div class="form-group">
            <label>Create password</label>
            <div class="password-input-wrapper">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="********"
                :class="{ 'is-invalid': password && !isPasswordValid, 'is-valid': isPasswordValid }"
                required
                @focus="isPasswordFocused = true"
                @blur="isPasswordFocused = false"
              />

              <i
                class="bi"
                :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                @click="showPassword = !showPassword"
              ></i>
            </div>

            <!-- Validation message (one at a time) -->
            <p v-if="(isPasswordFocused || password) && firstPasswordError" class="password-hint">
              {{ firstPasswordError }}
            </p>
          </div>

          
          <!-- Age -->
          <div class="form-group">
            <label>Age</label>
            <input
              v-model="age"
              type="number"
              min="10"
              max="120"
              placeholder="e.g. 25"
              :class="{ 'is-invalid': age && ageError, 'is-valid': age && !ageError }"
              required
            />
            <p v-if="ageError" class="input-hint">{{ ageError }}</p>
          </div>


          <!-- Weight -->
          <div class="form-group">
            <label>Weight</label>
            <div class="inline-group">
              <input
                v-model="weight"
                type="number"
                placeholder="e.g. 70"
                :class="{ 'is-invalid': weight && weightError, 'is-valid': weight && !weightError }"
                required
              />
              <select v-model="weightUnit">
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
            <p v-if="weightError" class="input-hint">{{ weightError }}</p>
          </div>


          <!-- Height -->
          <div class="form-group">
            <label>Height</label>
            <div class="inline-group">
             <input
                v-model="heightDisplay"
                @input="formatHeightFt($event)"
                type="text"
                placeholder="e.g. 5'10"
                :class="{ 'is-invalid': heightDisplay && heightError, 'is-valid': heightDisplay && !heightError }"
                required
              />
              <select v-model="heightUnit">
                <option value="cm">cm</option>
                <option value="ft">ft</option>
              </select>
            </div>
            <p v-if="heightError" class="input-hint">{{ heightError }}</p>
          </div>

          <!-- Error Message -->
          <p v-if="error" class="error-message">{{ error }}</p>

          <button type="submit" class="btn-primary">Create Account</button>
        </form>

        <p class="signup-text">
          Already have an account?
          <router-link to="/login" class="signup-link">Login</router-link>
        </p>
      </div>
    </div>

    <!-- Right Column: Cover Video -->
    <div class="register-image-container">
      <video autoplay muted loop playsinline class="cover-video">
        <source src="../assets/mp4/formVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  font-family: "Geist", "Poppins", sans-serif;
  overflow: hidden;
}

.register-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.register-card {
  width: 100%;
  max-width: 400px;
  display: grid;
  gap: 1.5rem;
  background-color: var(--card);
  color: var(--card-foreground);
}

.register-header {
  text-align: center;
}

.register-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.register-subtitle {
  font-size: 1.15rem;
  color: var(--muted-foreground);
}

.register-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem; /* equal spacing */
}

label {
  font-weight: 500;
  font-size: 1rem;
}

input,
select {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background-color: var(--background);
  color: var(--foreground);
  font-size: 0.95rem;
  outline: none;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
}

input:focus,
select:focus {
  border-color: var(--primary);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  width: 100%;
  padding-right: 2.5rem;
}

.password-input-wrapper i {
  position: absolute;
  right: 0.75rem;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--muted-foreground);
}

.password-input-wrapper i:hover {
  color: var(--foreground);
}

.inline-group {
  display: flex;
}

.inline-group select {
  appearance: none;     
  -webkit-appearance: none; 
  -moz-appearance: none;    

  padding: 0.75rem 2rem 0.75rem 1.6rem; /* top right bottom left */      
  width: 80px;

  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background-color: var(--background);
  color: var(--foreground);
  font-size: 0.95rem;

  background-image: url("data:image/svg+xml;utf8,<svg fill='currentColor' height='16' viewBox='0 0 20 20' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M5.25 7.5l4.5 4.5 4.5-4.5H5.25z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.5rem center; 
  background-size: 1rem;
}


.inline-group input {
  flex: 1;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius);
  background-color: var(--primary);
  color: var(--primary-foreground);
  cursor: pointer;
  transition: background-color 0.15s ease;
  margin-top: 1rem;
  text-align: center;
  font-family: "Geist", "Poppins", sans-serif;
  font-size: 1rem;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.error-message {
  color: var(--destructive);
  font-size: 1rem;
  margin-top: 1rem;
  text-align: center;
}

.signup-text {
  text-align: center;
  font-size: 1rem;
}

.signup-link {
  text-decoration: underline;
  color: var(--foreground);
}

.register-image-container {
  width: 100%;
  height: 100%;
}

.cover-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Input borders */
.is-invalid {
  border: 1px solid red !important;
}
.is-valid {
  border: 1px solid green !important;
}

/* Rules list */
.password-rules {
  list-style: none;
  margin-top: 0.5rem;
  padding-left: 0;
  font-size: 0.9rem;
}
.password-rules li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.password-rules li.valid {
  color: green;
}

.password-hint, .input-hint {
  font-size: 0.9rem;
  color: red;
  margin-top: 0.3rem;
}


</style>
