// Type definitions matching the database schema and contracts.md

export interface Employee {
  id?: number;
  first_name: string;
  last_name: string;
  role?: string | null;
  employment_type: string;
  status: string;
}

export interface Shift {
  id?: number;
  day_of_week: number; // 0=Niedziela, 1=Poniedziałek, ..., 6=Sobota
  start_time: string; // Format: HH:MM
  end_time: string; // Format: HH:MM
  required_staff: number;
}

export interface Absence {
  id?: number;
  employee_id: number;
  start_date: string; // Format: YYYY-MM-DD
  end_date: string; // Format: YYYY-MM-DD
  type: string; // 'urlop', 'zwolnienie', etc.
}

export interface ScheduleEntry {
  id?: number;
  employee_id: number;
  date: string; // Format: YYYY-MM-DD
  shift_id: number;
}

export interface SolverResult {
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'ERROR';
  assignments: ScheduleEntry[];
  warnings: string[];
  errors: string[];
}

export interface SolverInput {
  employees: Employee[];
  shifts: Shift[];
  absences: Absence[];
  date_range: {
    start_date: string;
    end_date: string;
  };
}
