<template>
  <div>
    <h2>Workouts</h2>

    <section>
      <h3>Add a Workout</h3>
      <WorkoutForm />
    </section>

    <section>
      <WorkoutHistory />
    </section>
  </div>
</template>

<script setup>
import WorkoutForm from "../components/WorkoutForm.vue";
import WorkoutHistory from "../components/WorkoutHistory.vue";
</script>

<style scoped>
h2, h3 {
  margin-bottom: 0.5rem;
}
section {
  margin-bottom: 1.5rem;
}
</style>
