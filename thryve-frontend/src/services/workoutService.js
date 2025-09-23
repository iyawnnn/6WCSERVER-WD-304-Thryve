import api from "../utils/api";

export default {
  create(workout) {
    return api.post("/workouts", workout);
  },
  list(params) {
    return api.get("/workouts", { params });
  },
  update(id, workout) {
    return api.put(`/workouts/${id}`, workout);
  },
  delete(id) {
    return api.delete(`/workouts/${id}`);
  },
};
