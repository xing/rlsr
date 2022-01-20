export const getYearWeek = (d: Date): [string, string] => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return [d.getUTCFullYear().toString(), weekNo.toString().padStart(2, '0')];
};
