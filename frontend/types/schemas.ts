/**
 * Zod validation schemas for form inputs
 */

import { z } from 'zod';

/**
 * Employee form validation schema
 */
export const employeeFormSchema = z.object({
  imie: z
    .string()
    .min(1, 'Imię jest wymagane')
    .min(2, 'Imię musi mieć co najmniej 2 znaki')
    .max(80, 'Imię może mieć maksymalnie 80 znaków'),
  nazwisko: z
    .string()
    .min(1, 'Nazwisko jest wymagane')
    .min(2, 'Nazwisko musi mieć co najmniej 2 znaki')
    .max(120, 'Nazwisko może mieć maksymalnie 120 znaków'),
  stanowisko: z.enum(['Kierownik', 'Z-ca kierownika', 'SSK', 'Kasjer'] as const),
  status: z.enum(['Aktywny', 'Na urlopie', 'Chorobowe'] as const),
  etat: z.union([z.literal(1), z.literal(0.75), z.literal(0.5), z.literal(0.25)]),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

/**
 * Vacation (Absence with typ=urlop) form validation schema
 */
export const vacationFormSchema = z.object({
  pracownik_id: z.number().int().positive('Wybierz pracownika'),
  data_od: z.string().min(1, 'Data rozpoczęcia jest wymagana'),
  data_do: z.string().min(1, 'Data zakończenia jest wymagana'),
  typ_nieobecnosci: z.literal('urlop'),
}).refine(
  (data) => {
    const dateFrom = new Date(data.data_od);
    const dateTo = new Date(data.data_do);
    return dateTo >= dateFrom;
  },
  {
    message: 'Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia',
    path: ['data_do'],
  }
);

export type VacationFormData = z.infer<typeof vacationFormSchema>;

/**
 * Sick leave (Absence with typ=zwolnienie) form validation schema
 */
export const sickLeaveFormSchema = z.object({
  pracownik_id: z.number().int().positive('Wybierz pracownika'),
  data_od: z.string().min(1, 'Data rozpoczęcia jest wymagana'),
  data_do: z.string().min(1, 'Data zakończenia jest wymagana'),
  typ_nieobecnosci: z.literal('zwolnienie'),
  notatki: z.string().optional(),
}).refine(
  (data) => {
    const dateFrom = new Date(data.data_od);
    const dateTo = new Date(data.data_do);
    return dateTo >= dateFrom;
  },
  {
    message: 'Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia',
    path: ['data_do'],
  }
);

export type SickLeaveFormData = z.infer<typeof sickLeaveFormSchema>;

/**
 * Shift parameter form validation schema
 */
export const shiftParameterFormSchema = z
  .object({
    dzien_tygodnia: z.number().int().min(0).max(6, 'Wybierz dzień tygodnia (0-6)'),
    typ_zmiany: z.enum(['Rano', 'Środek', 'Popoludniu'] as const),
    godzina_od: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format: HH:MM'),
    godzina_do: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format: HH:MM'),
    liczba_obsad: z.number().int().min(0, 'Liczba obsad musi być >= 0'),
    czy_prowadzacy: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const [fromHour, fromMinute] = data.godzina_od.split(':').map(Number);
      const [toHour, toMinute] = data.godzina_do.split(':').map(Number);
      return fromHour * 60 + fromMinute < toHour * 60 + toMinute;
    },
    {
      message: 'Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia',
      path: ['godzina_do'],
    }
  );

export type ShiftParameterFormData = z.infer<typeof shiftParameterFormSchema>;

/**
 * Holiday form validation schema
 */
export const holidayFormSchema = z.object({
  data: z
    .string()
    .min(1, 'Data jest wymagana')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Wprowadź datę w formacie RRRR-MM-DD'),
  nazwa: z
    .string()
    .min(1, 'Nazwa jest wymagana')
    .max(120, 'Nazwa może mieć maksymalnie 120 znaków'),
  opis: z.string().max(500, 'Opis może mieć maksymalnie 500 znaków').optional(),
  store_closed: z.boolean().default(false),
});

export type HolidayFormData = z.infer<typeof holidayFormSchema>;

/**
 * Hour limit form validation schema
 */
export const hourLimitFormSchema = z.object({
  etat: z.union([z.literal(1), z.literal(0.75), z.literal(0.5), z.literal(0.25)]),
  max_dziennie: z.number().int().min(0, 'Musi być >= 0').optional(),
  max_tygodniowo: z.number().int().min(0, 'Musi być >= 0').optional(),
  max_miesięcznie: z.number().int().min(0, 'Musi być >= 0').optional(),
  max_kwartalnie: z.number().int().min(0, 'Musi być >= 0').optional(),
});

export type HourLimitFormData = z.infer<typeof hourLimitFormSchema>;

/**
 * Rule form validation schema
 */
export const ruleFormSchema = z.object({
  nazwa: z
    .string()
    .min(1, 'Nazwa jest wymagana')
    .max(255, 'Nazwa może mieć maksymalnie 255 znaków'),
  opis: z.string().max(1000, 'Opis może mieć maksymalnie 1000 znaków').optional(),
  typ: z.string().max(80, 'Typ może mieć maksymalnie 80 znaków').optional(),
});

export type RuleFormData = z.infer<typeof ruleFormSchema>;
