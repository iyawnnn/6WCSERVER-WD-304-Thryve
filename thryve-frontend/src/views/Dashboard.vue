<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome!</p>
    <button @click="logout">Logout</button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getToken } from '../utils/token';
import api from '../utils/api';

const router = useRouter();

// Logout function
function logout() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  router.push('/login');
}

// Check token on mount
const token = getToken();
if (!token) {
  router.push('/login');
}

// Fetch protected dashboard data
const fetchDashboardData = async () => {
  try {
    const res = await api.get('/dashboard-data'); 
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data);
  }
};

// Call it when the component mounts
onMounted(() => {
  fetchDashboardData();
});
</script>


