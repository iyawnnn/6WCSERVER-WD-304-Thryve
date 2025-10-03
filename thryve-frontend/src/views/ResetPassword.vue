<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const token = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isPasswordFocused = ref(false);

const message = ref("");
const error = ref("");

onMounted(() => {
  token.value = route.params.token || "";
});

// ================= Password Validation =================
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

const isPasswordValid = computed(
  () =>
    hasUppercase.value &&
    hasLowercase.value &&
    hasNumber.value &&
    isMinLength.value
);

const submit = async () => {
  if (!isPasswordValid.value) {
    error.value = "Password does not meet requirements";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  try {
    const res = await axios.post(
      `http://localhost:5000/api/auth/reset-password/${token.value}`,
      { password: password.value }
    );
    message.value = res.data.message;
    error.value = "";
    setTimeout(() => router.push("/login"), 1000);
  } catch (err) {
    error.value = err.response?.data?.error || "Something went wrong";
    message.value = "";
  }
};
</script>

<template>
  <div class="reset-page">
    <!-- Left Column: Form -->
    <div class="reset-form-container">
      <div class="reset-card">
        <div class="reset-header">
          <h1 class="reset-title">Reset Password</h1>
          <p class="reset-subtitle">
            Enter your new password below to reset your account
          </p>
        </div>

        <form @submit.prevent="submit" class="reset-form">
          <!-- New Password -->
          <div class="form-group">
            <label>New Password</label>
            <div class="password-input-wrapper">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="********"
                required
                :class="{
                  'is-invalid': password && !isPasswordValid,
                  'is-valid': isPasswordValid,
                }"
                @focus="isPasswordFocused = true"
                @blur="isPasswordFocused = false"
              />
              <i
                class="bi"
                :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                @click="showPassword = !showPassword"
              ></i>
            </div>

            <!-- Password rule hint -->
            <p
              v-if="(isPasswordFocused || password) && firstPasswordError"
              class="password-hint"
            >
              {{ firstPasswordError }}
            </p>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label>Confirm Password</label>
            <div class="password-input-wrapper">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="********"
                required
                :class="{
                  'is-invalid': confirmPassword && confirmPassword !== password,
                  'is-valid': confirmPassword && confirmPassword === password,
                }"
              />
              <i
                class="bi"
                :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"
                @click="showConfirmPassword = !showConfirmPassword"
              ></i>
            </div>
            <p
              v-if="confirmPassword && confirmPassword !== password"
              class="password-hint"
            >
              Passwords do not match
            </p>
          </div>

          <!-- Error / Success -->
          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="message" class="success-message">{{ message }}</p>

          <button type="submit" class="btn-primary">Reset Password</button>
        </form>

        <p class="signup-text">
          Remembered your password?
          <router-link to="/login" class="signup-link">Login</router-link>
        </p>
      </div>
    </div>

    <!-- Right Column: Cover Video -->
    <div class="reset-image-container">
      <video autoplay muted loop playsinline class="cover-video">
        <source src="../assets/mp4/formVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<style scoped>
.reset-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  font-family: "Geist", "Poppins", sans-serif;
  overflow: hidden;
}

.reset-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.reset-card {
  width: 100%;
  max-width: 400px;
  display: grid;
  gap: 1.5rem;
  background-color: var(--card);
  color: var(--card-foreground);
}

.reset-header {
  text-align: center;
}

.reset-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.reset-subtitle {
  font-size: 1.15rem;
  color: var(--muted-foreground);
}

.reset-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

label {
  font-weight: 500;
  font-size: 1rem;
}

input {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background-color: var(--background);
  color: var(--foreground);
  font-size: 0.95rem;
  outline: none;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
}

input:focus {
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
  text-align: center;
}

.success-message {
  color: green;
  font-size: 1rem;
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

.reset-image-container {
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

/* Password hint */
.password-hint {
  font-size: 0.9rem;
  color: red;
  margin-top: 0.3rem;
}

@media (max-width: 1024px) {
  .reset-page {
    grid-template-columns: 1fr; 
  }

  .reset-image-container {
    display: none; 
  }

  .reset-form-container {
    padding: 2rem; 
  }

}

</style>