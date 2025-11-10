/**
 * Central export file for validation schemas and utilities
 */

export {
  employeeSchema,
  absenceSchema,
  shiftParameterSchema,
  holidaySchema,
  hourLimitSchema,
  ruleSchema,
  type EmployeeFormData,
  type AbsenceFormData,
  type ShiftParameterFormData,
  type HolidayFormData,
  type HourLimitFormData,
  type RuleFormData,
} from './schemas';

export {
  getFieldError,
  hasFieldError,
  formatDateForInput,
  formatDateForDisplay,
  parseTimeToMinutes,
  formatMinutesToTime,
  calculateDaysDuration,
  isValidDateRange,
  getDayName,
  getEtatLabel,
} from './utils';
