<template>
  <div class="layout">
    <!-- Sidebar -->
    <AppSidebar :class="{ collapsed: isCollapsed }" />
    
    <!-- Main Content -->
    <main :class="{ 'full-width': isCollapsed }" class="main-content">
      <div class="content-body">
        <slot :toggleSidebar="toggleSidebar" />
      </div>
    </main>
  </div>
</template>

<script>
import AppSidebar from "../Sidebar/AppSidebar.vue";

export default {
  components: { AppSidebar },
  data() {
    return {
      isCollapsed: false,
      sidebarWidth: 288, // 18rem in px
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
  },
};
</script>

<style>
.layout {
  display: flex;
  height: 100vh;
  background: hsl(0 0% 96%);
  overflow: hidden;
  position: relative;
}

/* Sidebar is handled inside AppSidebar */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1rem;
  transition: margin-left 0.3s ease, width 0.3s ease;
  margin-left: 18rem; /* match sidebar width */
}

/* When sidebar is collapsed, expand main fully */
.main-content.full-width {
  margin-left: 0;
}

/* Content body */
.content-body {
  background: #fff;
  flex: 1;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}
</style>
