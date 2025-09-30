import { MET_VALUES } from "./metValues";

export function calculateCalories(type, duration, weightKg) {
  const met = MET_VALUES[type] || 1;
  const caloriesPerMinute = (met * weightKg * 3.5) / 200;
  return Math.round(caloriesPerMinute * duration);
}