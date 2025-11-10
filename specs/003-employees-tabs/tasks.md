# Implementation Tasks: Przebudowa UI Zakładki Pracownicy z Systemem Tabs

**Feature**: Redesign of Employees section with tabbed interface (6 tabs)
**Branch**: `003-employees-tabs`
**Total Tasks**: 92
**Estimated Effort**: 3-4 sprints (full team)

---

## Task Overview

| Phase | Focus | Tasks | Duration |
|-------|-------|-------|----------|
| **Phase 1** | Project Setup & Infrastructure | T001-T012 | 2-3 days |
| **Phase 2** | Foundational Components & API | T013-T028 | 3-4 days |
| **Phase 3** | User Story 1 (Employees) - P1 | T029-T043 | 4-5 days |
| **Phase 4** | User Story 2 (Vacations) - P1 | T044-T054 | 3-4 days |
| **Phase 5** | User Story 3 (Sick Leaves) - P1 | T055-T064 | 3 days |
| **Phase 6** | User Story 7 (Tab Navigation) - P1 | T065-T071 | 2-3 days |
| **Phase 7** | User Story 4 (Shift Parameters) - P2 | T072-T079 | 3-4 days |
| **Phase 8** | User Story 5 (Holidays) - P2 | T080-T085 | 2-3 days |
| **Phase 9** | User Story 6 (Rules & Limits) - P2 | T086-T092 | 3 days |

---

## Execution Strategy

### MVP Scope (Phases 1-6)
Implement User Stories 1, 2, 3, 7 to deliver core employee management with vacations and sick leaves. This provides immediate business value and unblocks the schedule generator.

### Phase 2 (Phases 7-9)
Implement User Stories 4, 5, 6 for advanced configuration and rule management. Can be done after MVP with no impact on core functionality.

### Parallel Opportunities
- **Phase 3 (US1)**: All tab components can be developed in parallel after Phase 2 completes
- **Phase 4-6 (US2-3, 7)**: Can run in parallel with Phase 3 since they share foundational components
- **Phase 7-9 (US4-6)**: Can run in parallel after Phase 2

---

## PHASE 1: Project Setup & Infrastructure

**Goal**: Initialize project structure, configure dependencies, set up development environment

**Independent Test**:
- All TypeScript types compile without errors
- API client services can be imported and instantiated
- Radix UI Tabs renders without console errors
- Jest/Vitest tests can run

**Completion Criteria**:
- [ ] Next.js project upgraded to latest version
- [ ] All dependencies installed and versions locked
- [ ] TypeScript configuration strict mode enabled
- [ ] Testing framework configured (Jest + Playwright)
- [ ] ESLint and Prettier configured for TypeScript
- [ ] Project structure created per plan.md

### Tasks

- [ ] T001 Upgrade Next.js to version 14+ in `package.json`
- [ ] T002 Install Radix UI Tabs library: `npm install @radix-ui/react-tabs`
- [ ] T003 Install form validation: `npm install react-hook-form zod @hookform/resolvers`
- [ ] T004 Install testing dependencies: `npm install -D jest @testing-library/react @testing-library/jest-dom`
- [ ] T005 Install Playwright for e2e testing: `npm install -D @playwright/test`
- [ ] T006 Create TypeScript config for strict mode in `tsconfig.json`
- [ ] T007 Create project structure directories (frontend/components/employees, frontend/services/api, etc.)
- [ ] T008 [P] Create base `.env.example` with API endpoints configuration
- [ ] T009 [P] Create ESLint configuration file `.eslintrc.json` for TypeScript
- [ ] T010 [P] Create Jest configuration in `jest.config.js`
- [ ] T011 [P] Create Playwright config in `playwright.config.ts`
- [ ] T012 [P] Initialize Python backend: add models.py skeleton with SQLAlchemy imports

---

## PHASE 2: Foundational Components & API Integration

**Goal**: Create reusable components and API client services that all user stories will depend on

**Independent Test**:
- All API clients can fetch data from endpoints
- Common components render without errors
- Form validation works with Zod schemas

**Completion Criteria**:
- [ ] All API clients created and tested
- [ ] Common UI components created (Loading, Error, Confirm dialog, Table)
- [ ] Shared form validation schemas defined
- [ ] API error handling centralized
- [ ] Type definitions for all 6 entities

### Tasks

- [ ] T013 Create TypeScript types for Employee entity in `frontend/types/employee.ts`
- [ ] T014 Create TypeScript types for Absence entity in `frontend/types/absence.ts`
- [ ] T015 Create TypeScript types for ShiftParameter entity in `frontend/types/shift-parameter.ts`
- [ ] T016 Create TypeScript types for Holiday entity in `frontend/types/holiday.ts`
- [ ] T017 Create TypeScript types for HourLimit entity in `frontend/types/hour-limit.ts`
- [ ] T018 Create TypeScript types for Rule entity in `frontend/types/rule.ts`
- [ ] T019 [P] Create API client service for employees in `frontend/services/api/employees.ts`
- [ ] T020 [P] Create API client service for absences in `frontend/services/api/absences.ts`
- [ ] T021 [P] Create API client service for shift parameters in `frontend/services/api/shifts.ts`
- [ ] T022 [P] Create API client service for holidays in `frontend/services/api/holidays.ts`
- [ ] T023 [P] Create API client service for rules in `frontend/services/api/rules.ts`
- [ ] T024 [P] Create LoadingSpinner component in `frontend/components/common/LoadingSpinner.tsx`
- [ ] T025 [P] Create ErrorMessage component in `frontend/components/common/ErrorMessage.tsx`
- [ ] T026 [P] Create ConfirmDialog component in `frontend/components/common/ConfirmDialog.tsx`
- [ ] T027 [P] Create reusable Table component in `frontend/components/common/Table.tsx`
- [ ] T028 Create centralized API error handler utility in `frontend/services/api/errorHandler.ts`

---

## PHASE 3: User Story 1 - Employees Management (P1)

**Story Goal**: Manager can view list of all employees and perform CRUD operations (add, edit, delete)

**Independent Test**:
- List loads all employees from API
- Add form validates required fields (Imię, Nazwisko)
- Edit updates existing employee
- Delete removes employee from list with confirmation
- Loading states show spinner/skeleton during API calls

**Acceptance Criteria**:
- [ ] Employee list table displays with all columns (Imię, Nazwisko, Stanowisko, Status, Etat)
- [ ] Add Employee form renders and validates
- [ ] Edit Employee form pre-fills data
- [ ] Delete confirmation dialog appears before deletion
- [ ] List refreshes after CRUD operations
- [ ] Loading spinner shows during API calls
- [ ] No console errors

### Tasks

- [ ] T029 Create Zod schema for employee form validation in `frontend/types/schemas.ts`
- [ ] T030 Create EmployeeForm component in `frontend/components/employees/forms/EmployeeForm.tsx`
- [ ] T031 Create EmployeesTab component shell in `frontend/components/employees/EmployeesTab.tsx`
- [ ] T032 [P] Implement employee list fetching logic in EmployeesTab component
- [ ] T033 [P] Implement employee table rendering with Imię, Nazwisko, Stanowisko, Status, Etat columns
- [ ] T034 [P] Implement add employee button and form opening logic
- [ ] T035 [P] Implement edit employee functionality (form pre-fill + update)
- [ ] T036 [P] Implement delete employee with confirmation dialog
- [ ] T037 [P] Add loading spinner during API fetch in EmployeesTab
- [ ] T038 [P] Add error handling and error message display
- [ ] T039 [P] Implement form field validation with error messages for Imię and Nazwisko (required)
- [ ] T040 [P] Add Stanowisko dropdown with 4 options (Kierownik, Z-ca kierownika, SSK, Kasjer)
- [ ] T041 [P] Add Status dropdown with 3 options (Aktywny, Na urlopie, Chorobowe)
- [ ] T042 [P] Add Etat dropdown with 4 options (1.0, 0.75, 0.5, 0.25)
- [ ] T043 Write unit tests for EmployeesTab in `frontend/tests/employees/employees.test.ts`

---

## PHASE 4: User Story 2 - Vacation Management (P1)

**Story Goal**: Manager can plan and manage employee vacations with add, edit, delete, and filtering

**Independent Test**:
- Vacation list loads from API with typ=urlop filter
- Add form allows selecting employee and date range
- Automatic calculation of vacation days
- Edit updates vacation dates
- Delete removes vacation with confirmation
- Filter by year/month works

**Acceptance Criteria**:
- [ ] Vacation list table displays (Pracownik, Od, Do, Liczba dni, Akcje)
- [ ] Add Vacation form with employee dropdown and date picker
- [ ] Automatic day count calculation
- [ ] Edit and delete functionality with confirmation
- [ ] Filter by year/month functional
- [ ] API calls use ?typ=urlop parameter
- [ ] No console errors

### Tasks

- [ ] T044 Create Zod schema for vacation form validation in `frontend/types/schemas.ts`
- [ ] T045 Create VacationForm component in `frontend/components/employees/forms/VacationForm.tsx`
- [ ] T046 Create UrlopyTab component shell in `frontend/components/employees/UrlopyTab.tsx`
- [ ] T047 [P] Implement vacation list fetching with ?typ=urlop query parameter
- [ ] T048 [P] Implement vacation table rendering (Pracownik, Od, Do, Liczba dni)
- [ ] T049 [P] Create vacation day calculation utility function `calculateVacationDays()` in `frontend/utils/dates.ts`
- [ ] T050 [P] Implement automatic day count display in table
- [ ] T051 [P] Implement add vacation with employee selection and date range picker
- [ ] T052 [P] Implement edit vacation functionality
- [ ] T053 [P] Implement delete vacation with confirmation dialog
- [ ] T054 [P] Implement year/month filter and re-fetch data on filter change

---

## PHASE 5: User Story 3 - Sick Leave Management (P1)

**Story Goal**: Manager can register and manage sick leaves with add, edit, delete operations

**Independent Test**:
- Sick leave list loads from API with typ=zwolnienie filter
- Add form allows entering employee, dates, and notes
- Edit updates sick leave data
- Delete removes sick leave with confirmation
- Table displays all columns correctly

**Acceptance Criteria**:
- [ ] Sick leave list table displays (Pracownik, Od, Do, Typ zwolnienia, Notatki, Akcje)
- [ ] Add Sick Leave form with required fields (Pracownik, Okres, Notatki optional)
- [ ] Edit and delete functionality with confirmation
- [ ] API calls use ?typ=zwolnienie parameter
- [ ] Automatic day count calculation
- [ ] No console errors

### Tasks

- [ ] T055 Create Zod schema for sick leave form validation in `frontend/types/schemas.ts`
- [ ] T056 Create SickLeaveForm component in `frontend/components/employees/forms/SickLeaveForm.tsx`
- [ ] T057 Create ZwolnieniaTab component shell in `frontend/components/employees/ZwolnieniaTab.tsx`
- [ ] T058 [P] Implement sick leave list fetching with ?typ=zwolnienie query parameter
- [ ] T059 [P] Implement sick leave table rendering (Pracownik, Od, Do, Typ, Notatki)
- [ ] T060 [P] Implement add sick leave with form fields validation
- [ ] T061 [P] Implement edit sick leave functionality
- [ ] T062 [P] Implement delete sick leave with confirmation dialog
- [ ] T063 [P] Add error handling and loading states
- [ ] T064 Write unit tests for ZwolnieniaTab in `frontend/tests/employees/sick-leaves.test.ts`

---

## PHASE 6: User Story 7 - Tab Navigation (P1)

**Story Goal**: User can smoothly switch between 6 tabs without page reload; active tab is clearly indicated

**Independent Test**:
- Tab navigation renders all 6 tabs
- Clicking tab changes content without page reload (<200ms)
- Active tab is visually highlighted
- Tab state persists when switching back
- No console errors during navigation

**Acceptance Criteria**:
- [ ] 6 tabs rendered with Radix UI Tabs (Wszyscy, Urlopy, Zwolnienia, Parametry zmian, Święta, Reguły)
- [ ] Tab switching is smooth and responsive (<200ms)
- [ ] Active tab clearly indicated with styling
- [ ] Data in tabs is preserved when switching back
- [ ] Default tab "Wszyscy" is active on page load
- [ ] Optional deep linking with ?tab=urlopy works
- [ ] Responsive layout on mobile/tablet/desktop

### Tasks

- [ ] T065 Update `/employees/page.tsx` to use Radix UI Tabs wrapper
- [ ] T066 [P] Add 6 Tabs.Trigger elements with labels (Wszyscy, Urlopy, etc.) in `frontend/app/employees/page.tsx`
- [ ] T067 [P] Set defaultValue="all" for Radix UI Tabs.Root
- [ ] T068 [P] Wrap each tab component in Tabs.Content with corresponding value
- [ ] T069 [P] Add active tab styling (bg-background text-foreground shadow-sm for active)
- [ ] T070 [P] Test tab switching performance (<200ms)
- [ ] T071 Write e2e test for tab navigation in `frontend/tests/employees/e2e/tab-navigation.spec.ts`

---

## PHASE 7: User Story 4 - Shift Parameters Configuration (P2)

**Story Goal**: Manager configures default shift settings (Rano, Środek, Popoludniu) for each day of week, with lead staff options

**Independent Test**:
- Tab loads with 7 day sections visible
- Each day shows 2 subsections (default settings + lead staff)
- Can add/edit shift parameters
- Changes are saved per day
- Data persists on navigation back

**Acceptance Criteria**:
- [ ] 7 sections rendered (one per day of week)
- [ ] Each section has 2 subsections (Default + Lead Staff)
- [ ] Each subsection has 3 parts (Rano, Środek, Popoludniu)
- [ ] Each part has time fields (od, do) and staff count
- [ ] Add shift button works
- [ ] Save functionality works per day
- [ ] No console errors

### Tasks

- [ ] T072 Create Zod schema for shift parameter form in `frontend/types/schemas.ts`
- [ ] T073 Create ShiftParameterForm component in `frontend/components/employees/forms/ShiftParameterForm.tsx`
- [ ] T074 Create ParametryZmianTab component shell in `frontend/components/employees/ParametryZmianTab.tsx`
- [ ] T075 [P] Implement 7-day section layout with collapsible day containers
- [ ] T076 [P] Implement "Domyślne ustawienia zmian" subsection with 3 shift time inputs
- [ ] T077 [P] Implement "Prowadzący zmianę" subsection with 3 shift time inputs
- [ ] T078 [P] Implement "+ dodaj kolejną" button to add additional shifts
- [ ] T079 [P] Implement save functionality for each day separately

---

## PHASE 8: User Story 5 - Holiday Management (P2)

**Story Goal**: Manager can add, edit, delete holidays with date and description

**Independent Test**:
- Holiday list loads and displays
- Add holiday form renders and validates
- Edit updates holiday data
- Delete removes holiday with confirmation
- Table can be sorted

**Acceptance Criteria**:
- [ ] Holiday table displays (Data, Nazwa, Opis, Akcje)
- [ ] Add holiday form with date picker and text fields
- [ ] Edit functionality works
- [ ] Delete with confirmation works
- [ ] Table sorting by column works
- [ ] No console errors

### Tasks

- [ ] T080 Create Zod schema for holiday form in `frontend/types/schemas.ts`
- [ ] T081 Create HolidayForm component in `frontend/components/employees/forms/HolidayForm.tsx`
- [ ] T082 Create SwietaTab component shell in `frontend/components/employees/SwietaTab.tsx`
- [ ] T083 [P] Implement holiday list fetching from API
- [ ] T084 [P] Implement holiday table with date/name/description columns
- [ ] T085 [P] Implement add/edit/delete holiday functionality

---

## PHASE 9: User Story 6 - Rules & Hour Limits (P2)

**Story Goal**: Manager defines hour limits per employment type and manages work rules

**Independent Test**:
- Tab loads with 2 sections (Limits + Rules)
- Add limit form validates etat values
- Add rule form works
- Edit and delete work for both sections
- No console errors

**Acceptance Criteria**:
- [ ] 2 sections displayed (Limity godzin, Krytyczne wytyczne)
- [ ] Limits table displays (Etat, Max dziennie, Max tydzień, Max miesiąc, Max kwartał)
- [ ] Add limit form works
- [ ] Edit/delete limit works
- [ ] Add rule form works
- [ ] Edit/delete rule works
- [ ] No console errors

### Tasks

- [ ] T086 Create Zod schemas for limit and rule forms in `frontend/types/schemas.ts`
- [ ] T087 Create RuleForm component in `frontend/components/employees/forms/RuleForm.tsx`
- [ ] T088 Create RegulyTab component shell in `frontend/components/employees/RegulyTab.tsx`
- [ ] T089 [P] Implement limits table with Etat and max values columns
- [ ] T090 [P] Implement rules section with rules list
- [ ] T091 [P] Implement add/edit/delete for both limits and rules
- [ ] T092 Write integration tests for all tab data persistence in `frontend/tests/employees/tabs.integration.test.ts`

---

## CROSS-CUTTING CONCERNS

### Backend Tasks (Can be done in parallel with frontend)

**Database Schema Updates**:
- [ ] Add `shift_parameters` table to SQLite
- [ ] Add `holidays` table to SQLite
- [ ] Add `hour_limits` table to SQLite
- [ ] Add `rules` table to SQLite
- [ ] Update `absences` table if needed (ensure `typ` column is present)

**Backend Models** (backend/models.py):
- [ ] Add ShiftParameter SQLAlchemy model
- [ ] Add Holiday SQLAlchemy model
- [ ] Add HourLimit SQLAlchemy model
- [ ] Add Rule SQLAlchemy model
- [ ] Add relationships between models

**API Endpoints**:
- [ ] Create shift_parameters.py with GET/POST/PUT/DELETE endpoints
- [ ] Create holidays.py with GET/POST/PUT/DELETE endpoints
- [ ] Create rules.py with GET/POST/PUT/DELETE endpoints
- [ ] Enhance pracownicy.py endpoints with validation
- [ ] Enhance nieobecnosci.py endpoints with typ filtering

**Validation & Services**:
- [ ] Create validation.py service for work law compliance checks
- [ ] Create rules_engine.py for rule enforcement
- [ ] Add Pydantic validators to all models

### Testing Plan

**Unit Tests**:
- API client services (each returns correct types)
- Form validation schemas (Zod validation tests)
- Date calculation utilities

**Component Tests**:
- Tab components render correctly
- Form components validate and submit
- Common components (Loading, Error, Dialog, Table) work correctly

**E2E Tests** (Playwright):
- Full user journey for each user story
- Tab navigation and data persistence
- Form submission and API integration
- Error handling scenarios

**Integration Tests**:
- Tab data persistence across navigation
- API error handling and retry logic
- Cross-story data consistency

---

## Dependency Graph

```
PHASE 1 (Setup)
    ↓
PHASE 2 (Foundational) ← Required by all user stories
    ↓
PHASE 3 (US1-Employees) ← Can run in parallel with Phases 4-6
    ↓           ↓
PHASE 4 (US2-Vacations) ← Both can run in parallel with Phase 3
    ↓           ↓
PHASE 5 (US3-Sick Leaves) ← Can run in parallel with Phases 3-4
    ↓           ↓
PHASE 6 (US7-Tab Navigation) ← Can run in parallel with US1-3, depends on all tabs existing
    ↓
PHASE 7 (US4-Shift Parameters) ← Can start after Phase 2
    ↓
PHASE 8 (US5-Holidays) ← Can start after Phase 2
    ↓
PHASE 9 (US6-Rules) ← Can start after Phase 2
```

---

## Parallel Execution Example

**Sprint 1** (Day 1-5):
- **Developer 1**: Phase 1 (Setup)
- **Developer 2**: Backend database schema + models

**Sprint 2** (Day 6-12):
- **Developer 1**: Phase 2 (API clients + common components)
- **Developer 2**: Phase 2 (API endpoints)
- **Developer 3**: Backend validation services

**Sprint 3** (Day 13-19):
- **Developer 1**: Phase 3 (US1 - Employees)
- **Developer 2**: Phase 4 (US2 - Vacations)
- **Developer 3**: Phase 5 (US3 - Sick Leaves)

**Sprint 4** (Day 20-26):
- **Developer 1**: Phase 6 (US7 - Tab Navigation)
- **Developer 2**: Phase 7 (US4 - Shift Parameters)
- **Developer 3**: Phase 8 (US5 - Holidays)

**Sprint 5** (Day 27-30):
- **All**: Phase 9 (US6 - Rules) + Testing + Integration

---

## Completion Checklist

**Before marking feature complete**:
- [ ] All 92 tasks completed
- [ ] All unit tests passing
- [ ] All e2e tests passing
- [ ] No console errors
- [ ] TypeScript strict mode compilation successful
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] Accessibility (WCAG) compliance verified
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance metrics verified (<200ms tab switching, <2s loading)

---

**Generated**: 2025-11-10
**Last Updated**: 2025-11-10
**Status**: Ready for Sprint Planning
