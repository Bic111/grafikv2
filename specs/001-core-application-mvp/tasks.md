# Action Plan: Core Application MVP

**Branch**: `001-core-application-mvp` | **Spec**: `spec.md`

This plan outlines the tasks required to implement the Core Application MVP, based on the provided design artifacts.

## Implementation Strategy

The implementation will be phased, with each phase corresponding to a User Story from the specification. This allows for incremental delivery and testing. The MVP is defined as the completion of User Story 1, which provides the foundational configuration capabilities.

## Dependency Graph

`Setup` → `US1 (Foundation)` → `US2 (Manual Scheduling)` → `US3 (Auto-Generation)` → `Polish`

---

## Phase 1: Project Setup & Configuration

*Goal: Initialize the project structure and configure all core technologies.*

- [X] T001 Initialize Tauri project and integrate the Next.js frontend.
- [X] T002 Configure Next.js for static export (`output: 'export'`) as required by Tauri in `next.config.ts`.
- [X] T003 Add and configure Vitest for testing, including a basic test setup in `vitest.config.ts`.
- [X] T004 Set up the Rust backend with the `tauri-plugin-sql` and a migration script to create the initial SQLite database schema based on `data-model.md`.
- [X] T005 Create a `solver/` directory and a basic Python script `solver/solve_schedule.py` with `google-ortools` as a dependency.

---

## Phase 2: US1 - System Configuration (Foundation)

*Goal: Allow a manager to configure employees and shifts.*
*Independent Test: Verify that the system correctly saves and reads configuration data via the UI.*

- [X] T006 [US1] Implement Rust structs in `src-tauri/src/models.rs` corresponding to the `Employee` and `Shift` tables from `data-model.md`.
- [X] T007 [US1] Implement Tauri commands in `src-tauri/src/main.rs` for `get_employees`, `add_employee`, `update_employee`, `get_shifts`, and `update_shifts` as defined in `contracts.md`.
- [X] T008 [P] [US1] Create the employee management page/component in `src/app/settings/employees/page.tsx` to list, add, and edit employees.
- [X] T009 [P] [US1] Create the shift configuration page/component in `src/app/settings/shifts/page.tsx` to define shifts for each day of the week.
- [X] T010 [P] [US1] Create a shared `useTauriQuery` hook in `src/lib/hooks/useTauri.ts` for simplified data fetching from the Rust backend.

---

## Phase 3: US2 - Manual Scheduling & Validation

*Goal: Allow manual schedule creation, absence management, and validation.*
*Independent Test: Verify that adding a shift on an employee's vacation day shows a critical error.*

- [X] T011 [US2] Implement Rust structs in `src-tauri/src/models.rs` for `Absence` and `ScheduleEntry`.
- [X] T012 [US2] Implement Tauri commands in `src-tauri/src/main.rs` for `get_absences`, `add_absence`, `delete_absence`, `get_schedule`, and `update_schedule_entry`.
- [X] T013 [US2] Implement core validation logic (e.g., 11-hour rest, no conflicts with absences) in the Rust backend, to be called by `update_schedule_entry`.
- [X] T014 [P] [US2] Create the absence management page/component in `src/app/settings/absences/page.tsx`.
- [X] T015 [P] [US2] Create the main schedule grid component in `src/app/schedule/page.tsx` allowing drag-and-drop or manual assignment of employees to shifts.

---

## Phase 4: US3 - Automated Schedule Generation

*Goal: Automatically generate a draft schedule using local and cloud-based solvers.*
*Independent Test: Verify that clicking "Generate" produces a valid schedule without critical errors.*

- [X] T016 [US3] Implement the `run_local_solver` Tauri command in `src-tauri/src/main.rs`. This command will serialize database state (employees, shifts, absences) into a JSON format and pass it to the `solver/solve_schedule.py` script via a child process.
- [X] T017 [US3] Implement the core logic in `solver/solve_schedule.py` to read the JSON input, build the OR-Tools model, solve it, and print the resulting schedule assignments to stdout.
- [X] T018 [US3] Implement the `run_gemini_solver` Tauri command in `src-tauri/src/main.rs`. This command will securely attach the API key and proxy the request to the Gemini API.
- [X] T019 [P] [US3] Add "Generate (Local)" and "Generate (Cloud)" buttons to the schedule page UI in `src/app/schedule/page.tsx` that invoke the respective Tauri commands.
- [X] T020 [P] [US3] Implement UI logic to display warnings and errors returned from the solver commands.

---

## Phase 5: Polish & Cross-Cutting Concerns

*Goal: Finalize the application for release.*

- [X] T021 Implement PDF and CSV export functionality as defined in FR-008. This can be a new Tauri command.
- [X] T022 Review and resolve any remaining "TODO" or "NEEDS CLARIFICATION" items from the codebase.
- [X] T023 Update the `quickstart.md` and create a `README.md` with final build and usage instructions.
- [X] T024 Perform a final build using `npm run tauri build` and test the standalone Windows executable.
