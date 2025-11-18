/**
 * Absence entity type definition
 * Represents a period of absence for an employee (vacation, sick leave, etc.)
 */
export interface Absence {
  /** Unique identifier for the absence record */
  id: number;
  /** ID of the employee who is absent */
  pracownik_id: number;
  /** Start date of the absence (ISO 8601 format) */
  data_od: string;
  /** End date of the absence (ISO 8601 format) */
  data_do: string;
  /** Type of absence */
  typ_nieobecnosci: 'urlop' | 'zwolnienie' | 'inne';
  /** Reason or notes for the absence */
  powód?: string;
  /** Additional notes (e.g., sick leave certificate number) */
  notatki?: string;
  /** Timestamp when the absence record was created */
  utworzono?: string;
  /** Timestamp when the absence record was last updated */
  zaktualizowano?: string;
}

/**
 * Absence with employee information populated (for display purposes)
 */
export interface AbsenceWithEmployee extends Absence {
  /** Employee information (populated by API) */
  pracownik?: {
    imie: string;
    nazwisko: string;
  };
}

/**
 * Type for creating a new absence record (without id and timestamps)
 */
export type CreateAbsenceInput = Omit<Absence, 'id' | 'utworzono' | 'zaktualizowano'>;

/**
 * Type for updating an existing absence record
 */
export type UpdateAbsenceInput = Partial<CreateAbsenceInput>;

/**
 * Query parameters for filtering absences
 */
export interface AbsenceFilterParams {
  /** Filter by absence type */
  typ_nieobecnosci?: 'urlop' | 'zwolnienie' | 'inne';
  /** Filter by employee ID */
  pracownik_id?: number;
  /** Filter by year */
  rok?: number;
  /** Filter by month */
  miesiac?: number;
}
