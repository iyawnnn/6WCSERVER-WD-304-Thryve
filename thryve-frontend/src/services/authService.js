import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function register(payload) {
  const res = await axios.post(`${API}/auth/register`, payload);
  return res.data;
}
export async function login(payload) {
  const res = await axios.post(`${API}/auth/login`, payload);
  return res.data;
}
export async function me(token) {
  const res = await axios.get(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
