/**
 * ShiftParameter entity type definition
 * Represents a shift configuration for a specific day of the week
 */
export interface ShiftParameter {
  /** Unique identifier for the shift parameter */
  id: string;
  /** Day of the week (0=Monday, 6=Sunday) */
  dzien_tygodnia: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Type of shift */
  typ_zmiany: 'Rano' | 'Środek' | 'Popoludniu';
  /** Shift start time (HH:MM format) */
  godzina_od: string;
  /** Shift end time (HH:MM format) */
  godzina_do: string;
  /** Number of positions to fill for this shift */
  liczba_obsad: number;
  /** Whether this shift requires a shift lead */
  czy_prowadzacy: boolean;
  /** Timestamp when the record was created */
  utworzono?: string;
  /** Timestamp when the record was last updated */
  zaktualizowano?: string;
}

/**
 * Grouped shift parameters by day of week
 */
export interface ShiftParametersByDay {
  [dayNumber: number]: ShiftParameter[];
}

/**
 * Type for creating a new shift parameter (without id and timestamps)
 */
export type CreateShiftParameterInput = Omit<ShiftParameter, 'id' | 'utworzono' | 'zaktualizowano'>;

/**
 * Type for updating an existing shift parameter
 */
export type UpdateShiftParameterInput = Partial<CreateShiftParameterInput>;

/**
 * Query parameters for filtering shift parameters
 */
export interface ShiftParameterFilterParams {
  /** Filter by day of week */
  day?: number;
  /** Filter by shift type */
  typ_zmiany?: string;
}

/**
 * Day names for UI display
 */
export const DAY_NAMES = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela',
];

/**
 * Shift type names for UI display
 */
export const SHIFT_TYPES = ['Rano', 'Środek', 'Popoludniu'];
