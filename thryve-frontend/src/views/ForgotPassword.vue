<script setup>
import { ref, computed } from "vue";
import axios from "axios";

const email = ref("");
const message = ref("");
const errorMessage = ref("");

// Track focus state (for showing inline validation like Register.vue)
const isEmailFocused = ref(false);

// ✅ frontend email format checker
const isValidEmail = (val) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(val);
};

// inline email error for input validation (not backend)
const emailError = computed(() => {
  if (!email.value) return "Email is required.";
  if (!isValidEmail(email.value)) return "Please enter a valid email address.";
  return "";
});

const isLoading = ref(false);

const submit = async () => {
  message.value = "";
  errorMessage.value = "";

  if (emailError.value) {
    errorMessage.value = emailError.value;
    return;
  }

  isLoading.value = true; // ⏳ show loading
  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/forgot-password",
      { email: email.value }
    );
    message.value = res.data.message;
  } catch (err) {
    errorMessage.value =
      err.response?.data?.error || "This email is not registered.";
  } finally {
    isLoading.value = false; // ✅ hide loading
  }
};



</script>

<template>
  <div class="forgot-page">
    <!-- Left Column: Form -->
    <div class="forgot-form-container">
      <div class="forgot-card">
        <div class="forgot-header">
          <h1 class="forgot-title">Forgot Password</h1>
          <p class="forgot-subtitle">
            Enter your email and we’ll send you a reset link
          </p>
        </div>

        <form @submit.prevent="submit" class="forgot-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              v-model="email"
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              @focus="isEmailFocused = true"
              @blur="isEmailFocused = false"
            />

            <!-- Inline validation (only when focused or typing) -->
            <p v-if="(isEmailFocused || email) && emailError" class="error-message">
              {{ emailError }}
            </p>
          </div>

          <!-- Backend Success & Error Messages -->
          <p v-if="message" class="success-message">{{ message }}</p>
          <p v-if="errorMessage && !(isEmailFocused || email)" class="error-message">
            {{ errorMessage }}
          </p>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="isLoading">
              <span class="loader"></span> Sending...
            </span>
            <span v-else>
              Send Reset Link
            </span>
          </button>
        </form>

        <p class="signup-text">
          Remember your password?
          <router-link to="/login" class="signup-link">Back to Login</router-link>
        </p>
      </div>
    </div>

    <!-- Right Column: Cover Video -->
    <div class="forgot-image-container">
      <video autoplay muted loop playsinline class="cover-video">
        <source src="../assets/mp4/formVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>


<style scoped>
.forgot-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  font-family: "Geist", "Poppins", sans-serif;
  overflow: hidden;
}

.forgot-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.forgot-card {
  width: 100%;
  max-width: 400px;
  display: grid;
  gap: 1.5rem;
  background-color: var(--card);
  color: var(--card-foreground);
}

.forgot-header {
  text-align: center;
}

.forgot-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.forgot-subtitle {
  font-size: 1.15rem;
  color: var(--muted-foreground);
}

.forgot-form .form-group {
  display: grid;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  font-size: 1rem;
}

input[type="email"] {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background-color: var(--background);
  color: var(--foreground);
  font-size: 0.95rem;
  outline: none;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.05);
}

input:focus {
  border-color: var(--primary);
  box-shadow: none;
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
  margin-top: 1.5rem;
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

.forgot-image-container {
  width: 100%;
  height: 100%;
}

.cover-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loader {
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message,
.success-message {
  font-size: 1rem;
  text-align: center;
  margin-top: 0.75rem;
}

.error-message {
  color: var(--destructive);
}

.success-message {
  color: green;
}

@media (max-width: 1024px) {
  .forgot-page {
    grid-template-columns: 1fr; 
  }

  .forgot-image-container {
    display: none;
  }

  .forgot-form-container {
    padding: 2rem;
  }
}

</style>