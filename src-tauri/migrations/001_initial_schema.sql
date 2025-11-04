-- Initial database schema for Grafik application
-- Based on data-model.md specification

-- Pracownik (Employee) table
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT,
    employment_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active'
);

-- Zmiana (Shift) table
CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    required_staff INTEGER NOT NULL DEFAULT 1
);

-- Nieobecność (Absence) table
CREATE TABLE IF NOT EXISTS absences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    type TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Grafik (Schedule Entry) table
CREATE TABLE IF NOT EXISTS schedule_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    shift_id INTEGER NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_absences_employee ON absences(employee_id);
CREATE INDEX IF NOT EXISTS idx_absences_dates ON absences(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_schedule_employee ON schedule_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule_entries(date);
CREATE INDEX IF NOT EXISTS idx_schedule_shift ON schedule_entries(shift_id);
CREATE INDEX IF NOT EXISTS idx_shifts_day ON shifts(day_of_week);
