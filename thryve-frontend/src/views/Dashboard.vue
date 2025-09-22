<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome!</p>
    <button @click="logout">Logout</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function logout() {
  localStorage.removeItem('token'); 
  router.push('/login');             
}
</script>
