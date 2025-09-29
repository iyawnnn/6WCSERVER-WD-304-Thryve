<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
        <i class="bi bi-layout-sidebar"></i>
      </button>
      <div class="separator"></div>
      <!-- line -->
      <span class="page-title">Workout</span>
    </div>

    <div class="dashboard-body">
      <section>
        <h3>Add a Workout</h3>
        <WorkoutForm />
      </section>

      <section>
        <WorkoutHistory />
      </section>
    </div>
  </DefaultLayout>
</template>

<script setup>
import WorkoutForm from "../components/WorkoutForm.vue";
import WorkoutHistory from "../components/WorkoutHistory.vue";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";
</script>

<style scoped>
</style>
