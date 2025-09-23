import axios from 'axios';
import { getToken } from './token';

const api = axios.create({
  baseURL: "/api", 
});

// Attach token from localStorage or sessionStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // disable cache
  config.headers["Cache-Control"] = "no-cache";
  return config;
});


export default api;
