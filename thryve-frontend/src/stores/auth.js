import { defineStore } from "pinia";
import {
  login,
  register as apiRegister,
  me as apiMe,
} from "../services/authService";
import api from "../utils/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({ token: localStorage.getItem("token") || null, user: null }),
  actions: {
    async doRegister(payload) {
      const res = await apiRegister(payload);
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem("token", res.token);

      // Apply token to all future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;

      await this.fetchMe(); // will populate auth.user
      return res;
    },

    async doLogin(credentials) {
      const res = await login(credentials);
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem("token", res.token);

      // Set token for Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;
    },

    async fetchMe() {
      if (!this.token) return;
      try {
        // Axios now has token
        const res = await apiMe(this.token);
        this.user = res.user;
      } catch (err) {
        console.error("fetchMe failed:", err);
        this.logout();
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      api.defaults.headers.common["Authorization"] = ""; // remove token
    },
  },
});
