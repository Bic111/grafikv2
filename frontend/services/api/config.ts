/**
 * API configuration and utilities
 */

/**
 * Determine runtime environment (browser vs. server)
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Base URL for API requests
 * - In przeglądarka: domyślnie ten sam origin (np. Next.js proxy lub API routes)
 * - W środowisku serwerowym/testowym: można skonfigurować przez zmienne środowiskowe
 */
export const API_BASE_URL = isBrowser
  ? process.env.NEXT_PUBLIC_API_URL ?? ''
  : process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

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
