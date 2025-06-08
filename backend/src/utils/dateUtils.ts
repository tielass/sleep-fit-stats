/**
 * Date utility functions for the backend
 */

/**
 * Get ISO date string (YYYY-MM-DD) for a Date object
 */
export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get the date for a specific number of days ago
 */
export const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Get ISO date string for a specific number of days ago
 */
export const daysAgoString = (days: number): string => {
  return toISODateString(daysAgo(days));
};

/**
 * Get today's date as ISO string
 */
export const todayString = (): string => {
  return toISODateString(new Date());
};

/**
 * Get start and end date strings for a period
 * @returns [startDate, endDate] as ISO date strings
 */
export const getDateRange = (period: 'week' | 'month' | 'year'): [string, string] => {
  const today = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = daysAgo(7);
      break;
    case 'month':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      startDate = daysAgo(7);
  }

  return [toISODateString(startDate), toISODateString(today)];
};

/**
 * Check if a date string is valid (YYYY-MM-DD)
 */
export const isValidDateString = (dateString: string): boolean => {
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Get the week number for a date
 * Week 1 is the week with the first Thursday in the year
 */
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  // Calculate full weeks to nearest Thursday
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return weekNumber;
};
