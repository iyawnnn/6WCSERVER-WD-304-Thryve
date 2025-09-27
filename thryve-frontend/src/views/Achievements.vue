<template>
  <div class="achievements-page">
    <h1>My Achievements</h1>
    <div class="achievement-grid">
      <div
        v-for="ach in achievementsList"
        :key="ach.type"
        class="achievement-card"
        :class="{ unlocked: unlockedTypes.includes(ach.type.toLowerCase()) }"
      >
        <img :src="ach.iconUrl" :alt="ach.name" />
        <p>{{ ach.name }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from "vue";
import api from "../utils/api";
import { useAuthStore } from "../stores/auth";

export default {
  setup() {
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
        console.log("Master achievements loaded:", achievementsList.value);
      } catch (err) {
        console.error(
          "Error fetching master achievements:",
          err.response?.data || err.message
        );
      }
    };

    const fetchUserAchievements = async () => {
      if (!auth.user?._id) {
        console.warn("No user logged in, skipping user achievements");
        return;
      }
      try {
        await api.post(
          `/achievements/check/${auth.user._id}`,
          {},
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        console.log("User achievements checked");

        const { data } = await api.get(`/achievements/${auth.user._id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        unlockedTypes.value = data.map((a) => a.type.trim().toLowerCase());
        console.log("User unlocked types:", unlockedTypes.value);
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

    return { achievementsList, unlockedTypes };
  },
};
</script>

<style>
.achievements-page {
  padding: 2rem;
}

.achievement-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.achievement-card {
  width: 140px;
  height: 160px;
  border: 1px solid #ccc;
  border-radius: 12px;
  text-align: center;
  padding: 1rem;
  opacity: 0.3;
  transition: 0.2s;
}

.achievement-card img {
  width: 64px;
  height: 64px;
  margin-bottom: 0.5rem;
}

.achievement-card.unlocked {
  opacity: 1;
  border-color: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}
</style>
