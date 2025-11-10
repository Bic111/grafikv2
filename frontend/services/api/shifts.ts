/**
 * API client for ShiftParameter resource
 */

import type {
  ShiftParameter,
  CreateShiftParameterInput,
  UpdateShiftParameterInput,
  ShiftParameterFilterParams,
} from '@/types';
import { ApiClient } from './client';

/**
 * ShiftParameterAPI client
 */
class ShiftParameterAPI extends ApiClient {
  /**
   * Get all shift parameters
   */
  async getAll(filters?: ShiftParameterFilterParams): Promise<ShiftParameter[]> {
    const query = this.buildQueryString(filters);
    return this.get<ShiftParameter[]>(`/api/shift-parameters${query}`);
  }

  /**
   * Get a single shift parameter by ID
   */
  async getById(id: string): Promise<ShiftParameter> {
    return this.get<ShiftParameter>(`/api/shift-parameters/${id}`);
  }

  /**
   * Create a new shift parameter
   */
  async create(data: CreateShiftParameterInput): Promise<ShiftParameter> {
    return this.post<ShiftParameter>('/api/shift-parameters', data);
  }

  /**
   * Update an existing shift parameter
   */
  async update(id: string, data: UpdateShiftParameterInput): Promise<ShiftParameter> {
    return this.put<ShiftParameter>(`/api/shift-parameters/${id}`, data);
  }

  /**
   * Delete a shift parameter
   */
  async delete(id: string): Promise<void> {
    return super.delete<void>(`/api/shift-parameters/${id}`);
  }

  /**
   * Get shift parameters for a specific day of week
   */
  async getByDay(dzien_tygodnia: number): Promise<ShiftParameter[]> {
    return this.get<ShiftParameter[]>(
      `/api/shift-parameters?day=${dzien_tygodnia}`
    );
  }

  /**
   * Get shift parameters for a specific shift type
   */
  async getByShiftType(typ_zmiany: string): Promise<ShiftParameter[]> {
    return this.get<ShiftParameter[]>(
      `/api/shift-parameters?typ_zmiany=${typ_zmiany}`
    );
  }

  /**
   * Get all parameters for all days (for comprehensive shift setup)
   */
  async getAllByDay(): Promise<Record<number, ShiftParameter[]>> {
    const params = await this.getAll();
    const grouped: Record<number, ShiftParameter[]> = {};

    for (let day = 0; day < 7; day++) {
      grouped[day] = params.filter((p) => p.dzien_tygodnia === day);
    }

    return grouped;
  }

  /**
   * Batch create shift parameters for a single day
   */
  async createBatch(shifts: CreateShiftParameterInput[]): Promise<ShiftParameter[]> {
    // Note: This assumes the backend supports batch creation
    // Otherwise, we'll need to create individual records
    const results: ShiftParameter[] = [];
    for (const shift of shifts) {
      const created = await this.create(shift);
      results.push(created);
    }
    return results;
  }
}

/**
 * Export singleton instance
 */
export const shiftParameterAPI = new ShiftParameterAPI();
