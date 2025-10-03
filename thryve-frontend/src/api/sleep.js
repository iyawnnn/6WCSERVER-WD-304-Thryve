import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Add a new sleep log
export async function addSleepLog(bedTime, wakeTime, token) {
  const res = await api.post(
    "/sleep",
    { bedTime, wakeTime },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// Get today's sleep duration
export async function getTodaySleep(token) {
  const res = await api.get("/sleep/today", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Get weekly sleep logs
export async function getWeeklySleep(token) {
  const res = await api.get("/sleep/weekly", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export default api;
