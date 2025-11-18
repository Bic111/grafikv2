
/**
 * Utility functions for normalizing rule data
 * Aligns persistence boundary with the same approach as hour limits
 * - Trim strings
 * - Convert empty strings to undefined
 * - Keep API payloads minimal and consistent
 */

import type { Rule, CreateRuleInput, UpdateRuleInput } from '@/types';

/**
 * Normalize a single Rule object returned from API
 * Ensures trimmed strings and undefined instead of empty strings
 */
export function normalizeRule(rule: any): Rule {
  if (!rule || typeof rule !== 'object') return rule as Rule;

  const out: any = { ...rule };

  if (typeof out.nazwa === 'string') out.nazwa = out.nazwa.trim();
  if (typeof out.opis === 'string') out.opis = out.opis.trim() || undefined;
  if (typeof out.typ === 'string') out.typ = out.typ.trim() || undefined;

  return out as Rule;
}

/**
 * Normalize an array of Rule objects
 */
export function normalizeRules(rules: any[]): Rule[] {
  if (!Array.isArray(rules)) return rules as unknown as Rule[];
  return rules.map(normalizeRule) as Rule[];
}

/**
 * Prepare rule payload for API (create/update)
 * Trims strings and removes empty-string fields to avoid backend confusion
 */
export function prepareRuleForApi<T extends Partial<CreateRuleInput> | Partial<UpdateRuleInput>>(data: T): T {
  if (!data || typeof data !== 'object') return data;

  const out: any = { ...data };
  if (typeof out.nazwa === 'string') out.nazwa = out.nazwa.trim();
  if (typeof out.opis === 'string') {
    const v = out.opis.trim();
    out.opis = v === '' ? undefined : v;
  }
  if (typeof out.typ === 'string') {
    const v = out.typ.trim();
    out.typ = v === '' ? undefined : v;
  }

  return out as T;
}
