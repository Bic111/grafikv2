/**
 * API client for Absence resource (vacations and sick leaves)
 */

import type {
  Absence,
  CreateAbsenceInput,
  UpdateAbsenceInput,
  AbsenceFilterParams,
} from '@/types';
import { ApiClient } from './client';

/**
 * AbsenceAPI client
 */
class AbsenceAPI extends ApiClient {
  /**
   * Get all absences
   */
  async getAll(filters?: AbsenceFilterParams): Promise<Absence[]> {
    const query = this.buildQueryString(filters);
    return this.get<Absence[]>(`/api/nieobecnosci${query}`);
  }

  /**
   * Get a single absence by ID
   */
  async getById(id: string): Promise<Absence> {
    return this.get<Absence>(`/api/nieobecnosci/${id}`);
  }

  /**
   * Create a new absence record
   */
  async create(data: CreateAbsenceInput): Promise<Absence> {
    return this.post<Absence>('/api/nieobecnosci', data);
  }

  /**
   * Update an existing absence record
   */
  async update(id: string, data: UpdateAbsenceInput): Promise<Absence> {
    return this.put<Absence>(`/api/nieobecnosci/${id}`, data);
  }

  /**
   * Delete an absence record
   */
  async delete(id: string): Promise<void> {
    return this.delete<void>(`/api/nieobecnosci/${id}`);
  }

  /**
   * Get vacations (urlop) for a specific period
   */
  async getVacations(rok: number, miesiac?: number): Promise<Absence[]> {
    const query = this.buildQueryString({
      typ: 'urlop',
      rok,
      ...(miesiac && { miesiac }),
    });
    return this.get<Absence[]>(`/api/nieobecnosci${query}`);
  }

  /**
   * Get sick leaves (zwolnienia) for a specific period
   */
  async getSickLeaves(rok: number, miesiac?: number): Promise<Absence[]> {
    const query = this.buildQueryString({
      typ: 'zwolnienie',
      rok,
      ...(miesiac && { miesiac }),
    });
    return this.get<Absence[]>(`/api/nieobecnosci${query}`);
  }

  /**
   * Get absences for a specific employee
   */
  async getByEmployee(pracownik_id: string): Promise<Absence[]> {
    return this.get<Absence[]>(`/api/nieobecnosci?pracownik_id=${pracownik_id}`);
  }

  /**
   * Get absences by type
   */
  async getByType(typ: 'urlop' | 'zwolnienie' | 'inne'): Promise<Absence[]> {
    return this.get<Absence[]>(`/api/nieobecnosci?typ=${typ}`);
  }

  /**
   * Calculate number of days between two dates (for vacation duration)
   */
  calculateDays(dataOd: string, dataDo: string): number {
    const od = new Date(dataOd);
    const do_ = new Date(dataDo);
    const diffTime = Math.abs(do_.getTime() - od.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }
}

/**
 * Export singleton instance
 */
export const absenceAPI = new AbsenceAPI();
