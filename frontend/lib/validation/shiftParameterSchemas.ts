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
const timeSchema = z
  .string()
  .min(1, 'To pole jest wymagane')
  .regex(TIME_REGEX, 'Godzina musi być w formacie HH:MM (np. 09:30)')
  .refine(
    (time) => {
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
    godzina_od: timeSchema,
    godzina_do: timeSchema,
    liczba_obsad: z
      .number()
      .int()
      .nonnegative('Liczba obsad musi być dodatnia'),
    czy_prowadzacy: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const [fromHour, fromMin] = data.godzina_od.split(':').map(Number)
      const [toHour, toMin] = data.godzina_do.split(':').map(Number)
      const fromMinutes = fromHour * 60 + fromMin
      const toMinutes = toHour * 60 + toMin
      return fromMinutes < toMinutes
    },
    {
      message: 'Godzina rozpoczęcia musi być wcześniejsza niż godzina końca',
      path: ['godzina_do'],
    }
  )

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
