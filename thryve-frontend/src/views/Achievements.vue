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
    console.error(
      "Error fetching master achievements:",
      err.response?.data || err.message
    );
  }
};

const fetchUserAchievements = async () => {
  if (!auth.user?._id) return;
  try {
    await api.post(
      `/achievements/check/${auth.user._id}`,
      {},
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );

    const { data } = await api.get(`/achievements/${auth.user._id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    unlockedTypes.value = data.map((a) => a.type.trim().toLowerCase());
  } catch (err) {
    console.error(
      "Error fetching user achievements:",
      err.response?.data || err.message
    );
  }
};

const init = async () => {
  await fetchMasterAchievements();
  await fetchUserAchievements();
};

watch(
  () => auth.user,
  (newUser) => {
    if (newUser?._id) init();
  },
  { immediate: true, deep: true }
);

onMounted(init);
</script>

<style>
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.2rem;
  padding: 1rem 0;
}

/* Card */
.achievement-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  text-align: center;
  padding: 1rem;
  opacity: 0.35;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.achievement-card.unlocked {
  opacity: 1;
  border: 1px solid #4caf50;
  background: linear-gradient(145deg, #e8ffe8 0%, #f8fff8 100%);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.35);
}

.achievement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.75rem;
}

/*badge-sized icons */
.achievement-icon {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.text-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-grow: 1;
}

/* Text Design */
.achievement-name {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.3rem;
  color: #333;
  word-wrap: break-word;
}

.achievement-desc {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.3;
  max-height: 2.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
