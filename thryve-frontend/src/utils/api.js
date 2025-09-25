import axios from 'axios';
import { getToken } from './token';

const api = axios.create({
  baseURL: "/api", 
});

api.interceptors.request.use(config => {
  const token = getToken() || localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Cache-Control"] = "no-cache";
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


export default api;
