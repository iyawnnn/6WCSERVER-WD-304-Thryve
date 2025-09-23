<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const error = ref("");

const login = async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: email.value,
      password: password.value,
    });

    if (rememberMe.value) {
      localStorage.setItem("token", res.data.token);
    } else {
      sessionStorage.setItem("token", res.data.token);
    }

    router.push("/dashboard");
  } catch (err) {
    error.value = err.response?.data?.error || "Login failed";
  }
};
</script>

<template>
  <div
    class="login-page d-flex justify-content-center align-items-center vh-100"
  >
    <div class="card p-4 shadow-sm w-100">
      <h2 class="title">Login</h2>
      <p>Enter your email and password to login to your account</p>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="johndoe@gmail.com"
            required
          />
        </div>
        <div class="mb-3 position-relative">
          <label>Password</label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            placeholder="********"
            required
          />
          <i
            class="toggle-password-icon"
            @click="showPassword = !showPassword"
            :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
          ></i>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="form-check">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="form-check-input"
              id="rememberMe"
            />
            <label class="form-check-label remember-label" for="rememberMe">
              Remember me
            </label>
          </div>
          <router-link to="/forgot-password" class="forgot-link">
            Forgot your password?
          </router-link>
        </div>

        <button type="submit" class="btn btn-dark w-100 mt-3">Login</button>
      </form>

      <p class="text-center mt-3">
        Don't have an account?
        <router-link to="/register" class="sign-up-link">Sign Up</router-link>
      </p>

      <p v-if="error" class="text-danger text-center mt-2">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.login-page .card {
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem;
  max-width: 400px;
}

.title {
  font-weight: 700;
}

.remember-label {
  color: var(--color-dark);
}

.form-check-input:checked {
  width: 18px;
  height: 18px;
  background-color: var(--color-dark);
  box-shadow: none;
  border: var(--color-dark);
}

input[type="checkbox"] {
  box-shadow: none;
}

input::placeholder {
  color: #999;
}

.forgot-link {
  color: var(--color-dark);
  text-decoration: none;
  transition: all 0.2s;
}

.forgot-link:hover {
  text-decoration: underline;
}

.sign-up-link {
  text-decoration: none;
  color: var(--color-dark);
  font-weight: 500;
}

.sign-up-link:hover {
  text-decoration: underline;
  color: var(--color-dark);
}

.position-relative {
  position: relative;
}

.toggle-password-icon {
  position: absolute;
  right: 12px;       
  top: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  color: #555;
  z-index: 10;
}

</style>