<template>
  <aside class="sidebar">
    <!-- Branding -->
    <div class="sidebar-header">
      <img src="../../assets/uploads/symbol.svg" alt="Thryve Logo" class="logo" />
      <span class="brand-text">THRYVE</span>
    </div>

    <!-- Main Navigation -->
    <nav class="nav-section">
      <NavMain />
    </nav>

    <!-- Footer -->
    <div class="nav-footer">
      <div class="nav-extra">
        <RouterLink to="/profile" class="nav-link">
          <i class="bi bi-gear"></i>
          <span>Edit Preferences</span>
        </RouterLink>
        <button type="button" class="nav-link logout-btn" @click="logout">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>

      <NavUser />
    </div>
  </aside>
</template>

<script setup>
import NavMain from "./NavMain.vue";
import NavUser from "./NavUser.vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  router.push("/login");
}
</script>

<style scoped>
.sidebar {
  width: 18rem;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background: hsl(0 0% 96%);
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  transition: transform 0.3s ease;
  z-index: 20;
  transform: translateX(-100%);
}

.sidebar.collapsed {
  transform: translateX(-100%);
  opacity: 0;
  pointer-events: none;
}

.sidebar.open {
  transform: translateX(0);
}

.content-body {
  margin-left: 0;
  transition: margin-left 0.3s;
}

.sidebar.collapsed .nav-link span,
.sidebar.collapsed .nav-extra span {
  display: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center; 
  padding: 1rem 0;
  gap: 0.6rem; 
  margin-bottom: 1rem;
}


.sidebar-header .logo {
  max-width: 40px; 
  height: auto;
  transition: transform 0.75s ease;
}

.sidebar-header .logo:hover {
  transform: scale(1.1);
}

.brand-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--foreground);
  font-family: "Geist", sans-serif;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.nav-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-extra {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-extra .nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  line-height: 1;
  transition: background 0.2s;
}

.nav-link:hover {
  background-color: var(--third-hover);
}

.nav-extra .nav-link,
.nav-extra .nav-link span {
  font-weight: 500;
  font-family: inherit;
  line-height: 1.2;
}

@media (min-width: 1201px) {
  .sidebar {
    width: 18rem;
  }
}

@media (max-width: 1200px) and (min-width: 1025px) {
  .sidebar {
    width: 14rem;
  }
}

@media (min-width: 1025px) {
  .sidebar {
    transform: translateX(0);
  }
  .sidebar:not(.open) {
    transform: translateX(-100%);
  }
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.collapsed {
    transform: translateX(0);
  }
}

/* Extra small devices: ≤500px */
@media (max-width: 500px) {
  .sidebar {
    width: 14.5rem;
    padding: 1rem 1rem;
  }

  .sidebar-header .logo {
    max-width: 40px;
  }

  .nav-link {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    gap: 0.5rem;
  }

  .nav-extra .nav-link {
    font-size: 0.8rem;
  }

  .nav-user .avatar {
    width: 32px;
    height: 32px;
  }

  .nav-user .name {
    font-size: 0.85rem;
  }

  .nav-user .email {
    font-size: 0.65rem;
  }
}
</style>
