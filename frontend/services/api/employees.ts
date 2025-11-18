/**
 * API client for Employee resource
 */

import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '@/types';
import { ApiClient } from './client';

// Internal raw shape returned by backend (without stanowisko)
interface RawEmployee {
  id: number; // backend sends numeric id
  imie: string;
  nazwisko: string;
  rola_id: number | null;
  etat: 1.0 | 0.75 | 0.5 | 0.25;
  // Additional fields we ignore for now
  [key: string]: unknown;
}

// Fallback static mapping (used if /api/role not yet loaded or fails)
const ROLE_ID_TO_NAME: Record<number, Employee['stanowisko']> = {
  1: 'Kierownik',
  2: 'Z-ca kierownika',
  3: 'SSK',
  4: 'Kasjer',
};

const ROLE_NAME_TO_ID: Record<Employee['stanowisko'], number> = {
  Kierownik: 1,
  'Z-ca kierownika': 2,
  SSK: 3,
  Kasjer: 4,
};

/**
 * EmployeeAPI client
 */
class EmployeeAPI extends ApiClient {
  private rolesCache: Record<number, string> | null = null;

  private async ensureRolesCache(): Promise<void> {
    if (this.rolesCache) return;
    try {
      const roles = await this.get<Array<{ id: number; nazwa_roli: string }>>('/api/role');
      this.rolesCache = {};
      for (const r of roles) {
        this.rolesCache[r.id] = r.nazwa_roli;
      }
    } catch {
      // Fallback to static mapping
      this.rolesCache = { ...ROLE_ID_TO_NAME } as Record<number, string>;
    }
  }

  private normalize(raw: RawEmployee): Employee {
    // Map rola_id -> stanowisko using cache or fallback
    const roleName = raw.rola_id != null && this.rolesCache && this.rolesCache[raw.rola_id]
      ? this.rolesCache[raw.rola_id]
      : (raw.rola_id != null && ROLE_ID_TO_NAME[raw.rola_id]) || 'Kasjer'; // sensible default
    return {
      id: String(raw.id), // normalize to string for frontend consistency
      imie: raw.imie,
      nazwisko: raw.nazwisko,
      stanowisko: roleName as Employee['stanowisko'],
      status: (raw as any).status ?? 'Aktywny', // backend may later expose status
      etat: raw.etat,
      utworzono: (raw as any).utworzono,
      zaktualizowano: (raw as any).zaktualizowano,
    };
  }

  private async toPayload(data: CreateEmployeeInput | UpdateEmployeeInput): Promise<Record<string, unknown>> {
    // Convert stanowisko -> rola_id if present
    const payload: Record<string, unknown> = { ...data };
    if (data.stanowisko) {
      // Try dynamic cache first
      await this.ensureRolesCache();
      let rolaId: number | undefined = undefined;
      // Reverse lookup dynamic cache
      if (this.rolesCache) {
        for (const [idStr, name] of Object.entries(this.rolesCache)) {
          if (name === data.stanowisko) {
            rolaId = Number(idStr);
            break;
          }
        }
      }
      if (!rolaId) {
        rolaId = ROLE_NAME_TO_ID[data.stanowisko];
      }
      if (rolaId) {
        payload.rola_id = rolaId;
      }
      // Remove stanowisko key; backend does not understand it
      delete payload.stanowisko;
    }
    return payload;
  }

  /**
   * Get all employees
   */
  async getAll(): Promise<Employee[]> {
    await this.ensureRolesCache();
    const data = await this.get<RawEmployee[]>('/api/pracownicy');
    return data.map((r) => this.normalize(r));
  }

  /**
   * Get a single employee by ID
   */
  async getById(id: string): Promise<Employee> {
    await this.ensureRolesCache();
    const raw = await this.get<RawEmployee>(`/api/pracownicy/${id}`);
    return this.normalize(raw);
  }

  /**
   * Create a new employee
   */
  async create(data: CreateEmployeeInput): Promise<Employee> {
    const payload = await this.toPayload(data);
    const raw = await this.post<RawEmployee>('/api/pracownicy', payload);
    return this.normalize(raw);
  }

  /**
   * Update an existing employee
   */
  async update(id: string, data: UpdateEmployeeInput): Promise<Employee> {
    const payload = await this.toPayload(data);
    const raw = await this.put<RawEmployee>(`/api/pracownicy/${id}`, payload);
    return this.normalize(raw);
  }

  /**
   * Delete an employee
   */
  async delete(id: string): Promise<void> {
    // Call the base ApiClient.delete to avoid recursive self-call
    return super.delete<void>(`/api/pracownicy/${id}`);
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
