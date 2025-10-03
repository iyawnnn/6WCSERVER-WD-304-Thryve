import Api from "../utils/api";

export default {
  getToday() {
    return Api.get("/dashboard/today");
  },
  getWeekly() {
    return Api.get("/dashboard/weekly");
  },
  getHighlights() {
    return Api.get("/dashboard/highlights");
  },
  updateGoals(goals) {
    return api.put("/users/preferences", goals);
  },
};
