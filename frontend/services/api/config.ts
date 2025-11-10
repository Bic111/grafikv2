/**
 * API configuration and utilities
 */

/**
 * Base URL for API requests
 * Can be overridden via environment variables
 */
export const API_BASE_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    : process.env.API_URL || 'http://localhost:5000';

/**
 * Common HTTP headers for API requests
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

/**
 * Timeout for API requests (in milliseconds)
 */
export const REQUEST_TIMEOUT = 30000;
