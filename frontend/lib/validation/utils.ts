/**
 * Form validation utilities
 */

import { FieldErrors } from 'react-hook-form';

/**
 * Extract error message from form errors
 */
export function getFieldError<T>(
  errors: FieldErrors<T>,
  fieldName: keyof T
): string | undefined {
  const error = errors[fieldName];
  if (!error) return undefined;
  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Błąd walidacji';
}

/**
 * Check if field has error
 */
export function hasFieldError<T>(
  errors: FieldErrors<T>,
  fieldName: keyof T
): boolean {
  return !!errors[fieldName];
}

/**
 * Format date for input (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format date for display (DD.MM.YYYY)
 */
export function formatDateForDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pl-PL');
}

/**
 * Parse time string (HH:MM) to minutes
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes to time string (HH:MM)
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculate duration in days between two dates
 */
export function calculateDaysDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

/**
 * Get day name from day number
 */
export function getDayName(dayNumber: 0 | 1 | 2 | 3 | 4 | 5 | 6): string {
  const days = [
    'Poniedziałek',
    'Wtorek',
    'Środa',
    'Czwartek',
    'Piątek',
    'Sobota',
    'Niedziela',
  ];
  return days[dayNumber];
}

/**
 * Get employment percentage label
 */
export function getEtatLabel(etat: 1.0 | 0.75 | 0.5 | 0.25): string {
  const labels: Record<1.0 | 0.75 | 0.5 | 0.25, string> = {
    1.0: '100%',
    0.75: '75%',
    0.5: '50%',
    0.25: '25%',
  };
  return labels[etat];
}
