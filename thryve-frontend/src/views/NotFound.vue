<template>
  <div class="not-found-page">
    <h1>Lost your way?</h1>
    <p>Sorry, we can't find that page. You'll find lots to explore on the home page.</p>
    <router-link to="/" class="home-button">
      Go to Home
    </router-link>
    <span class="error-code">Error Code: ES-404</span>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh; 
  text-align: center;
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Geist', Roboto, sans-serif;
  padding: 4rem 2rem;
}

.not-found-page h1 {
  font-size: 5rem; 
  font-weight: 900;
  margin: 0;
  line-height: 1;
  color: var(--primary); 
  margin-bottom: 3rem;
}

.not-found-page p {
  font-size: 1.5rem;
  color: var(--muted-foreground);
  max-width: 600px;
  margin: 0;
  line-height: 1.25;
  margin-bottom: 2rem;
}

.home-button {
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: 600;
  background-color: var(--primary);
  color: var(--primary-foreground);
  text-decoration: none;
  border-radius: var(--radius);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.home-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
}

.error-code {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-top: 1rem;
}
</style>
