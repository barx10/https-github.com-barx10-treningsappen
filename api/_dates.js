/**
 * Date helpers for the API routes. Mirrors utils/dateUtils.ts on the client;
 * kept separate because serverless functions are plain JS with no bundling.
 */

/** Parse "YYYY-MM-DD" or an ISO string to a local-midnight Date. */
export const parseDateString = (dateStr) => {
  if (typeof dateStr === 'string' && dateStr.length === 10 && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/** Monday 00:00 of the week containing `date`. */
export const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatDate = (dateStr) => parseDateString(dateStr).toLocaleDateString('nb-NO');
