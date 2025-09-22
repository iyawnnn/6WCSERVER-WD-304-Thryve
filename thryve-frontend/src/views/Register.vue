<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref("");

const register = async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/register", {
      name: name.value,
      email: email.value,
      password: password.value,
    });

    localStorage.setItem("token", res.data.token);
    router.push("/dashboard");
  } catch (err) {
    error.value = err.response?.data?.error || "Registration failed";
  }
};
</script>

<template>
  <div
    class="register-page d-flex justify-content-center align-items-center vh-100"
  >
    <div class="card p-4 shadow-sm w-100">
      <h2 class="title">Create an Account</h2>
      <p>Enter your details below to create your account</p>

      <form @submit.prevent="register">
        <div class="mb-3">
          <label>Name</label>
          <input
            v-model="name"
            type="text"
            class="form-control"
            placeholder="John Doe"
            required
          />
        </div>

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

        <button type="submit" class="btn btn-dark w-100 mt-3">Create Account</button>
      </form>

      <p class="text-center mt-3">
        Already have an account? 
        <router-link to="/login" class="sign-in-link">Login</router-link>
      </p>

      <p v-if="error" class="text-danger text-center mt-2">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.register-page .card {
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem;
  max-width: 400px;
}

.title {
  font-weight: 700;
}

input::placeholder {
  color: #999;
}

.position-relative {
  position: relative;
}

.position-relative input {
  padding-right: 2.5rem; 
}

.toggle-password-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  color: #333;
  z-index: 10;
}

.sign-in-link {
  text-decoration: none;
  color: var(--color-dark);
  font-weight: 500;
}

.sign-in-link:hover {
  text-decoration: underline;
  color: var(--color-dark);
}
</style>
