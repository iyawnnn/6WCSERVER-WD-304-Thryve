<template>
  <nav class="nav">
    <p class="nav-label">Activities</p>
    <ul>
      <li v-for="item in items" :key="item.label">
        <RouterLink :to="item.to" class="nav-link">
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const items = [
  { label: "Dashboard", to: "/dashboard", icon: "bi bi-house" },
  { label: "Meal", to: "/meals", icon: "bi bi-egg-fried" },
  { label: "Workout", to: "/workouts", icon: "bi bi-heart-pulse" },
  { label: "Water", to: "/water", icon: "bi bi-droplet" },
  { label: "Sleep", to: "/sleep", icon: "bi bi-moon" },
  { label: "Achievement", to: "/achievements", icon: "bi bi-trophy" },
];
</script>

<style scoped>
.nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-foreground);
  text-transform: uppercase;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
  text-decoration: none;
  transition: background 0.2s;
}

.nav-link:hover {
  background-color: var(--third-hover);
}

i {
  font-size: 1rem;
}
</style>
