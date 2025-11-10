/**
 * API error handling utilities
 */

/**
 * Represents an API error with detailed information
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Represents a network or connection error
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Represents a validation error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Parse error response from API
 * @param response - Fetch response object
 * @returns Parsed error details
 */
export async function parseErrorResponse(
  response: Response
): Promise<{ message: string; details?: Record<string, unknown> }> {
  try {
    const data = await response.json();
    return {
      message: data.message || `HTTP ${response.status}: ${response.statusText}`,
      details: data.details || data,
    };
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
    };
  }
}

/**
 * Handle common HTTP errors
 * @param response - Fetch response object
 * @throws ApiError, ValidationError, or NetworkError
 */
export async function handleErrorResponse(response: Response): Promise<never> {
  const { message, details } = await parseErrorResponse(response);

  switch (response.status) {
    case 400:
      throw new ValidationError(message, details as Record<string, string[]>);
    case 401:
      throw new ApiError(response.status, 'Unauthorized: Please log in');
    case 403:
      throw new ApiError(response.status, 'Forbidden: Access denied');
    case 404:
      throw new ApiError(response.status, 'Not found');
    case 409:
      throw new ApiError(response.status, 'Conflict: Resource already exists');
    case 422:
      throw new ValidationError(message, details as Record<string, string[]>);
    case 500:
      throw new ApiError(response.status, 'Server error: Please try again later');
    case 503:
      throw new ApiError(response.status, 'Service unavailable: Please try again later');
    default:
      throw new ApiError(response.status, message || 'An error occurred');
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof NetworkError) {
    return 'Network connection failed. Please check your internet connection.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
