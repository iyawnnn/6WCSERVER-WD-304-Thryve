<template>
  <div class="login-page">
    <div class="login-form-container">
      <div class="back-home">
        <router-link to="/" class="back-link">
          <i class="bi bi-arrow-left"></i> Back to Home
        </router-link>
      </div>

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
.login-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative; 
}

.back-home {
  position: absolute;
  top: 3rem;  
  left: 4rem;  
}

.back-link {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  color: var(--foreground);
  text-decoration: none; 
  font-size: 1rem;
  transition: color 0.3s, border-bottom 0.3s; 
  border-bottom: 2px solid transparent;
  padding-bottom: 2px; 
}

.back-link i {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.back-link:hover {
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
}

@media (max-width: 500px) {
  .back-home {
    top: 1.5rem;   
    left: 1.5rem;   
  }

  .back-link {
    font-size: 0.9rem; 
  }

  .back-link i {
    font-size: 1rem; 
  }
}

</style>