const monthMap = new Map<string, number>([
  ["Jan", 1],
  ["Feb", 2],
  ["Mar", 3],
  ["Apr", 4],
  ["May", 5],
  ["Jun", 6],
  ["Jul", 7],
  ["Aug", 8],
  ["Sep", 9],
  ["Oct", 10],
  ["Nov", 11],
  ["Dec", 12],
]);

export const formatDateToString = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

export const formatFirebaseDate = (date: Date): Date => {
  return new Date(formatDateToString(date).replace(/\//g, "-"));
};

export const formatFromDatepickerToFirebase = (date: string): Date => {
  console.log("Date picker date needs formatting: ", date);
  // 0    1   2   3      4       5        6       7        8
  // Wed May 17 2023 00:00:00 GMT-0700 (Pacific Daylight Time)

  const dateInfo = date.split(" ");
  const d = dateInfo[2];
  const m = monthMap.get(dateInfo[1] ?? "Jan");
  const y = dateInfo[3];

  if (d === undefined) return new Date(0);
  if (m === undefined) return new Date(0);
  if (y === undefined) return new Date(0);

  return new Date(`${m} ${d} ${y}`);
};
