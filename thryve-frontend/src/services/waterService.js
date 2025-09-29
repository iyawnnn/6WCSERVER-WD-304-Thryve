import api from "../utils/api";

const waterService = {
  // POST /api/water
  add(amount) {
    return api.post("/water", { amount });
  },

  // GET /api/water (today's intake)
  getToday() {
    return api.get("/water");
  },

  // GET /api/water/weekly
  getWeekly() {
    return api.get("/water/weekly");
  },
};

export default waterService;