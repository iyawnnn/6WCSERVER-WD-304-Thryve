import api from "../utils/api";

export default {
  create(meal) {
    return api.post("/meals", meal);
  },
  list(params) {
    return api.get("/meals", { params });
  },
  update(id, meal) {
    return api.put(`/meals/${id}`, meal);
  },
  delete(id) {
    return api.delete(`/meals/${id}`);
  },
};
