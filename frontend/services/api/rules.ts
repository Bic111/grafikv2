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

/**
 * RuleAPI client
 */
class RuleAPI extends ApiClient {
  /**
   * Get all rules
   */
  async getAll(): Promise<Rule[]> {
    return this.get<Rule[]>('/api/rules');
  }

  /**
   * Get a single rule by ID
   */
  async getById(id: string): Promise<Rule> {
    return this.get<Rule>(`/api/rules/${id}`);
  }

  /**
   * Create a new rule
   */
  async create(data: CreateRuleInput): Promise<Rule> {
    return this.post<Rule>('/api/rules', data);
  }

  /**
   * Update an existing rule
   */
  async update(id: string, data: UpdateRuleInput): Promise<Rule> {
    return this.put<Rule>(`/api/rules/${id}`, data);
  }

  /**
   * Delete a rule
   */
  async delete(id: string): Promise<void> {
    return this.delete<void>(`/api/rules/${id}`);
  }

  /**
   * Get rules by type
   */
  async getByType(typ: string): Promise<Rule[]> {
    return this.get<Rule[]>(`/api/rules?typ=${typ}`);
  }

  /**
   * Get active rules
   */
  async getActive(): Promise<Rule[]> {
    return this.get<Rule[]>('/api/rules?aktywna=true');
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
    return this.get<HourLimit[]>('/api/hour-limits');
  }

  /**
   * Get a single hour limit by ID
   */
  async getById(id: string): Promise<HourLimit> {
    return this.get<HourLimit>(`/api/hour-limits/${id}`);
  }

  /**
   * Get hour limit by employment percentage
   */
  async getByEtat(etat: 1.0 | 0.75 | 0.5 | 0.25): Promise<HourLimit> {
    return this.get<HourLimit>(`/api/hour-limits?etat=${etat}`);
  }

  /**
   * Create a new hour limit
   */
  async create(data: CreateHourLimitInput): Promise<HourLimit> {
    return this.post<HourLimit>('/api/hour-limits', data);
  }

  /**
   * Update an existing hour limit
   */
  async update(id: string, data: UpdateHourLimitInput): Promise<HourLimit> {
    return this.put<HourLimit>(`/api/hour-limits/${id}`, data);
  }

  /**
   * Delete an hour limit
   */
  async delete(id: string): Promise<void> {
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
      const limitKey = `max_${periodType === 'quarterly' ? 'kwartalnie' : periodType === 'monthly' ? 'miesięcznie' : periodType === 'weekly' ? 'tygodniowo' : 'dziennie'}`;
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
