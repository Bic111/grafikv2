/**
 * API client for Holiday resource
 */

import type {
  Holiday,
  CreateHolidayInput,
  UpdateHolidayInput,
  HolidayFilterParams,
} from '@/types';
import { ApiClient } from './client';

/**
 * HolidayAPI client
 */
class HolidayAPI extends ApiClient {
  /**
   * Get all holidays
   */
  async getAll(filters?: HolidayFilterParams): Promise<Holiday[]> {
    const query = this.buildQueryString(filters);
    return this.get<Holiday[]>(`/api/holidays${query}`);
  }

  /**
   * Get a single holiday by ID
   */
  async getById(id: string): Promise<Holiday> {
    return this.get<Holiday>(`/api/holidays/${id}`);
  }

  /**
   * Create a new holiday
   */
  async create(data: CreateHolidayInput): Promise<Holiday> {
    return this.post<Holiday>('/api/holidays', data);
  }

  /**
   * Update an existing holiday
   */
  async update(id: string, data: UpdateHolidayInput): Promise<Holiday> {
    return this.put<Holiday>(`/api/holidays/${id}`, data);
  }

  /**
   * Delete a holiday
   */
  async delete(id: string): Promise<void> {
    return super.delete<void>(`/api/holidays/${id}`);
  }

  /**
   * Get holidays for a specific year
   */
  async getByYear(rok: number): Promise<Holiday[]> {
    return this.get<Holiday[]>(`/api/holidays?rok=${rok}`);
  }

  /**
   * Get holidays for a specific month
   */
  async getByMonth(rok: number, miesiac: number): Promise<Holiday[]> {
    return this.get<Holiday[]>(
      `/api/holidays?rok=${rok}&miesiac=${miesiac}`
    );
  }

  /**
   * Check if a specific date is a holiday
   */
  async isHoliday(data: string): Promise<boolean> {
    const holidays = await this.getAll();
    return holidays.some((h) => h.data === data);
  }

  /**
   * Get all holidays between two dates
   */
  async getRange(dataOd: string, dataDo: string): Promise<Holiday[]> {
    const all = await this.getAll();
    const od = new Date(dataOd);
    const do_ = new Date(dataDo);

    return all.filter((h) => {
      const hDate = new Date(h.data);
      return hDate >= od && hDate <= do_;
    });
  }
}

/**
 * Export singleton instance
 */
export const holidayAPI = new HolidayAPI();
