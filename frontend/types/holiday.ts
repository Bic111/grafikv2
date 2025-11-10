/**
 * Holiday entity type definition
 * Represents a public holiday in the system
 */
export interface Holiday {
  /** Unique identifier for the holiday */
  id: string;
  /** Date of the holiday (ISO 8601 format) */
  data: string;
  /** Name of the holiday */
  nazwa: string;
  /** Description or details about the holiday */
  opis?: string;
  /** Timestamp when the record was created */
  utworzono?: string;
  /** Timestamp when the record was last updated */
  zaktualizowano?: string;
}

/**
 * Type for creating a new holiday (without id and timestamps)
 */
export type CreateHolidayInput = Omit<Holiday, 'id' | 'utworzono' | 'zaktualizowano'>;

/**
 * Type for updating an existing holiday
 */
export type UpdateHolidayInput = Partial<CreateHolidayInput>;

/**
 * Query parameters for filtering holidays
 */
export interface HolidayFilterParams {
  /** Filter by year */
  rok?: number;
  /** Filter by month */
  miesiac?: number;
}
