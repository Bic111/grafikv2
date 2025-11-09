# Tasks: WorkSchedule PL Lokalnie

**Input**: Design documents from `/specs/001-work-schedule-app/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)
- [X] T001 [P] Create backend project structure: `mkdir backend` and `cd backend`
- [X] T002 [P] Create and activate Python virtual environment: `python -m venv venv` and `.\venv\Scripts\activate`
- [X] T003 [P] Install backend dependencies: `pip install Flask SQLAlchemy Flask-CORS python-dotenv ortools pandas openpyxl reportlab`
- [X] T004 [P] Create frontend project structure: `npx create-next-app@latest frontend --typescript --eslint --tailwind`
- [X] T005 [P] Install frontend dependencies: `cd frontend` and `npm install axios`
- [X] T006 Initialize git repository: `git init`

## Phase 2: Foundational (Blocking Prerequisites)
- [X] T007 Setup database connection in `backend/database.py`
- [X] T008 Implement SQLAlchemy models for all entities in `backend/models.py` based on `data-model.md`
- [X] T009 Create initial database schema with `create_db_tables()` function in `backend/database.py`
- [X] T010 Configure basic Flask/FastAPI application in `backend/app.py` with CORS
- [X] T011 Create basic frontend layout with navigation in `frontend/app/layout.tsx`

## Phase 3: User Story 1 - Konfiguracja Systemu (Priority: P1) 🎯 MVP
**Goal**: Allow manager to configure employees, roles, and shifts.
**Independent Test**: Verify that new employees and shifts can be created via the UI and are saved to the database.

### Implementation for User Story 1
- [X] T012 [P] [US1] Implement CRUD API endpoints for Pracownicy in `backend/api/employees.py`
- [X] T013 [P] [US1] Implement CRUD API endpoints for Role in `backend/api/roles.py`
- [X] T014 [P] [US1] Implement CRUD API endpoints for Zmiany in `backend/api/shifts.py`
- [X] T015 [US1] Create frontend page for employee management at `frontend/app/employees/page.tsx`
- [X] T016 [US1] Create frontend page for role and shift management at `frontend/app/settings/page.tsx`

## Phase 4: User Story 2 - Generowanie Grafiku (Priority: P1)
**Goal**: Generate a valid work schedule.
**Independent Test**: Verify that the generated schedule is saved to the database and is compliant with labor laws.

### Implementation for User Story 2
- [X] T017 [US2] Implement `walidacja.py` service in `backend/services/` with labor law validation functions
- [X] T018 [US2] Implement `generator.py` core service in `backend/core/` using logic from PoC
- [X] T019 [US2] Create API endpoint `POST /api/grafiki/generuj` to trigger the generator in `backend/api/schedules.py`
- [X] T020 [US2] Create frontend page for schedule generation at `frontend/app/generator/page.tsx`
- [X] T021 [US2] Implement basic calendar view to display the schedule at `frontend/app/schedule/page.tsx`

## Phase 5: User Story 3 - Zarządzanie Grafikiem (Priority: P2)
**Goal**: Allow manual edits and absence management.
**Independent Test**: Verify that manual changes in the calendar are saved and re-validated.

### Implementation for User Story 3
- [X] T022 [P] [US3] Implement API endpoints for Nieobecnosci in `backend/api/absences.py`
- [X] T023 [US3] Implement API endpoint `PUT /api/grafiki/{id}` for updating schedule entries in `backend/api/schedules.py`
- [X] T024 [US3] Add drag-and-drop functionality to the frontend calendar view in `frontend/app/schedule/page.tsx`
- [X] T025 [US3] Create frontend view for managing absences.

## Phase 6: Polish & Cross-Cutting Concerns
- [X] T026 [P] Implement Excel import functionality (`POST /api/import/excel`) in `backend/services/excel_importer.py`
- [X] T027 [P] Implement reporting functionality (`GET /api/raporty`) in `backend/services/reporter.py`
- [X] T028 Write unit tests for `walidacja.py` and `generator.py`
- [X] T029 Create PowerShell script `start_app.ps1` for easy application startup.

