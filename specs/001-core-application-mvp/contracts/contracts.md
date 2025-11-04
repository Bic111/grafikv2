# API Contracts (Tauri Commands)

This document defines the contracts for the Tauri commands that the Next.js frontend will use to interact with the Rust backend. These commands are the primary API for the application.

---

### Employee Management

**`get_employees`**
- **Description**: Fetches all employees from the database.
- **Payload**: None
- **Returns**: `Promise<Employee[]>`

**`add_employee`**
- **Description**: Adds a new employee.
- **Payload**: `Omit<Employee, 'id'>`
- **Returns**: `Promise<Employee>` (the newly created employee with their ID)

**`update_employee`**
- **Description**: Updates an existing employee.
- **Payload**: `Employee`
- **Returns**: `Promise<Employee>`

---

### Shift Management

**`get_shifts`**
- **Description**: Fetches all shift definitions.
- **Payload**: None
- **Returns**: `Promise<Shift[]>`

**`update_shifts`**
- **Description**: Overwrites all shift definitions for all days of the week.
- **Payload**: `Shift[]`
- **Returns**: `Promise<void>`

---

### Absence Management

**`get_absences`**
- **Description**: Fetches all absences.
- **Payload**: None
- **Returns**: `Promise<Absence[]>`

**`add_absence`**
- **Description**: Adds a new absence.
- **Payload**: `Omit<Absence, 'id'>`
- **Returns**: `Promise<Absence>`

**`delete_absence`**
- **Description**: Deletes an absence.
- **Payload**: `{ id: number }`
- **Returns**: `Promise<void>`

---

### Schedule Management

**`get_schedule`**
- **Description**: Fetches all schedule entries for a given date range.
- **Payload**: `{ startDate: string; endDate: string; }` (e.g., '2025-11-01')
- **Returns**: `Promise<ScheduleEntry[]>`

**`update_schedule_entry`**
- **Description**: Creates or updates a single schedule entry (manual assignment).
- **Payload**: `ScheduleEntry`
- **Returns**: `Promise<ScheduleEntry>`

---

### Solver Commands

**`run_local_solver`**
- **Description**: Runs the local solver (Python script with OR-Tools) to generate a schedule for a given date range.
- **Payload**: `{ startDate: string; endDate: string; }`
- **Returns**: `Promise<SolverResult>`

**`run_gemini_solver`**
- **Description**: Runs the Gemini solver to generate a schedule suggestion.
- **Payload**: `{ startDate: string; endDate: string; }`
- **Returns**: `Promise<SolverResult>`

---

### Supporting Types

```typescript
// Based on data-model.md

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  role: string | null;
  employment_type: string;
  status: 'active' | 'inactive';
}

interface Shift {
  id: number;
  day_of_week: number; // 0-6
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  required_staff: number;
}

interface Absence {
  id: number;
  employee_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  type: 'urlop' | 'zwolnienie';
}

interface ScheduleEntry {
  id: number;
  employee_id: number;
  date: string; // YYYY-MM-DD
  shift_id: number;
}

interface SolverResult {
  success: boolean;
  schedule_entries: ScheduleEntry[];
  warnings: string[];
  error_message: string | null;
}
```
