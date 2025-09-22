<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const message = ref('');
const error = ref('');

const submit = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: email.value });
    message.value = res.data.message;
    error.value = '';
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong';
    message.value = '';
  }
};
</script>

<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-sm w-100" style="max-width: 400px;">
      <h2 class="mb-4">Forgot Password</h2>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="johndoe@gmail.com" required/>
        </div>
        <button type="submit" class="btn btn-dark w-100 mt-3">Send Reset Link</button>
      </form>
      <p v-if="message" class="text-success text-center mt-3">{{ message }}</p>
      <p v-if="error" class="text-danger text-center mt-3">{{ error }}</p>
    </div>
  </div>
</template>
