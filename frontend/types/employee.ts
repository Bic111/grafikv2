/**
 * Employee entity type definition
 * Represents an employee in the system with basic information
 */
export interface Employee {
  /** Unique identifier for the employee */
  id: string;
  /** Employee's first name */
  imie: string;
  /** Employee's last name */
  nazwisko: string;
  /** Employee's job position/role */
  stanowisko: 'Kierownik' | 'Z-ca kierownika' | 'SSK' | 'Kasjer';
  /** Employee's current status */
  status: 'Aktywny' | 'Na urlopie' | 'Chorobowe';
  /** Employment percentage (1.0, 0.75, 0.5, 0.25) */
  etat: 1.0 | 0.75 | 0.5 | 0.25;
  /** Timestamp when the employee record was created */
  utworzono?: string;
  /** Timestamp when the employee record was last updated */
  zaktualizowano?: string;
}

/**
 * Type for creating a new employee (without id and timestamps)
 */
export type CreateEmployeeInput = Omit<Employee, 'id' | 'utworzono' | 'zaktualizowano'>;

/**
 * Type for updating an existing employee
 */
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;
