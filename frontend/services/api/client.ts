/**
 * Base API client with common functionality
 */

import { API_BASE_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT } from './config';
import { handleErrorResponse, NetworkError } from './errors';

/**
 * Generic fetch wrapper with error handling and timeout
 * Reduced maxRetries to 1 for faster failure feedback
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 1
): Promise<Response> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        await handleErrorResponse(response);
      }

      return response;
    } catch (error) {
      lastError = error;

      const isRetryableError =
        (error instanceof DOMException && error.name === 'AbortError') ||
        error instanceof TypeError;

      if (!isRetryableError || attempt === maxRetries) {
        if (isRetryableError && attempt === maxRetries) {
          console.warn(`Network error after ${maxRetries + 1} attempts, giving up:`, error);
        }
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new NetworkError(`Request timeout after ${REQUEST_TIMEOUT}ms`);
        }
        if (error instanceof TypeError) {
          throw new NetworkError('Network connection failed');
        }
        throw error;
      }

      const delayMs = Math.pow(2, attempt) * 1000;
      console.warn(`Network error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delayMs}ms:`, error);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      // continue to next attempt
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw (lastError instanceof Error ? lastError : new Error('Unknown error occurred'));
}

/**
 * Base API client class
 */
export class ApiClient {
  protected baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'GET',
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
    });
    return response.json();
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'POST',
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'PUT',
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  }

  /**
   * Make a DELETE request
   */
  async delete<T = void>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'DELETE',
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
    });

    // Return void for DELETE requests that have no content
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * Build query string from parameters
   */
  protected buildQueryString(params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    }

    return `?${searchParams.toString()}`;
  }
}

/**
 * Export singleton instance
 */
export const apiClient = new ApiClient();
