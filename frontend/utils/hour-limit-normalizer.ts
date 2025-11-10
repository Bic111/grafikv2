/**
 * Utility functions for normalizing hour limit data
 * Handles compatibility between different key variants (legacy: max_miesiecznie vs canonical: max_miesięcznie)
 */

/**
 * Normalizes hour limit object to use canonical max_miesięcznie key
 * Accepts both legacy max_miesiecznie and canonical max_miesięcznie from API responses
 */
export function normalizeHourLimit(hourLimit: any): Record<string, any> {
  if (!hourLimit || typeof hourLimit !== 'object') {
    return hourLimit;
  }

  const normalized = { ...hourLimit };

  // If legacy key present, move value to canonical key
  if (Object.prototype.hasOwnProperty.call(normalized, 'max_miesiecznie') && !Object.prototype.hasOwnProperty.call(normalized, 'max_miesięcznie')) {
    (normalized as any)['max_miesięcznie'] = (normalized as any)['max_miesiecznie'];
    delete (normalized as any)['max_miesiecznie'];
  }

  return normalized;
}

/**
 * Normalizes an array of hour limit objects
 */
export function normalizeHourLimits(hourLimits: any[]): Record<string, any>[] {
  if (!Array.isArray(hourLimits)) {
    return hourLimits;
  }

  return hourLimits.map(normalizeHourLimit);
}

/**
 * Prepares hour limit data for API submission (ensures max_miesiecznie key)
 */
export function prepareForApi(hourLimit: any): Record<string, any> {
  if (!hourLimit || typeof hourLimit !== 'object') {
    return hourLimit;
  }

  const prepared = { ...hourLimit };

  // Ensure we send canonical key (API should be updated accordingly)
  if (Object.prototype.hasOwnProperty.call(prepared, 'max_miesiecznie') && !Object.prototype.hasOwnProperty.call(prepared, 'max_miesięcznie')) {
    (prepared as any)['max_miesięcznie'] = (prepared as any)['max_miesiecznie'];
    delete (prepared as any)['max_miesiecznie'];
  }

  return prepared;
}