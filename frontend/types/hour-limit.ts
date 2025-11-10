/**
 * HourLimit entity type definition
 * Represents working hour limits for different employment percentages
 */
export interface HourLimit {
  /** Unique identifier for the hour limit */
  id: string;
  /** Employment percentage this limit applies to */
  etat: 1.0 | 0.75 | 0.5 | 0.25;
  /** Maximum hours allowed per day */
  max_dziennie: number;
  /** Maximum hours allowed per week */
  max_tygodniowo: number;
  /** Maximum hours allowed per month */
  max_miesięcznie: number;
  /** Maximum hours allowed per quarter */
  max_kwartalnie: number;
  /** Timestamp when the record was created */
  utworzono?: string;
  /** Timestamp when the record was last updated */
  zaktualizowano?: string;
}

/**
 * Type for creating a new hour limit (without id and timestamps)
 */
export type CreateHourLimitInput = Omit<HourLimit, 'id' | 'utworzono' | 'zaktualizowano'>;

/**
 * Type for updating an existing hour limit
 */
export type UpdateHourLimitInput = Partial<CreateHourLimitInput>;

/**
 * Employment percentages supported in the system
 */
export const EMPLOYMENT_PERCENTAGES: Array<1.0 | 0.75 | 0.5 | 0.25> = [1.0, 0.75, 0.5, 0.25];

/**
 * Display names for employment percentages
 */
export const EMPLOYMENT_LABELS: Record<1.0 | 0.75 | 0.5 | 0.25, string> = {
  1.0: '100%',
  0.75: '75%',
  0.5: '50%',
  0.25: '25%',
};
