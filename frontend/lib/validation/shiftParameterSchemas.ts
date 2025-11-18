/**
 * Shift Parameter Validation Schemas
 *
 * Zod schemas for validating shift parameter form data with React Hook Form.
 * Includes time validation, range checks, and cross-field validation.
 */

import { z } from 'zod'

/**
 * Time validation regex: HH:MM format (00:00 - 23:59)
 */
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):([0-5]\d)$/

/**
 * Validates time format and range
 */
// Allow empty time ("") to represent "brak tej zmiany" for danym dniu.
// If provided, it must match HH:MM and be within valid range.
const timeMaybeEmptySchema = z
  .string()
  .optional()
  .transform((v) => (v === undefined ? '' : v))
  .refine(
    (time) => time === '' || TIME_REGEX.test(time),
    'Godzina musi być w formacie HH:MM (np. 09:30)'
  )
  .refine(
    (time) => {
      if (time === '') return true
      const [hours, minutes] = time.split(':').map(Number)
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
    },
    'Godzina musi być między 00:00 a 23:59'
  )

/**
 * Single shift parameter form validation schema
 * Used by React Hook Form with Zod resolver
 */
export const shiftParameterInputSchema = z
  .object({
    dzien_tygodnia: z.number().int().min(0).max(6),
    typ_zmiany: z.enum(['Rano', 'Środek', 'Popoludniu']),
    godzina_od: timeMaybeEmptySchema,
    godzina_do: timeMaybeEmptySchema,
    liczba_obsad: z
      .number()
      .int()
      .nonnegative('Liczba obsad musi być dodatnia'),
    czy_prowadzacy: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const fromEmpty = !data.godzina_od || data.godzina_od === ''
    const toEmpty = !data.godzina_do || data.godzina_do === ''

    // Case 1: both empty -> allowed, but enforce liczba_obsad = 0
    if (fromEmpty && toEmpty) {
      if (data.liczba_obsad !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Gdy brak godzin, liczba pracowników musi wynosić 0',
          path: ['liczba_obsad'],
        })
      }
      return
    }

    // Case 2: one empty, one filled -> error
    if (fromEmpty !== toEmpty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Uzupełnij oba pola czasu lub zostaw oba puste',
        path: fromEmpty ? ['godzina_od'] : ['godzina_do'],
      })
      return
    }

    // Case 3: both provided -> ensure from < to
    const [fromHour, fromMin] = data.godzina_od!.split(':').map(Number)
    const [toHour, toMin] = data.godzina_do!.split(':').map(Number)
    const fromMinutes = fromHour * 60 + fromMin
    const toMinutes = toHour * 60 + toMin
    if (!(fromMinutes < toMinutes)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Godzina rozpoczęcia musi być wcześniejsza niż godzina końca',
        path: ['godzina_do'],
      })
    }
  })

/**
 * Type for a single shift in the form
 */
export type ShiftParameterInput = z.infer<typeof shiftParameterInputSchema>

/**
 * Day form schema: array of shifts for one day
 */
export const dayFormSchema = z.object({
  defaultShifts: z.array(shiftParameterInputSchema),
  leadShifts: z.array(shiftParameterInputSchema),
})

export type DayFormSchema = z.infer<typeof dayFormSchema>
