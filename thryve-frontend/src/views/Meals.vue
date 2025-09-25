<template>
  <div>
    <h2>Meals</h2>

    <section>
      <h3>Add a Meal</h3>
      <!-- emit mealAdded to parent -->
      <MealForm @mealAdded="$emit('mealAdded')" />
    </section>

    <section>
      <MealHistory />
    </section>
  </div>
</template>

<script setup>
import MealForm from "../components/MealForm.vue";
import MealHistory from "../components/MealHistory.vue";
</script>

<style scoped>
h2, h3 {
  margin-bottom: 0.5rem;
}
section {
  margin-bottom: 1.5rem;
}
</style>
