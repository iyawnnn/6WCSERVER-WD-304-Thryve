<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const message = ref('');
const error = ref('');

onMounted(() => {
  token.value = route.params.token || '';
});

const submit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  try {
    const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token.value}`, {
      password: password.value
    });
    message.value = res.data.message;
    error.value = '';
    setTimeout(() => router.push('/login'), 1000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong';
    message.value = '';
  }
};
</script>

<template>
  <div class="reset-page d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-sm w-100">
      <h2 class="title mb-4">Reset Password</h2>
      <form @submit.prevent="submit">
        <div class="mb-3 position-relative">
          <label>New Password</label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            placeholder="Enter new password"
            required
          />
          <i
            class="toggle-password-icon"
            @click="showPassword = !showPassword"
            :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
          ></i>
        </div>

        <div class="mb-3 position-relative">
          <label>Confirm Password</label>
          <input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-control"
            placeholder="Confirm new password"
            required
          />
          <i
            class="toggle-password-icon"
            @click="showConfirmPassword = !showConfirmPassword"
            :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
          ></i>
        </div>

        <button type="submit" class="btn btn-dark w-100 mt-3">Reset Password</button>
      </form>

      <p v-if="message" class="text-success text-center mt-3">{{ message }}</p>
      <p v-if="error" class="text-danger text-center mt-3">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.reset-page .card {
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem;
  max-width: 400px;
}

.title {
  font-weight: 700;
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

button.btn-dark {
  background-color: var(--color-dark);
  border: none;
}

button.btn-dark:hover {
  background-color: #000;
}
</style>
