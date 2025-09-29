import api from "../utils/api";

const sleepService = {
  // POST /api/sleep
  addLog(bedTime, wakeTime) {
    return api.post("/sleep", { bedTime, wakeTime });
  },

  // GET /api/sleep/today
  getToday() {
    return api.get("/sleep/today");
  },

  // GET /api/sleep/weekly
  getWeekly() {
    return api.get("/sleep/weekly");
  },
};

export default sleepService;
