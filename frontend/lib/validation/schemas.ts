/**
 * Zod validation schemas for all entities
 */

import { z } from 'zod';

/**
 * Employee validation schema
 */
export const employeeSchema = z.object({
  id: z.string().optional(),
  imie: z.string().min(1, 'Imię jest wymagane').min(2, 'Imię musi mieć co najmniej 2 znaki'),
  nazwisko: z
    .string()
    .min(1, 'Nazwisko jest wymagane')
    .min(2, 'Nazwisko musi mieć co najmniej 2 znaki'),
  stanowisko: z.enum(['Kierownik', 'Z-ca kierownika', 'SSK', 'Kasjer'], {
    errorMap: () => ({ message: 'Proszę wybrać prawidłowe stanowisko' }),
  }),
  status: z.enum(['Aktywny', 'Na urlopie', 'Chorobowe'], {
    errorMap: () => ({ message: 'Proszę wybrać prawidłowy status' }),
  }),
  etat: z.enum([1.0, 0.75, 0.5, 0.25] as const, {
    errorMap: () => ({ message: 'Proszę wybrać prawidłowy etat' }),
  }),
  utworzono: z.string().optional(),
  zaktualizowano: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

/**
 * Absence validation schema
 */
export const absenceSchema = z.object({
  id: z.string().optional(),
  pracownik_id: z.string().min(1, 'Pracownik jest wymagany'),
  data_od: z.string().min(1, 'Data początkowa jest wymagana'),
  data_do: z.string().min(1, 'Data końcowa jest wymagana'),
  typ: z.enum(['urlop', 'zwolnienie', 'inne'], {
    errorMap: () => ({ message: 'Proszę wybrać prawidłowy typ nieobecności' }),
  }),
  powód: z.string().optional(),
  notatki: z.string().optional(),
  utworzono: z.string().optional(),
  zaktualizowano: z.string().optional(),
}).refine((data) => new Date(data.data_od) <= new Date(data.data_do), {
  message: 'Data początkowa musi być przed datą końcową',
  path: ['data_do'],
});

export type AbsenceFormData = z.infer<typeof absenceSchema>;

/**
 * Shift Parameter validation schema
 */
export const shiftParameterSchema = z.object({
  id: z.string().optional(),
  dzień_tygodnia: z
    .number()
    .int()
    .min(0, 'Dzień musi być od 0 do 6')
    .max(6, 'Dzień musi być od 0 do 6'),
  typ_zmiany: z.enum(['Rano', 'Środek', 'Popoludniu'], {
    errorMap: () => ({ message: 'Proszę wybrać prawidłowy typ zmiany' }),
  }),
  godzina_od: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Proszę podać czas w formacie HH:MM'),
  godzina_do: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Proszę podać czas w formacie HH:MM'),
  liczba_obsad: z
    .number()
    .int()
    .positive('Liczba obsad musi być większa od 0'),
  czy_prowadzący: z.boolean().default(false),
  utworzono: z.string().optional(),
  zaktualizowano: z.string().optional(),
}).refine(
  (data) => {
    const [fromHour, fromMin] = data.godzina_od.split(':').map(Number);
    const [toHour, toMin] = data.godzina_do.split(':').map(Number);
    return fromHour * 60 + fromMin < toHour * 60 + toMin;
  },
  {
    message: 'Godzina rozpoczęcia musi być przed godziną zakończenia',
    path: ['godzina_do'],
  }
);

export type ShiftParameterFormData = z.infer<typeof shiftParameterSchema>;

/**
 * Holiday validation schema
 */
export const holidaySchema = z.object({
  id: z.string().optional(),
  data: z.string().min(1, 'Data jest wymagana'),
  nazwa: z.string().min(1, 'Nazwa jest wymagana').min(2, 'Nazwa musi mieć co najmniej 2 znaki'),
  opis: z.string().optional(),
  utworzono: z.string().optional(),
  zaktualizowano: z.string().optional(),
});

export type HolidayFormData = z.infer<typeof holidaySchema>;

/**
 * Hour Limit validation schema
 */
export const hourLimitSchema = z.object({
  id: z.string().optional(),
  etat: z.enum([1.0, 0.75, 0.5, 0.25] as const, {
    errorMap: () => ({ message: 'Proszę wybrać prawidłowy etat' }),
  }),
  max_dziennie: z
    .number()
    .positive('Liczba godzin musi być większa od 0'),
  max_tygodniowo: z
    .number()
    .positive('Liczba godzin musi być większa od 0'),
  max_miesięcznie: z
    .number()
    .positive('Liczba godzin musi być większa od 0'),
  max_kwartalnie: z
    .number()
    .positive('Liczba godzin musi być większa od 0'),
  utworzono: z.string().optional(),
  zaktualizowano: z.string().optional(),
}).refine(
  (data) =>
    data.max_dziennie * 5 <= data.max_tygodniowo &&
    data.max_tygodniowo * 4 <= data.max_miesięcznie &&
    data.max_miesięcznie * 3 <= data.max_kwartalnie,
  {
    message: 'Limity muszą być spójne (dzienny < tygodniowy < miesięczny < kwartalny)',
    path: ['max_kwartalnie'],
  }
);

export type HourLimitFormData = z.infer<typeof hourLimitSchema>;

/**
 * Rule validation schema
 */
export const ruleSchema = z.object({
  id: z.string().optional(),
  nazwa: z.string().min(1, 'Nazwa jest wymagana').min(2, 'Nazwa musi mieć co najmniej 2 znaki'),
  opis: z.string().optional(),
  typ: z.string().optional(),
  aktywna: z.boolean().default(true),
  utworzono: z.string().optional(),
  zaktualizowano: z.string().optional(),
});

export type RuleFormData = z.infer<typeof ruleSchema>;
