/**
 * Date utility functions for vacation and absence calculations
 */

/**
 * Calculate the number of days between two dates (inclusive)
 * @param startDate - Start date string (YYYY-MM-DD) or Date object
 * @param endDate - End date string (YYYY-MM-DD) or Date object
 * @returns Number of days between the dates (inclusive)
 */
export function calculateVacationDays(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // Reset time to midnight to avoid timezone issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Add 1 to make it inclusive (both start and end dates count)
  return diffDays + 1;
}

/**
 * Format date to YYYY-MM-DD string
 * @param date - Date object or string
 * @returns Formatted date string
 */
export function formatDateToISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format date to Polish locale (DD.MM.YYYY)
 * @param date - Date object or string (YYYY-MM-DD)
 * @returns Formatted date string (DD.MM.YYYY)
 */
export function formatDateToPL(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Get current year
 * @returns Current year as number
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get current month (1-12)
 * @returns Current month as number
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

/**
 * Parse Polish date format (DD.MM.YYYY) to Date object
 * @param dateStr - Date string in DD.MM.YYYY format
 * @returns Date object
 */
export function parsePLDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
}
