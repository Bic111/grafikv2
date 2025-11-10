# Implementation Tasks: Refactor ParametryZmianTab.tsx to React Hook Form + Zod

**Branch**: `004-shift-parameters` | **Date**: 2025-11-10
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Task Organization Strategy

This feature contains **3 User Stories (all P1)**:
1. **US1**: Validate form with React Hook Form + Zod
2. **US2**: Manage dynamic shifts (add/remove)
3. **US3**: Edit existing parameters and persist to backend

All 3 stories are **independent** and can be implemented in parallel, but follow this recommended order:
- **MVP (Phase 3)**: US1 only - basic form with validation
- **Phase 4**: US2 - dynamic field array operations
- **Phase 5**: US3 - edit/update/delete integration

**Parallel Opportunities**:
- Zod schema (T003) can be written in parallel with RHF setup (T004)
- Sub-component (T006) can be built in parallel with main component (T005)
- API integration (T008) can be tested independently via mocked backend

---

## Phase 1: Setup & Foundation ✅ COMPLETE

- [x] T001 Create `frontend/lib/validation/shiftParameterSchemas.ts` with Zod schema for time validation (HH:MM format, range 00:00-23:59)
- [x] T002 Update `frontend/lib/validation/schemas.ts` to export `shiftParameterInputSchema` with all validation rules (cross-field validation for godzina_od < godzina_do)
- [x] T003 Verify React Hook Form and Zod are installed in `package.json` (if missing, add `react-hook-form` and `@hookform/resolvers`)
- [x] T004 Create type definitions in `frontend/types/shift-parameter.ts` for `DayFormData`, `ShiftFormValue`, and form-related types

---

## Phase 2: Component Refactoring - User Story 1 (P1) - Basic Validation

**Goal**: Enable form-based shift parameter configuration with real-time Zod validation

**Independent Test**:
1. Open Parametry zmian tab
2. Expand any day
3. Enter invalid time (e.g., "25:00") → Error message appears immediately
4. Leave godzina_od empty → "To pole jest wymagane" error
5. Enter valid times (e.g., "09:00" to "17:00") → No errors, save button enabled

### Implementation Tasks

- [x] T005 [US1] Refactor `frontend/components/employees/ParametryZmianTab.tsx` main component to use React Hook Form `useForm` hook for each day (one form per day)
- [x] T006 [US1] Create `frontend/components/employees/forms/ShiftParameterForm.tsx` sub-component using Controller for individual shift row (time inputs, staff count) - Logika Controller zintegrowana inline w głównym komponencie
- [x] T007 [P] [US1] Implement Zod schema validation with Polish error messages in component's form initialization
- [x] T008 [US1] Implement form field rendering with error display next to each field (godzina_od, godzina_do, liczba_obsad)
- [x] T009 [US1] Implement blur-triggered validation (`onBlur={() => form.trigger()}`) for real-time error feedback
- [x] T010 [US1] Update API integration in `frontend/services/api/client.ts` to ensure `shiftParameterAPI` methods exist (GET, POST, PUT, DELETE)
- [x] T011 [US1] Implement loading spinner during data fetch (use existing LoadingSpinner component)
- [x] T012 [US1] Implement success message display after form save ("Ustawienia zapisane pomyślnie")

---

## Phase 3: Dynamic Field Management - User Story 2 (P1) - Add/Remove Shifts

**Goal**: Enable dynamic addition and removal of shifts per day

**Independent Test**:
1. Expand any day in "Domyślne ustawienia zmian" section
2. Click "+ dodaj kolejną zmianę" → New shift form appears
3. Fill in new shift data → Shift is added to form state
4. Click remove button on extra shift → Shift is removed from UI immediately
5. Save day → New shift sent to backend as POST request

### Implementation Tasks

- [x] T013 [P] [US2] Implement `useFieldArray` for `defaultShifts` in main component (manage array of default shifts)
- [x] T014 [P] [US2] Implement `useFieldArray` for `leadShifts` in main component (manage array of lead shifts)
- [x] T015 [US2] Add "+ dodaj kolejną zmianę" button for both categories (default, lead) in DaySection
- [x] T016 [US2] Implement shift removal logic with confirmation dialog for shifts with IDs (already in database)
- [x] T017 [US2] Implement immediate UI removal for unsaved shifts (no ID) without confirmation
- [x] T018 [US2] Validate minimum 3 shifts per category (Rano, Środek, Popoludniu) before save
- [x] T019 [US2] Ensure "Zapisz" button is disabled during submission (prevent double-submit)

---

## Phase 4: Backend Integration - User Story 3 (P1) - CRUD Operations

**Goal**: Implement full CRUD integration with backend API for edit/update/delete

**Independent Test**:
1. Load data from backend via GET `/shift-parameters?day=X`
2. Edit existing shift (change time or staff count) → PUT request sent with updated data
3. Delete shift with ID → DELETE request sent, shift removed from backend
4. Refresh form → Data reflects persisted changes from backend
5. Error handling: Show user-friendly message if API fails

### Implementation Tasks

- [x] T020 [US3] Implement data loading on component mount: `GET /shift-parameters?day=X` for each day - shiftParameterAPI.getAll() in loadShiftParameters()
- [x] T021 [US3] Map loaded API data to form state structure (separate into defaultShifts and leadShifts arrays) - Grouped by dzien_tygodnia and czy_prowadzacy
- [x] T022 [US3] Implement form.reset() with loaded data using React Hook Form's reset API - form.reset() called for each day after mapping
- [x] T023 [US3] Implement form submission logic separating shifts into:
  - New shifts (no `id`): POST `/shift-parameters`
  - Existing shifts (with `id`): PUT `/shift-parameters/{id}`
  - Removed shifts (deleted from form): DELETE `/shift-parameters/{id}` (via separate confirmDeleteShift handler)
- [x] T024 [US3] Implement batch submission using Promise.all() for all requests - Combined CREATE/UPDATE requests executed in parallel
- [x] T025 [US3] Implement error handling for API failures:
  - Show error message in UI via setDayStates error state
  - Keep form data intact (form not cleared on error)
  - Error details passed through getErrorMessage() utility
- [x] T026 [US3] Implement form refresh after successful save (reload from backend to ensure consistency) - getByDay() called after Promise.all() completes
- [x] T027 [US3] Handle edge case: Shift deleted by another user → Show error "Zmiana nie istnieje" (404 response) - Handled by getErrorMessage() wrapper

---

## Phase 5: Edge Cases & Polish

- [x] T028 Handle edge case: No shifts for day → Verified ensureBaseShifts() ensures minimum 3 shifts per category
- [x] T029 Handle edge case: godzina_od >= godzina_do → Verified dayFormSchema refine() implements cross-field validation
- [x] T030 Handle edge case: API timeout (>30s) → Verified getErrorMessage() handles all error types with user-friendly messages
- [x] T031 Add JSDoc comments to main component and sub-components - Comprehensive documentation added to ParametryZmianTab.tsx and DayFormSection.tsx
- [ ] T032 Update component story in Storybook (if applicable) with new RHF implementation (optional)
- [x] T033 Verify TypeScript compilation (`npx tsc --noEmit`) - Type safety improved with strict literal types for day and shift types
- [x] T034 Ensure all type imports are correct - ShiftFormValue, DayFormData properly imported and typed

---

## Task Dependencies & Execution Order

```
Phase 1 (Setup) - Sequential
  T001 → T002 → T003 → T004 (all must complete before moving to Phase 2)

Phase 2 (US1 - Validation) - Mostly sequential
  T005 → T006 → (T007, T008 parallel) → T009 → T010 → T011 → T012

Phase 3 (US2 - Dynamic) - Can start after T006
  (T013, T014 parallel) → T015 → T016 → T017 → T018 → T019

Phase 4 (US3 - CRUD) - Can start after T010
  T020 → T021 → T022 → T023 → T024 → T025 → T026 → T027

Phase 5 (Polish) - Sequential, after Phase 4 complete
  T028 → T029 → T030 → T031 → T032 → T033 → T034
```

---

## Parallel Execution Examples

### Option A: Sequential MVP (Recommended for clarity)
```
Day 1: Complete Phase 1 (T001-T004)
Day 2-3: Complete Phase 2 (T005-T012) - US1 ready for MVP
Optional: Day 4-5: Add Phase 3 (T013-T019) - US2
Optional: Day 5-6: Add Phase 4 (T020-T027) - US3
```

### Option B: Aggressive Parallelization
```
Phase 1 (1 dev): T001-T004
Phase 2a (2 dev): T005-T012 (main + sub-component in parallel)
Phase 2b (1 dev): Start Phase 3 → T013-T019 after T006 complete
Phase 2c (1 dev): Start Phase 4 → T020-T027 after T010 complete
Phase 5 (all): T028-T034 sequential
```

---

## Deliverables by Phase

### Phase 1 Complete ✓
- Zod schema with validation rules
- Type definitions
- Dependencies verified

### Phase 2 Complete (MVP)
- Refactored ParametryZmianTab.tsx using React Hook Form
- ShiftParameterForm sub-component
- Real-time Zod validation with Polish error messages
- ✅ Ready to test with browser

### Phase 3 Complete (Full CRUD)
- Dynamic field array management
- Add/remove shift functionality
- Persistence to backend

### Phase 4 Complete (All Features)
- Load data from backend
- Edit existing shifts
- Delete shifts
- Error handling
- Data refresh

### Phase 5 Complete (Polish)
- Edge cases handled
- Documentation updated
- TypeScript validation
- Tests ready (parallel track)

---

## Test Coverage (Parallel Track - Not Required for MVP)

### Unit Tests (Jest)
- Zod schema validation (all field rules, cross-field validation)
- Form state updates with useFieldArray
- Error message generation

### Integration Tests (React Testing Library)
- Form renders correctly for all 7 days
- Validation messages appear on blur/submit
- Field array add/remove works
- API calls made with correct payloads
- Error states handled properly

### E2E Tests (Optional)
- Full user flow: Load → Edit → Save for each day
- CRUD operations verified
- Edge cases (timeout, 404, concurrent edits)

---

## Implementation Notes

### Key Decisions
1. **One form per day**: Simplifies state management, allows independent saving per day
2. **useFieldArray for shifts**: RHF's native solution for dynamic arrays
3. **Zod validation**: Type-safe, reusable across frontend/backend
4. **Polish error messages**: All validation errors in Polish per spec
5. **Optimistic UI**: Form updates immediately on submit, refreshes after API response

### Known Constraints
- Backend API endpoint: `/shift-parameters` (existing, no changes needed)
- React 18+ required for useForm hooks
- Tailwind CSS for styling (existing project standard)
- No testing tasks in this checklist (parallel track)

### Performance Targets
- Form validation: <100ms (Zod is very fast)
- API roundtrip: <500ms target
- Re-renders minimized with RHF

---

## Status

**Phase 1**: ✅ COMPLETE (T001-T004)
**Phase 2**: ✅ COMPLETE (T005-T012) - User Story 1 (Form Validation with RHF + Zod)
  - T005: ✅ RHF refactoring with per-day forms and useRef for form management
  - T006: ✅ ShiftParameterForm logic integrated in DayFormSection
  - T007: ✅ Zod schema validation with Polish error messages
  - T008: ✅ Form field rendering with error display
  - T009: ✅ Blur-triggered validation enabled
  - T010: ✅ API integration verified (all CRUD methods implemented)
  - T011: ✅ Loading spinner during data fetch
  - T012: ✅ Success message display

**Phase 3**: ✅ COMPLETE (T013-T019) - User Story 2 (Dynamic Field Management)
  - T013: ✅ useFieldArray for defaultShifts (proper array management)
  - T014: ✅ useFieldArray for leadShifts (proper array management)
  - T015: ✅ "+ dodaj kolejną zmianę" button for both categories
  - T016: ✅ Shift removal with confirmation dialog (saved shifts)
  - T017: ✅ Immediate UI removal for unsaved shifts (no confirmation)
  - T018: ✅ Minimum 3 shifts per category validation
  - T019: ✅ Save button disabled during submission (prevent double-submit)

**Phase 4**: ✅ COMPLETE (T020-T027) - User Story 3 (Backend Integration)
  - T020: ✅ Data loading on component mount via shiftParameterAPI.getAll()
  - T021: ✅ API data mapping to form state (defaultShifts/leadShifts arrays)
  - T022: ✅ Form.reset() with loaded data from backend
  - T023: ✅ Form submission with POST/PUT separation for new/existing shifts
  - T024: ✅ Batch submission using Promise.all() for parallel execution
  - T025: ✅ Error handling with user-friendly messages, form data preserved
  - T026: ✅ Form refresh after save by calling getByDay() and resetting form
  - T027: ✅ 404 error handling for shifts deleted by other users

**Phase 5**: ✅ MOSTLY COMPLETE (T028-T031, T033-T034) - Edge Cases & Polish
  - T028: ✅ No shifts edge case - ensureBaseShifts() ensures 3 minimum
  - T029: ✅ Cross-field validation - dayFormSchema.refine() validates godzina_od < godzina_do
  - T030: ✅ Timeout handling - getErrorMessage() provides user-friendly error messages
  - T031: ✅ JSDoc comments - Comprehensive documentation in main and sub-components
  - T032: ⏳ Storybook update (optional - not required for MVP)
  - T033: ✅ TypeScript verification - Type safety improved with strict literal types
  - T034: ✅ Type imports verified - All types properly imported and matched

**Status**: FEATURE 004-SHIFT-PARAMETERS COMPLETE ✅
All 3 User Stories (US1, US2, US3) fully implemented across 4 phases (27+ implementation tasks)

**Deliverables Ready:**
- React Hook Form + Zod validation (US1)
- Dynamic field array management with add/remove (US2)
- Backend CRUD integration with error handling (US3)
- Comprehensive type safety and documentation

**Next**: Optional Phase 5 T032 (Storybook) or move to new features

**Estimated Timeline**: All phases 1-5 complete and ready for testing/deployment

