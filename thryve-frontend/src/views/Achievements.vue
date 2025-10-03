<template>
  <DefaultLayout v-slot="{ toggleSidebar }">
    <!-- Page Header -->
    <div class="page-header">
      <button @click="toggleSidebar" class="sidebar-toggle">
        <i class="bi bi-layout-sidebar"></i>
      </button>
      <div class="separator"></div>
      <span class="page-title">Achievements</span>
    </div>

    <div class="dashboard-body">
      <div class="achievement-grid">
        <div
          v-for="ach in achievementsList"
          :key="ach.type"
          class="achievement-card"
          :class="{ unlocked: unlockedTypes.includes(ach.type.toLowerCase()) }"
        >
          <div class="card-content">
            <div class="icon-wrapper">
              <img :src="ach.iconUrl" :alt="ach.name" class="achievement-icon" />
            </div>
            <div class="text-wrapper">
              <p class="achievement-name">{{ ach.name }}</p>
              <p class="achievement-desc">{{ ach.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import api from "../utils/api";
import { useAuthStore } from "../stores/auth";
import DefaultLayout from "../components/Layout/DefaultLayout.vue";

const achievementsList = ref([]);
const unlockedTypes = ref([]);
const auth = useAuthStore();

const fetchMasterAchievements = async () => {
  try {
    const { data } = await api.get("/master-achievements", {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    achievementsList.value = data.map((a) => ({
      ...a,
      type: a.type.trim().toLowerCase(),
    }));
  } catch (err) {
    console.error("Error fetching master achievements:", err.response?.data || err.message);
  }
};

const fetchUserAchievements = async () => {
  if (!auth.user?._id) return;
  try {
    await api.post(`/achievements/check/${auth.user._id}`, {}, { headers: { Authorization: `Bearer ${auth.token}` } });
    const { data } = await api.get(`/achievements/${auth.user._id}`, { headers: { Authorization: `Bearer ${auth.token}` } });
    unlockedTypes.value = data.map((a) => a.type.trim().toLowerCase());
  } catch (err) {
    console.error("Error fetching user achievements:", err.response?.data || err.message);
  }
};

const init = async () => {
  await fetchMasterAchievements();
  await fetchUserAchievements();
};

watch(() => auth.user, (newUser) => {
  if (newUser?._id) init();
}, { immediate: true, deep: true });

onMounted(init);
</script>

<style>
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
}

.achievement-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  opacity: 0.35; 
}

.achievement-card.unlocked {
  opacity: 1; 
  border-color: #333333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-wrapper {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.achievement-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.text-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.achievement-name {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: #111111;
}

.achievement-desc {
  font-size: 0.875rem;
  color: #555555;
  line-height: 1.2;
  max-height: 2.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (max-width: 400px) {
  .achievement-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.5rem 0;
  }

  .achievement-card {
    padding: 0.75rem;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .achievement-name {
    font-size: 0.875rem;
  }

  .achievement-desc {
    font-size: 0.75rem;
  }
}

</style>
