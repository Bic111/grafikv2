/**
 * Rule entity type definition
 * Represents a business rule or constraint in the system
 */
export interface Rule {
  /** Unique identifier for the rule */
  id: string;
  /** Name of the rule */
  nazwa: string;
  /** Description of what the rule enforces */
  opis?: string;
  /** Type or category of the rule */
  typ?: string;
  /** Whether the rule is currently active */
  aktywna?: boolean;
  /** Timestamp when the record was created */
  utworzono?: string;
  /** Timestamp when the record was last updated */
  zaktualizowano?: string;
}

/**
 * Type for creating a new rule (without id and timestamps)
 */
export type CreateRuleInput = Omit<Rule, 'id' | 'utworzono' | 'zaktualizowano'>;

/**
 * Type for updating an existing rule
 */
export type UpdateRuleInput = Partial<CreateRuleInput>;

/**
 * Rule categories for organization
 */
export const RULE_TYPES = [
  'Godziny pracy',
  'Urlopy',
  'Zwolnienia',
  'Obsada',
  'Inne',
];
