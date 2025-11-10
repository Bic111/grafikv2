# Quick Start: React Hook Form + Zod Refactor

**Date**: 2025-11-10
**Feature**: 004-shift-parameters
**Status**: Phase 1 Design Output

---

## Overview

This guide provides a quick reference for implementing the refactored `ParametryZmianTab.tsx` component using React Hook Form (RHF) + Zod validation.

---

## Key Files to Modify

### 1. Frontend Validation Schema

**File**: `frontend/lib/validation/schemas.ts`

Add/update Zod schema for shift parameters:

```typescript
import { z } from 'zod'

const timePattern = /^\d{2}:\d{2}$/
const timeRegex = z.string().regex(timePattern, 'Godzina musi być w formacie HH:MM (np. 09:30)')

const isValidTime = (timeStr: string): boolean => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

export const shiftParameterInputSchema = z.object({
  dzien_tygodnia: z.number().min(0).max(6),
  typ_zmiany: z.enum(['Rano', 'Środek', 'Popoludniu']),
  godzina_od: timeRegex.refine(isValidTime, 'Godzina musi być między 00:00 a 23:59'),
  godzina_do: timeRegex.refine(isValidTime, 'Godzina musi być między 00:00 a 23:59'),
  liczba_obsad: z.number().int().nonnegative('Liczba obsad musi być dodatnia'),
  czy_prowadzacy: z.boolean(),
}).refine(
  (data) => data.godzina_od < data.godzina_do,
  {
    message: 'Godzina rozpoczęcia musi być wcześniejsza niż godzina końca',
    path: ['godzina_do'],
  }
)

export type ShiftParameterInput = z.infer<typeof shiftParameterInputSchema>
```

### 2. Main Component

**File**: `frontend/components/employees/ParametryZmianTab.tsx`

Refactor to use React Hook Form:

```typescript
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shiftParameterInputSchema } from '@/lib/validation/schemas'

interface DayFormData {
  defaultShifts: ShiftParameterInput[]
  leadShifts: ShiftParameterInput[]
}

// Per-day form hook
const useDayForm = (dayIndex: number, initialData?: ShiftParameter[]) => {
  const form = useForm<DayFormData>({
    resolver: zodResolver(z.object({
      defaultShifts: z.array(shiftParameterInputSchema),
      leadShifts: z.array(shiftParameterInputSchema),
    })),
    defaultValues: {
      defaultShifts: [],
      leadShifts: [],
    },
  })

  // Load initial data if provided
  if (initialData) {
    const defaultShifts = initialData.filter(s => !s.czy_prowadzacy)
    const leadShifts = initialData.filter(s => s.czy_prowadzacy)
    form.reset({
      defaultShifts: defaultShifts.map(mapToFormValue),
      leadShifts: leadShifts.map(mapToFormValue),
    })
  }

  return form
}

// Component structure
export function ParametryZmianTab() {
  const [days, setDays] = useState<Record<number, ReturnType<typeof useDayForm>>>(() => {
    const initial: Record<number, ReturnType<typeof useDayForm>> = {}
    DAY_NAMES.forEach((_, index) => {
      initial[index] = useDayForm(index)
    })
    return initial
  })

  // Load data on mount
  useEffect(() => {
    loadShiftParameters()
  }, [])

  const handleSaveDay = async (dayIndex: number) => {
    const form = days[dayIndex]
    const isValid = await form.trigger()

    if (!isValid) return

    const data = form.getValues()
    // Separate into CREATE/UPDATE/DELETE operations
    // POST new shifts (no id)
    // PUT existing shifts (with id)
    // DELETE removed shifts
  }

  return (
    <div>
      {DAY_NAMES.map((dayName, dayIndex) => (
        <DaySection key={dayIndex} dayIndex={dayIndex} form={days[dayIndex]} />
      ))}
    </div>
  )
}
```

### 3. Sub-component: Single Shift Form

**File**: `frontend/components/employees/forms/ShiftParameterForm.tsx`

```typescript
import { Controller, UseFormReturn, UseFieldArrayReturn } from 'react-hook-form'
import { shiftParameterInputSchema } from '@/lib/validation/schemas'

interface ShiftParameterFormProps {
  form: UseFormReturn<DayFormData>
  fieldArray: UseFieldArrayReturn<DayFormData, 'defaultShifts' | 'leadShifts'>
  category: 'default' | 'lead'
  index: number
  onRemove: () => void
  canRemove: boolean
}

export function ShiftParameterForm({
  form,
  fieldArray,
  category,
  index,
  onRemove,
  canRemove,
}: ShiftParameterFormProps) {
  const fieldName = category === 'default' ? 'defaultShifts' : 'leadShifts'
  const fieldPath = `${fieldName}.${index}`

  const shiftType = form.watch(`${fieldPath}.typ_zmiany`)
  const errors = form.formState.errors[fieldName]?.[index]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Time fields */}
        <Controller
          control={form.control}
          name={`${fieldPath}.godzina_od`}
          render={({ field, fieldState: { error } }) => (
            <div>
              <label>Od</label>
              <input
                {...field}
                type="time"
                className={error ? 'error' : ''}
                onBlur={() => form.trigger(fieldPath)}
              />
              {error && <span className="text-red-600 text-sm">{error.message}</span>}
            </div>
          )}
        />

        <Controller
          control={form.control}
          name={`${fieldPath}.godzina_do`}
          render={({ field, fieldState: { error } }) => (
            <div>
              <label>Do</label>
              <input
                {...field}
                type="time"
                className={error ? 'error' : ''}
                onBlur={() => form.trigger(fieldPath)}
              />
              {error && <span className="text-red-600 text-sm">{error.message}</span>}
            </div>
          )}
        />

        {/* Staff count */}
        <Controller
          control={form.control}
          name={`${fieldPath}.liczba_obsad`}
          render={({ field, fieldState: { error } }) => (
            <div>
              <label>Liczba obsad</label>
              <input
                {...field}
                type="number"
                min="0"
                className={error ? 'error' : ''}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
                onBlur={() => form.trigger(fieldPath)}
              />
              {error && <span className="text-red-600 text-sm">{error.message}</span>}
            </div>
          )}
        />
      </div>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          Usuń zmianę
        </button>
      )}
    </div>
  )
}
```

---

## Form Submission Flow

```
User clicks "Zapisz ustawienia dnia"
    ↓
form.handleSubmit() → Zod validation
    ↓
    If invalid → Show field-level errors, stop
    ↓
    If valid → Extract form data
    ↓
Separate into:
  - New (no id) → POST /shift-parameters
  - Existing (with id) → PUT /shift-parameters/{id}
  - Removed → DELETE /shift-parameters/{id}
    ↓
Promise.all(all requests)
    ↓
    If success → GET /shift-parameters?day=X → Reload form
    If error → Show error message, keep form data
    ↓
Display success message
```

---

## API Integration

### API Client

**File**: `frontend/services/api/client.ts`

Existing `shiftParameterAPI` used:

```typescript
// Existing methods
const shiftParameterAPI = {
  getAll: () => get('/shift-parameters'),
  getByDay: (day: number) => get(`/shift-parameters?day=${day}`),
  create: (data) => post('/shift-parameters', data),
  update: (id: string, data) => put(`/shift-parameters/${id}`, data),
  delete: (id: string) => del(`/shift-parameters/${id}`),
}
```

---

## Validation Triggers

1. **On Field Blur**: `onBlur={() => form.trigger(fieldPath)}`
   - Validates single field
   - Shows error immediately

2. **On Submit**: `form.handleSubmit()` or `form.trigger()`
   - Validates entire day (all shifts)
   - Prevents save if any field invalid

3. **Cross-field**: Zod `.refine()` for `godzina_od < godzina_do`
   - Automatically validated when submitting

---

## Error Handling

### Validation Errors
- Displayed inline next to field
- Polish messages from Zod schema
- User can fix and resubmit

### API Errors
- HTTP 400: "Invalid data" → Show generic message
- HTTP 404: "Not found" → Show "Zmiana nie istnieje"
- HTTP 5xx: "Server error" → Show "Błąd serwera, spróbuj ponownie"

### Network Errors
- Timeout (>30s): "Nie możemy nawiązać połączenia"
- Connection lost: "Brak połączenia z internetem"

---

## Testing Strategy (Parallel Track)

Focus on:
- Zod schema validation (unit tests)
- RHF form state management (integration tests)
- API integration (mocked backend)
- Edge cases from spec (form submission, dynamic fields)

---

## Performance Notes

- RHF reduces re-renders vs useState approach
- Zod validation is lightweight (<1ms per field)
- API calls batched via Promise.all()
- Debounce not needed (blur-triggered, not keystroke)

---

**Status**: Ready for Implementation
**Next**: Run `/speckit.tasks` to generate detailed task list

