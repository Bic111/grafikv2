# Implementation Plan: Przebudowa UI Zakładki Pracownicy z Systemem Tabs

**Branch**: `003-employees-tabs` | **Date**: 2025-11-10 | **Spec**: `specs/003-employees-tabs/spec.md`
**Input**: Feature specification from `specs/003-employees-tabs/spec.md`

**Note**: This plan guides implementation of the Employees section UI redesign with 6 tabbed interfaces.

## Summary

Complete redesign of the `/employees` page with a tabbed interface (Radix UI Tabs) to consolidate employee management, vacation planning, sick leave registration, shift parameters, holidays, and work rules into a single cohesive page. The implementation leverages existing API endpoints (`/api/nieobecnosci`, `/api/pracownicy`) and enhances them with proper UI components, form validation, loading states, and error handling.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 14+), Python 3.10+
**Primary Dependencies**:
- Frontend: `@radix-ui/react-tabs`, Tailwind CSS, Next.js App Router
- Backend: Existing FastAPI/Flask endpoints (`/api/nieobecnosci`, `/api/pracownicy`)
**Storage**: SQLite (existing) + potential new tables for ShiftParameter, Holiday, HourLimit, Rule entities
**Testing**: Playwright (e2e), Jest/Vitest (unit), pytest (backend integration)
**Target Platform**: Web browser (desktop/mobile responsive)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Tab switching <200ms, list loading <2s (500+ employees), filtering <1s
**Constraints**: WCAG accessibility compliance, Type-safe TypeScript (no `any`), optimistic UI, zero console errors
**Scale/Scope**: Single-page application with 6 tabs, ~40 components, 39 functional requirements, 7 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Modularity and Reusability**: Components organized as independent, reusable React components (EmployeesTab, UrlopyTab, ZwolnieniaTab, etc.). Each tab can be developed, tested, and deployed independently.
- ✅ **API-First Design**: Backend API endpoints (`/api/nieobecnosci`, `/api/pracownicy`) well-defined. OpenAPI contracts will be documented in `/contracts/` during Phase 1.
- ✅ **Walidacja i zgodność z prawem pracy**: Spec includes validation requirements (FR-005, FR-036). Edge cases cover date validation, limits validation. Work law compliance will be enforced through backend validation and rules engine (tab "Reguły").
- ✅ **Optymalizacja oparta na danych**: Shift parameters and rules configuration provide data-driven constraints for the schedule generator. Implementation includes limit validation and rule enforcement.
- ✅ **Documentation**: Spec provides 340-line detailed specification. Phase 1 will generate quickstart.md, API contracts, and data-model.md. Code will follow TypeScript conventions with JSDoc comments.

**Gate Status**: ✅ **PASSES** - All constitution principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   └── employees/
│       └── page.tsx                    # Main page (Radix UI Tabs shell)
├── components/
│   ├── employees/
│   │   ├── EmployeesTab.tsx           # "Wszyscy" tab component
│   │   ├── UrlopyTab.tsx              # "Urlopy" tab component
│   │   ├── ZwolnieniaTab.tsx          # "Zwolnienia" tab component
│   │   ├── ParametryZmianTab.tsx      # "Parametry zmian" tab component
│   │   ├── SwietaTab.tsx              # "Święta" tab component
│   │   ├── RegulyTab.tsx              # "Reguły" tab component
│   │   └── forms/                     # Shared form components
│   │       ├── EmployeeForm.tsx
│   │       ├── VacationForm.tsx
│   │       ├── SickLeaveForm.tsx
│   │       ├── ShiftParameterForm.tsx
│   │       ├── HolidayForm.tsx
│   │       └── RuleForm.tsx
│   └── common/                        # Reusable components
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       ├── ConfirmDialog.tsx
│       └── Table.tsx
├── services/
│   └── api/
│       ├── employees.ts               # Employee API client
│       ├── absences.ts                # Vacation/SickLeave API client
│       ├── shifts.ts                  # Shift parameters API client
│       ├── holidays.ts                # Holidays API client
│       └── rules.ts                   # Rules API client
└── tests/
    └── employees/
        ├── employees.test.ts
        ├── vacations.test.ts
        ├── sick-leaves.test.ts
        └── e2e/employees.spec.ts      # Playwright e2e tests

backend/
├── models.py                          # New: ShiftParameter, Holiday, HourLimit, Rule
├── api/
│   ├── nieobecnosci.py               # Existing: enhanced with validation
│   ├── pracownicy.py                 # Existing: enhanced with validation
│   ├── shift_parameters.py           # New: shift parameters endpoints
│   ├── holidays.py                   # New: holidays endpoints
│   └── rules.py                      # New: rules endpoints
├── services/
│   ├── validation.py                 # New: work law validation service
│   └── rules_engine.py               # New: rules enforcement service
└── tests/
    └── test_*.py                     # Integration tests for new endpoints
```

**Structure Decision**: Web application with separate frontend (Next.js/TypeScript) and backend (Python) directories. Frontend components organized by feature domain (employees-specific), with shared reusable components. Backend models and services follow existing patterns. New entities (ShiftParameter, Holiday, HourLimit, Rule) handled as new models with dedicated API endpoints.

## Phase 0: Research & Decisions

**Status**: No critical unknowns requiring research.

### Decisions Made

1. **Radix UI Tabs Selection**: Chosen for accessibility (WCAG), composability, and simplicity. Alternatives (Headless UI, Material UI) considered but Radix UI offers best balance of control and built-in a11y.

2. **Database Model Changes**: New tables (ShiftParameter, Holiday, HourLimit, Rule) will extend existing SQLite schema. Considered alternatives: single JSON column (rejected - poor queryability), separate service (rejected - adds complexity). Using dedicated tables provides:
   - Type safety via SQLAlchemy models
   - Query flexibility for filtering/sorting
   - Proper relationships and constraints

3. **API Design**: RESTful pattern consistent with existing endpoints:
   - `GET /api/shift-parameters?day=monday`
   - `POST /api/holidays`
   - `PUT /api/rules/{id}`
   - Alternatives (GraphQL, gRPC) rejected for maintaining consistency with current API surface.

4. **Form Validation**: Dual-layer approach:
   - Client-side: React Hook Form + Zod for UX feedback
   - Server-side: Pydantic + custom validators for security
   - Alternatives (only client, only server) rejected - need both for UX and security.

5. **State Management**: React Context for tab navigation + local component state for forms. Redux/Zustand rejected - overkill for single-page feature scope.

---

## Phase 1: Design & Contracts

### Data Model (data-model.md)

6 entities with attributes and relationships:

**Employee** (existing, enhanced)
- id, imie, nazwisko, stanowisko, status, etat
- Relations: one-to-many with Absence, ShiftParameter (as lead_id)

**Absence** (existing `Nieobecnosc`, enhanced)
- id, pracownik_id, data_od, data_do, typ, powód, utworzono
- typ discriminates: "urlop" | "zwolnienie" | "inne"

**ShiftParameter** (new)
- id, dzień_tygodnia (0-6), typ_zmiany ("Rano"|"Środek"|"Popoludniu"), godzina_od, godzina_do, liczba_obsad, czy_prowadzący

**Holiday** (new `Święto`)
- id, data, nazwa, opis

**HourLimit** (new `Limit Godzin`)
- id, etat (0.25|0.5|0.75|1.0), max_dziennie, max_tygodniowo, max_miesięcznie, max_kwartalnie

**Rule** (new `Reguła`)
- id, nazwa, opis, typ

### API Contracts

Contracts will be documented in `/contracts/openapi.yaml` using OpenAPI 3.0 spec:

- `GET /api/pracownicy` → Employee[]
- `POST /api/pracownicy` → Employee
- `PUT /api/pracownicy/{id}` → Employee
- `DELETE /api/pracownicy/{id}` → void

- `GET /api/nieobecnosci?typ=urlop` → Absence[]
- `POST /api/nieobecnosci` → Absence
- `PUT /api/nieobecnosci/{id}` → Absence
- `DELETE /api/nieobecnosci/{id}` → void

- `GET /api/shift-parameters?day=0` → ShiftParameter[]
- `POST /api/shift-parameters` → ShiftParameter
- `PUT /api/shift-parameters/{id}` → ShiftParameter
- `DELETE /api/shift-parameters/{id}` → void

- `GET /api/holidays` → Holiday[]
- `POST /api/holidays` → Holiday
- `PUT /api/holidays/{id}` → Holiday
- `DELETE /api/holidays/{id}` → void

- `GET /api/rules` → Rule[]
- `POST /api/rules` → Rule
- `PUT /api/rules/{id}` → Rule
- `DELETE /api/rules/{id}` → void

### Quickstart

`quickstart.md` will include:
1. Setting up TypeScript types for 6 entities
2. Initializing Radix UI Tabs wrapper
3. Creating first tab component (EmployeesTab) with sample code
4. API integration pattern using fetch/axios
5. Form validation setup with React Hook Form
6. Testing patterns (unit, component, e2e)

---

## Complexity Tracking

**No Constitution violations. No complexity justifications required.**

---

## Next Steps

**Phase 0 Complete**: No research needed - all decisions documented above.

**Phase 1 Complete**: Will generate:
- `research.md` (decisions + rationale)
- `data-model.md` (6 entities with full specs)
- `contracts/openapi.yaml` (REST API spec)
- `quickstart.md` (developer guide)
- Updated agent context via `update-agent-context.ps1`

**Ready for Phase 2**: Run `/speckit.tasks` to generate actionable task list (tasks.md)
