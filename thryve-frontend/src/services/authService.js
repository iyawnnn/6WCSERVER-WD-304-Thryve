import axios from "axios";
import api from "../utils/api"; 

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function register(payload) {
  const res = await axios.post(`${API}/auth/register`, payload);
  return res.data;
}
export async function login(payload) {
  const res = await axios.post(`${API}/auth/login`, payload);
  return res.data;
}
export async function me() {
  const res = await api.get("/auth/me"); 
  return res.data;
}
