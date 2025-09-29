<template>
  <div class="nav-user" v-if="user">
    <img :src="user.avatar || defaultAvatar" alt="User Avatar" class="avatar" />
    <div class="info">
      <p class="name">{{ user.name }}</p>
      <p class="email">{{ user.email }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth";

const auth = useAuthStore();

const user = computed(() => auth.user);

const defaultAvatar = "https://i.pravatar.cc/40?img=12";
</script>

<style scoped>
.nav-user {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  padding-left: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 16px;
  object-fit: cover;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.email {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

/* Smaller avatar and font for 1200px and below */
@media (max-width: 1200px) {
  .avatar {
    width: 32px;
    height: 32px;
  }

  .name {
    font-size: 0.9rem;
  }

  .email {
    font-size: 0.7rem;
  }

  .nav-user {
    padding: 0.75rem 0.5rem;
    gap: 0.5rem;
  }
}
</style>
