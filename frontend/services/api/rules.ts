/**
 * API client for Rule resource
 */

import type {
  Rule,
  CreateRuleInput,
  UpdateRuleInput,
  HourLimit,
  CreateHourLimitInput,
  UpdateHourLimitInput,
} from '@/types';
import { ApiClient } from './client';
import { normalizeHourLimit, normalizeHourLimits, prepareForApi } from '@/utils/hour-limit-normalizer';
import { normalizeRule, normalizeRules, prepareRuleForApi } from '@/utils/rule-normalizer';

/**
 * RuleAPI client
 */
class RuleAPI extends ApiClient {
  /**
   * Get all rules
   */
  async getAll(): Promise<Rule[]> {
    const data = await this.get<Rule[]>('/api/rules');
    return normalizeRules(data);
  }

  /**
   * Get a single rule by ID
   */
  async getById(id: string): Promise<Rule> {
    const data = await this.get<Rule>(`/api/rules/${id}`);
    return normalizeRule(data);
  }

  /**
   * Create a new rule
   */
  async create(data: CreateRuleInput): Promise<Rule> {
    const prepared = prepareRuleForApi<CreateRuleInput>(data);
    const created = await this.post<Rule>('/api/rules', prepared);
    return normalizeRule(created);
  }

  /**
   * Update an existing rule
   */
  async update(id: string, data: UpdateRuleInput): Promise<Rule> {
    const prepared = prepareRuleForApi<UpdateRuleInput>(data);
    const updated = await this.put<Rule>(`/api/rules/${id}`, prepared);
    return normalizeRule(updated);
  }

  /**
   * Delete a rule
   */
  async removeRule(id: string): Promise<void> {
    return this.delete<void>(`/api/rules/${id}`);
  }

  /**
   * Get rules by type
   */
  async getByType(typ: string): Promise<Rule[]> {
    const data = await this.get<Rule[]>(`/api/rules?typ=${typ}`);
    return normalizeRules(data);
  }

  /**
   * Get active rules
   */
  async getActive(): Promise<Rule[]> {
    const data = await this.get<Rule[]>('/api/rules?aktywna=true');
    return normalizeRules(data);
  }

  /**
   * Alias for consistency with other API clients
   */
  async delete(id: string): Promise<void> {
    return this.removeRule(id);
  }
}

/**
 * HourLimitAPI client
 */
class HourLimitAPI extends ApiClient {
  /**
   * Get all hour limits
   */
  async getAll(): Promise<HourLimit[]> {
    const data = await this.get<HourLimit[]>('/api/hour-limits');
    return normalizeHourLimits(data) as HourLimit[];
  }

  /**
   * Get a single hour limit by ID
   */
  async getById(id: string): Promise<HourLimit> {
    const data = await this.get<HourLimit>(`/api/hour-limits/${id}`);
    return normalizeHourLimit(data) as HourLimit;
  }

  /**
   * Get hour limit by employment percentage
   */
  async getByEtat(etat: 1.0 | 0.75 | 0.5 | 0.25): Promise<HourLimit> {
    const data = await this.get<HourLimit>(`/api/hour-limits?etat=${etat}`);
    return normalizeHourLimit(data) as HourLimit;
  }

  /**
   * Create a new hour limit
   */
  async create(data: CreateHourLimitInput): Promise<HourLimit> {
    const preparedData = prepareForApi(data);
    return this.post<HourLimit>('/api/hour-limits', preparedData);
  }

  /**
   * Update an existing hour limit
   */
  async update(id: string, data: UpdateHourLimitInput): Promise<HourLimit> {
    const preparedData = prepareForApi(data);
    return this.put<HourLimit>(`/api/hour-limits/${id}`, preparedData);
  }

  /**
   * Delete an hour limit
   */
  async removeLimit(id: string): Promise<void> {
    return this.delete<void>(`/api/hour-limits/${id}`);
  }

  /**
   * Check if hours exceed limit for a given employment percentage
   */
  async checkLimitExceeded(
    etat: 1.0 | 0.75 | 0.5 | 0.25,
    hours: number,
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  ): Promise<boolean> {
    try {
      const limit = await this.getByEtat(etat);
      const limitKey = `max_${periodType === 'quarterly' ? 'kwartalnie' : periodType === 'monthly' ? 'miesiecznie' : periodType === 'weekly' ? 'tygodniowo' : 'dziennie'}`;
      const maxHours = limit[limitKey as keyof HourLimit] as number;
      return hours > maxHours;
    } catch {
      return false;
    }
  }
}

/**
 * Export singleton instances
 */
export const ruleAPI = new RuleAPI();
export const hourLimitAPI = new HourLimitAPI();
