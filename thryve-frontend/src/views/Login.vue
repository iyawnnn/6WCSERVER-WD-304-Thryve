<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');

const login = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: email.value,
      password: password.value
    });
    localStorage.setItem('token', res.data.token);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed';
  }
};
</script>

<template>
  <div>
    <h1>Login</h1>
    <div>
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
      <p v-if="error" style="color:red">{{ error }}</p>
    </div>
  </div>
</template>

