/**
 * Central export file for all API client services
 */

export { employeeAPI } from './employees';
export { absenceAPI } from './absences';
export { shiftParameterAPI } from './shifts';
export { holidayAPI } from './holidays';
export { ruleAPI, hourLimitAPI } from './rules';
export { scheduleAPI } from './schedule';

export { apiClient } from './client';
export { ApiClient } from './client';

export {
  ApiError,
  NetworkError,
  ValidationError,
  isNetworkError,
  isValidationError,
  isApiError,
  getErrorMessage,
} from './errors';

export { API_BASE_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT } from './config';
