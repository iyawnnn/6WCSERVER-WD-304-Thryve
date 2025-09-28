<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
        <i class="bi bi-layout-sidebar"></i>
      </button>

      <div class="separator"></div>
      <!-- line -->
      <span class="page-title">Meal</span>
    </div>

    <div class="dashboard-body">
      <section>
        <h3>Add a Meal</h3>
        <!-- emit mealAdded to parent -->
        <MealForm @mealAdded="$emit('mealAdded')" />
      </section>

      <section>
        <MealHistory />
      </section>
    </div>
  </DefaultLayout>
</template>

<script setup>
import MealForm from "../components/MealForm.vue";
import MealHistory from "../components/MealHistory.vue";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
</script>

<style scoped>
</style>
