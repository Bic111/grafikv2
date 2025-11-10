/**
 * Base API client with common functionality
 */

import { API_BASE_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT } from './config';
import { handleErrorResponse, NetworkError } from './errors';

/**
 * Generic fetch wrapper with error handling and timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
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
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new NetworkError(`Request timeout after ${REQUEST_TIMEOUT}ms`);
    }
    if (error instanceof TypeError) {
      throw new NetworkError('Network connection failed');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
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
