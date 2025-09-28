<template>
  <div class="login-page">
    <!-- Left Column: Form -->
    <div class="login-form-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">Login</h1>
          <p class="login-subtitle">
            Enter your email below to login to your account
          </p>
        </div>

        <form @submit.prevent="login" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              v-model="email"
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="password">Password</label>
              <router-link to="/forgot-password" class="forgot-link">
                Forgot your password?
              </router-link>
            </div>

            <div class="password-input-wrapper">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                id="password"
                placeholder="********"
                required
              />
              <i
                class="bi"
                :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                @click="showPassword = !showPassword"
              ></i>
            </div>
          </div>

          <!-- Error Message -->
          <p v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </p>

          <button type="submit" class="btn-primary">Login</button>
        </form>

        <p class="signup-text">
          Don't have an account?
          <router-link to="/register" class="signup-link">Sign up</router-link>
        </p>
      </div>
    </div>

    <!-- Right Column: Cover Video -->
    <div class="login-image-container">
      <video autoplay muted loop playsinline class="cover-video">
        <source src="../assets/mp4/formVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");

const login = async () => {
  errorMessage.value = ""; // reset before trying
  try {
    await auth.doLogin({ email: email.value, password: password.value });
    router.push("/dashboard");
  } catch (err) {
    console.error(err);

    // You can customize this depending on backend response
    if (err.response?.status === 401) {
      errorMessage.value = "Invalid email or password.";
    } else if (err.response?.status === 500) {
      errorMessage.value = "Server error. Please try again later.";
    } else {
      errorMessage.value = "Something went wrong. Please try again.";
    }
  }
};
</script>

<style scoped>

</style>