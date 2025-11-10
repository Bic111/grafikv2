/**
 * API client for Employee resource
 */

import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '@/types';
import { ApiClient } from './client';

/**
 * EmployeeAPI client
 */
class EmployeeAPI extends ApiClient {
  /**
   * Get all employees
   */
  async getAll(): Promise<Employee[]> {
    return this.get<Employee[]>('/api/pracownicy');
  }

  /**
   * Get a single employee by ID
   */
  async getById(id: string): Promise<Employee> {
    return this.get<Employee>(`/api/pracownicy/${id}`);
  }

  /**
   * Create a new employee
   */
  async create(data: CreateEmployeeInput): Promise<Employee> {
    return this.post<Employee>('/api/pracownicy', data);
  }

  /**
   * Update an existing employee
   */
  async update(id: string, data: UpdateEmployeeInput): Promise<Employee> {
    return this.put<Employee>(`/api/pracownicy/${id}`, data);
  }

  /**
   * Delete an employee
   */
  async delete(id: string): Promise<void> {
    return this.delete<void>(`/api/pracownicy/${id}`);
  }

  /**
   * Get employees by position
   */
  async getByPosition(
    stanowisko: 'Kierownik' | 'Z-ca kierownika' | 'SSK' | 'Kasjer'
  ): Promise<Employee[]> {
    return this.get<Employee[]>(`/api/pracownicy?stanowisko=${stanowisko}`);
  }

  /**
   * Get employees by status
   */
  async getByStatus(status: 'Aktywny' | 'Na urlopie' | 'Chorobowe'): Promise<Employee[]> {
    return this.get<Employee[]>(`/api/pracownicy?status=${status}`);
  }

  /**
   * Get employees by employment percentage
   */
  async getByEtat(etat: 1.0 | 0.75 | 0.5 | 0.25): Promise<Employee[]> {
    return this.get<Employee[]>(`/api/pracownicy?etat=${etat}`);
  }
}

/**
 * Export singleton instance
 */
export const employeeAPI = new EmployeeAPI();
