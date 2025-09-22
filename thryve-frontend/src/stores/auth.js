import { defineStore } from 'pinia';
import { login, register as apiRegister, me as apiMe } from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: localStorage.getItem('token') || null, user: null }),
  actions: {
    async doLogin(credentials) {
      const res = await login(credentials);
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem('token', res.token);
    },
    async doRegister(payload) {
      const res = await apiRegister(payload);
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem('token', res.token);
    },
    async fetchMe() {
      if (!this.token) return;
      const res = await apiMe(this.token);
      this.user = res.user;
    },
    logout() {
      this.token = null; this.user = null;
      localStorage.removeItem('token');
    }
  }
});
