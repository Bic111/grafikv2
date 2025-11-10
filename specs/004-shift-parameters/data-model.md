# Data Model: Shift Parameters Form State

**Date**: 2025-11-10
**Feature**: 004-shift-parameters
**Status**: Phase 1 Design Output

---

## Entity: ShiftParameter

**Backend representation** (from existing models.py):

```
ParametryZmiany {
  id: int (primary key)
  dzien_tygodnia: int (0-6, Monday=0, Sunday=6)
  typ_zmiany: string ("Rano" | "Środek" | "Popoludniu")
  godzina_od: string (HH:MM format, 00:00-23:59)
  godzina_do: string (HH:MM format, 00:00-23:59)
  liczba_obsad: int (>=0)
  czy_prowadzacy: boolean (false=default shifts, true=lead shifts)
  utworzono: datetime (optional)
  zaktualizowano: datetime (optional)
}
```

---

## Form State Structure (React Hook Form)

### DayFormState (per day)

Managed by separate `useForm` instance for each day (0-6).

```typescript
type DayFormState = {
  defaultShifts: ShiftFormValue[]   // List of shifts (default, not lead)
  leadShifts: ShiftFormValue[]      // List of shifts (lead)
  // RHF manages internal state for defaultShifts and leadShifts fields
}
```

### ShiftFormValue (single shift in form)

```typescript
type ShiftFormValue = {
  id?: string                    // From backend (optional for new shifts)
  localId: string               // Always present (random ID for unsaved shifts)
  dzien_tygodnia: 0 | 1 | 2 | 3 | 4 | 5 | 6
  typ_zmiany: 'Rano' | 'Środek' | 'Popoludniu'
  godzina_od: string            // HH:MM format
  godzina_do: string            // HH:MM format
  liczba_obsad: number          // >=0
  czy_prowadzacy: boolean       // Determined by category (default/lead)
}
```

### Full Day Form Structure (RHF)

```typescript
type ParameterFormData = {
  defaultShifts: ShiftFormValue[]
  leadShifts: ShiftFormValue[]
}
```

---

## Zod Validation Schema

### TimeSchema

```
godzina_od: string
  - Required
  - Format: HH:MM (regex: /^\d{2}:\d{2}$/)
  - Range: 00:00 to 23:59
  - Error: "Godzina musi być w formacie HH:MM (np. 09:30)"

godzina_do: string
  - Required
  - Format: HH:MM (regex: /^\d{2}:\d{2}$/)
  - Range: 00:00 to 23:59
  - Error: "Godzina musi być w formacie HH:MM (np. 09:30)"
```

### ShiftFormSchema

```
ShiftFormValue {
  id?: string (optional, for saved shifts)
  localId: string (required, always present)
  dzien_tygodnia: number (0-6)
  typ_zmiany: enum ("Rano" | "Środek" | "Popoludniu")
  godzina_od: string (validated as HH:MM, 00:00-23:59)
  godzina_do: string (validated as HH:MM, 00:00-23:59)
  liczba_obsad: number (>=0, integer)
  czy_prowadzacy: boolean
}
```

**Cross-field validation**:
- `godzina_od < godzina_do` (error: "Godzina rozpoczęcia musi być wcześniejsza niż godzina końca")

### ParameterFormSchema

```
ParameterFormData {
  defaultShifts: ShiftFormValue[] (min 3 items - Rano, Środek, Popoludniu)
  leadShifts: ShiftFormValue[] (min 3 items - Rano, Środek, Popoludniu)
}
```

---

## State Transitions

### Form Lifecycle

1. **Load**: GET `/shift-parameters?day=X` → Map API response to form state
2. **Edit**: User modifies field → RHF tracks change
3. **Validate**: On blur or submit → Zod validates single shift or entire day
4. **Submit**: User clicks "Zapisz" → Separate CREATE/UPDATE/DELETE requests for each shift
5. **Refresh**: After save → GET `/shift-parameters?day=X` → Update form state

### Shift States

| State | ID | Has RHF Ref | Backend Sync | Action |
|-------|---|---|---|---|
| New (unsaved) | None | `localId` | No | Can save (POST) or remove |
| Editing (unsaved) | None | `localId` | No | Can save (POST) or remove |
| Loaded | `id` | `localId` + `id` | Yes | Can save (PUT) or remove (DELETE) |
| Saving | `id` | `localId` + `id` | Pending | Disabled UI |
| Saved | `id` | `localId` + `id` | Yes | Can edit or remove |
| Deleted | N/A | Removed | No | Removed from form |

---

## Validation Rules Summary

| Field | Type | Constraints | Error Messages (Polish) |
|-------|------|-------------|--------|
| `godzina_od` | string | HH:MM, 00:00-23:59, < `godzina_do` | "To pole jest wymagane" / "Godzina musi być w formacie HH:MM (np. 09:30)" / "Godzina musi być między 00:00 a 23:59" / "Godzina rozpoczęcia musi być wcześniejsza niż godzina końca" |
| `godzina_do` | string | HH:MM, 00:00-23:59, > `godzina_od` | (same as above) |
| `liczba_obsad` | number | >=0, integer | "To pole jest wymagane" / "Liczba obsad musi być dodatnia" |
| `typ_zmiany` | enum | One of 3 shift types | (always valid - controlled input) |
| `dzien_tygodnia` | number | 0-6 | (always valid - determined by parent) |
| `czy_prowadzacy` | boolean | true/false | (always valid - determined by category) |

---

## API Contract Mapping

### Request Payload (Create)

```json
POST /shift-parameters
{
  "dzien_tygodnia": 0,
  "typ_zmiany": "Rano",
  "godzina_od": "09:00",
  "godzina_do": "17:00",
  "liczba_obsad": 3,
  "czy_prowadzacy": false
}
```

### Request Payload (Update)

```json
PUT /shift-parameters/1
{
  "dzien_tygodnia": 0,
  "typ_zmiany": "Rano",
  "godzina_od": "09:00",
  "godzina_do": "17:00",
  "liczba_obsad": 3,
  "czy_prowadzacy": false
}
```

### Response Payload

```json
{
  "id": 1,
  "dzien_tygodnia": 0,
  "typ_zmiany": "Rano",
  "godzina_od": "09:00",
  "godzina_do": "17:00",
  "liczba_obsad": 3,
  "czy_prowadzacy": false
}
```

---

**Status**: Phase 1 Complete
**Next**: Create OpenAPI contract and quickstart

