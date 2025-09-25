export function getWeekRange(startOfWeek = 0) {
  const today = new Date();
  const day = today.getDay();
  const diff = (day - startOfWeek + 7) % 7;

  const start = new Date(today);
  start.setDate(today.getDate() - diff);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const format = (date) => date.toISOString().split("T")[0];
  return `${format(start)} → ${format(end)}`;
}
