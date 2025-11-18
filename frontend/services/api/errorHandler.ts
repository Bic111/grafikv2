/**
 * Centralized API error handler utility
 *
 * This module re-exports all error handling functionality from errors.ts
 * to maintain compatibility with the implementation plan that references errorHandler.ts
 */

export {
  ApiError,
  NetworkError,
  ValidationError,
  parseErrorResponse,
  handleErrorResponse,
  isNetworkError,
  isValidationError,
  isApiError,
  getErrorMessage,
} from './errors';
