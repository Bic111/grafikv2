# Tasks: Plan 2 – WorkSchedule PL Expansion

**Input**: Design documents from `/specs/001-extend-schedule-plan/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Playwright e2e and pytest coverage are included where they materially de-risk features.

**Organization**: Tasks are grouped by user story so each slice can be delivered and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Przygotowanie wspólnych zasobów dokumentacyjnych i testowych.

- [X] T001 Scaffold documentation directories (create `docs/analysis`, `docs/schema`, `docs/ui`) to host new artefacts
- [X] T002 Configure Playwright runner by adding `frontend/playwright.config.ts` and `frontend/package.json` scripts
- [X] T003 Create `frontend/tests/e2e/` harness (helpers and `.gitkeep`) for upcoming browser scenarios

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Artefakty dokumentacyjne i modele wymagane przez wszystkie user stories.

- [X] T004 Draft legal rule compendium in `docs/analysis/ANALIZA_KP.md` covering every labor-law constraint
- [X] T005 Create ERD specification in `docs/schema/work-schedule.mmd` reflecting updated entities and relationships
- [X] T006 Produce UX mockups in `docs/ui/` (`dashboard-wireframe.md`, `settings-wireframe.md`, `reports-wireframe.md`) for stakeholder sign-off
- [X] T007 Update API contract in `specs/001-extend-schedule-plan/contracts/openapi.yaml` with holidays, parameters, validation, and reporting endpoints
- [X] T008 Implement new entities (`LaborLawRule`, `Holiday`, `StaffingRequirementTemplate`, `GeneratorParameter`, `ReportSnapshot`) in `backend/models.py` and expose them via `backend/database.py`
- [X] T009 Extend `backend/sample_data.py` to seed holidays, staffing templates, generator parameters, and example rules

**Checkpoint**: Dokumentacja i modele gotowe – można startować z user stories.

---

## Phase 3: User Story 1 – Generate compliant monthly schedules (Priority: P1) 🎯 MVP

**Goal**: Scheduler generuje miesięczny grafik OR-Tools z pełną walidacją prawną.

**Independent Test**: Uruchomić generowanie miesiąca w trybie `ortools` i potwierdzić, że raport walidacji nie zawiera blokujących naruszeń.

### Tests

- [X] T010 [P] [US1] Add pytest coverage for OR-Tools flow in `backend/tests/test_ortools_generator.py`
- [X] T011 [P] [US1] Extend `backend/tests/test_walidacja.py` with cases for odpoczynek, limity godzin i święta

### Implementation

- [X] T012 [P] [US1] Refactor existing heuristic logic into `backend/core/heuristic_generator.py` and adjust imports
- [X] T013 [US1] Implement CP-SAT generator class in `backend/core/ortools_generator.py` consuming new entities
- [X] T014 [US1] Introduce configuration loader in `backend/services/configuration.py` to fetch rules, templates, preferences, holidays
- [X] T015 [US1] Expand `backend/services/walidacja.py` to evaluate all rules from `LaborLawRule` with severity handling
- [X] T016 [US1] Update `backend/api/schedules.py` and `backend/api/utils.py` to accept `generator_type`, return diagnostics, and enforce runtime targets
- [X] T017 [US1] Create validation endpoint `backend/api/validation.py` and register blueprint in `backend/api/__init__.py`
- [x] T018 [US1] Update `frontend/app/schedule/page.tsx` to pick generator profile, surface diagnostics, and highlight issues
- [x] T019 [US1] ~~Add `tests/e2e/generate-schedule.spec.ts` to cover both heuristic + ortools generators~~ (REMOVED - functionality integrated into `/schedule`, separate `/generator` page deleted)

**Checkpoint**: Pełny przepływ generowania grafiku działa i jest testowalny niezależnie.

---

## Phase 4: User Story 2 – Configure rules, holidays, and generator parameters (Priority: P2)

**Goal**: Scheduler samodzielnie utrzymuje reguły, kalendarz świąt, wymagania obsadowe i wagi optymalizacji.

**Independent Test**: Zaktualizować święto, szablon obsady i profil wag, następnie wygenerować grafik i zaobserwować zmianę w walidacji.

### Tests

 - [X] T020 [P] [US2] Add Playwright flow `frontend/tests/e2e/configure-rules.spec.ts` pokrywający edycję świąt i wag

### Implementation

- [X] T021 [P] [US2] Implement holidays CRUD in `backend/api/holidays.py` and register blueprint in `backend/api/__init__.py`
- [X] T022 [P] [US2] Provide staffing template endpoints in `backend/api/staffing_requirements.py` with validation
- [X] T023 [US2] Extend `backend/services/configuration.py` with create/update logic for holidays, templates, generator parameters
- [X] T024 [US2] Update `frontend/app/settings/page.tsx` to manage holidays, wymagania obsadowe per dzień i profile wag
- [X] T025 [US2] Enhance `frontend/app/employees/page.tsx` to capture preferencje i ograniczenia czasu pracy pracownika
- [X] T026 [US2] Wire configuration endpoints into `frontend/app/settings/page.tsx` optimistic UI with error handling

**Checkpoint**: Konfiguracja reguł możliwa w UI, wpływa na kolejne generacje grafików.

---

## Phase 5: User Story 3 – Monitor outcomes and distribute deliverables (Priority: P3)

**Goal**: Scheduler monitoruje jakość grafiku, eksportuje raporty i przygotowuje paczkę instalacyjną.

**Independent Test**: Załadować dashboard, wyeksportować raport CSV i wygenerować paczkę `release/` zgodnie z quickstartem.

### Tests

- [X] T027 [P] [US3] Add Playwright coverage `frontend/tests/e2e/reports-dashboard.spec.ts` dla dashboardu i eksportu raportu

### Implementation

- [X] T028 [P] [US3] Enhance reporter metrics in `backend/services/reporter.py` (coverage, nadgodziny, alerty) oraz dodać wsparcie wielu formatów
- [X] T029 [US3] Extend `backend/api/reporting.py` to return enriched metrics and downloadable exports
- [X] T030 [US3] Build dashboard view in `frontend/app/page.tsx` pokazując KPI, alerty i nadchodzące nieobecności
- [X] T031 [US3] Create reports workspace `frontend/app/reports/page.tsx` z filtrowaniem miesiąca i przyciskiem eksportu
- [X] T032 [US3] Update `start_app.ps1` z trybem produkcyjnym bundlującym backend + zbudowany frontend
- [X] T033 [US3] Write offline installation guide `docs/INSTRUKCJA.md` opisującą paczkę release/

**Checkpoint**: Dashboard i dystrybucja gotowe, raporty eksportują dane.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wygładzenie całości, QA i dokumentacja końcowa.

- [X] T034 [P] Refresh quickstart flow by validating steps in `specs/001-extend-schedule-plan/quickstart.md` i dopisaniem ewentualnych korekt
- [X] T035 Update repo README (root `README.md`) z podsumowaniem zmian Plan 2 i nowymi sekcjami uruchomieniowymi
- [X] T036 Run full automated suite (`pytest`, `npx playwright test`) i utrwalić wyniki w `docs/QA-report.md`
- [ ] T037 [P] Przeprowadzić audit dostępności UI i zapisać wnioski w `docs/ui/accessibility-checklist.md`

---

## Dependencies & Execution Order

- **Setup → Foundational → User Stories → Polish** (twarda kolejność)
- **User Story Order**: US1 (MVP) → US2 → US3. Każdy story jest niezależnie testowalny, ale US2 korzysta z modeli stworzonych w US1/Foundational, a US3 z raportów z US1.
- **Within US1**: testy (T010-T011) przed implementacją, następnie generatory (T012-T015), API (T016-T017), frontend + e2e (T018-T019).
- **Within US2**: backend API (T021-T023) przed UI (T024-T026), Playwright (T020) można przygotować równolegle.
- **Within US3**: backend metryki (T028-T029) przed UI (T030-T031) i dystrybucją (T032-T033).

### Parallel Opportunities

- Po ukończeniu Phase 2: US1, US2, US3 mogą być rozwijane równolegle przez odrębne osoby.
- W obrębie US1: T010 i T011 mogą startować równocześnie; T012 i T013 mogą iść równolegle po przygotowaniu planu refaktoryzacji.
- W US2: T021 i T022 są niezależne (różne moduły API), podobnie T024 i T025 (różne widoki frontowe) po zakończeniu backendu.
- W US3: T028 i T029 można realizować równolegle, podobnie prace UI (T030, T031).

## Implementation Strategy

### MVP (User Story 1)
1. Phase 1 + Phase 2 (wspólne podstawy)
2. US1 tests i implementacja (T010–T019)
3. Walidacja: generowanie grafiku OR-Tools + raport walidacji

### Kolejne iteracje
1. US2 (konfiguracja) – po MVP umożliwia samodzielną administrację
2. US3 (monitoring, dystrybucja) – zamyka pętlę raportowania i wdrożenia

### Równoległe zespoły
- Zespół A: US1 (backend core + generator + walidacja)
- Zespół B: US2 (config backend + UI)
- Zespół C: US3 (dashboard + paczka release) po ukończeniu US1

## Task Counts

- **Total tasks**: 37
- **US1 tasks**: 10 (T010–T019)
- **US2 tasks**: 6 (T020–T026)
- **US3 tasks**: 6 (T027–T033)
- **Parallel-friendly tasks**: 10 oznaczonych `[P]`
- **Independent tests**: US1, US2, US3 mają własne kryteria i Playwright/pytest scenariusze

## MVP Recommendation

Skup się najpierw na US1 (Plan 2 MVP). Po jej ukończeniu produkt dostarcza kluczową wartość – zgodny grafik z walidacją.
