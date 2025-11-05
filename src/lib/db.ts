import Database from '@tauri-apps/plugin-sql';
import type { Employee, Shift, Absence, ScheduleEntry } from './types';
import { validateScheduleEntry, validateAbsence, type ValidationResult } from './validation';

let db: Database | null = null;

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:grafik.db');
  }
  return db;
}

/**
 * Get database instance
 */
export async function getDatabase(): Promise<Database> {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// Employee operations

export async function getEmployees(): Promise<Employee[]> {
  const database = await getDatabase();
  const result = await database.select<Employee[]>(
    'SELECT * FROM employees ORDER BY last_name, first_name'
  );
  return result;
}

export async function addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
  const database = await getDatabase();
  const result = await database.execute(
    'INSERT INTO employees (first_name, last_name, role, employment_type, status) VALUES (?, ?, ?, ?, ?)',
    [
      employee.first_name,
      employee.last_name,
      employee.role || null,
      employee.employment_type,
      employee.status,
    ]
  );

  const newEmployee = await database.select<Employee[]>(
    'SELECT * FROM employees WHERE id = ?',
    [result.lastInsertId]
  );

  if (!newEmployee || newEmployee.length === 0) {
    throw new Error('Nie znaleziono nowo dodanego pracownika');
  }

  return newEmployee[0];
}

export async function updateEmployee(employee: Employee): Promise<Employee> {
  if (!employee.id) {
    throw new Error('ID pracownika jest wymagane');
  }

  const database = await getDatabase();
  await database.execute(
    'UPDATE employees SET first_name = ?, last_name = ?, role = ?, employment_type = ?, status = ? WHERE id = ?',
    [
      employee.first_name,
      employee.last_name,
      employee.role || null,
      employee.employment_type,
      employee.status,
      employee.id,
    ]
  );

  const updatedEmployee = await database.select<Employee[]>(
    'SELECT * FROM employees WHERE id = ?',
    [employee.id]
  );

  if (!updatedEmployee || updatedEmployee.length === 0) {
    throw new Error('Nie znaleziono zaktualizowanego pracownika');
  }

  return updatedEmployee[0];
}

// Shift operations

export async function getShifts(): Promise<Shift[]> {
  const database = await getDatabase();
  const result = await database.select<Shift[]>(
    'SELECT * FROM shifts ORDER BY day_of_week, start_time'
  );
  return result;
}

export async function updateShifts(shifts: Shift[]): Promise<void> {
  const database = await getDatabase();

  // Delete all existing shifts
  await database.execute('DELETE FROM shifts');

  // Insert new shifts
  for (const shift of shifts) {
    await database.execute(
      'INSERT INTO shifts (day_of_week, start_time, end_time, required_staff) VALUES (?, ?, ?, ?)',
      [shift.day_of_week, shift.start_time, shift.end_time, shift.required_staff]
    );
  }
}

// Absence operations

export async function getAbsences(): Promise<Absence[]> {
  const database = await getDatabase();
  const result = await database.select<Absence[]>(
    'SELECT * FROM absences ORDER BY start_date'
  );
  return result;
}

export async function addAbsence(absence: Omit<Absence, 'id'>): Promise<Absence> {
  const database = await getDatabase();
  const result = await database.execute(
    'INSERT INTO absences (employee_id, start_date, end_date, type) VALUES (?, ?, ?, ?)',
    [absence.employee_id, absence.start_date, absence.end_date, absence.type]
  );

  const newAbsence = await database.select<Absence[]>(
    'SELECT * FROM absences WHERE id = ?',
    [result.lastInsertId]
  );

  if (!newAbsence || newAbsence.length === 0) {
    throw new Error('Nie znaleziono nowo dodanej nieobecności');
  }

  return newAbsence[0];
}

export async function deleteAbsence(id: number): Promise<void> {
  const database = await getDatabase();
  await database.execute('DELETE FROM absences WHERE id = ?', [id]);
}

// Schedule operations

export async function getSchedule(
  startDate: string,
  endDate: string
): Promise<ScheduleEntry[]> {
  const database = await getDatabase();
  const result = await database.select<ScheduleEntry[]>(
    'SELECT * FROM schedule_entries WHERE date >= ? AND date <= ? ORDER BY date',
    [startDate, endDate]
  );
  return result;
}

export async function updateScheduleEntry(entry: ScheduleEntry): Promise<ScheduleEntry> {
  const database = await getDatabase();

  if (entry.id) {
    // Update existing entry
    await database.execute(
      'UPDATE schedule_entries SET employee_id = ?, date = ?, shift_id = ? WHERE id = ?',
      [entry.employee_id, entry.date, entry.shift_id, entry.id]
    );

    const updated = await database.select<ScheduleEntry[]>(
      'SELECT * FROM schedule_entries WHERE id = ?',
      [entry.id]
    );

    if (!updated || updated.length === 0) {
      throw new Error('Nie znaleziono zaktualizowanego wpisu');
    }

    return updated[0];
  } else {
    // Insert new entry
    const result = await database.execute(
      'INSERT INTO schedule_entries (employee_id, date, shift_id) VALUES (?, ?, ?)',
      [entry.employee_id, entry.date, entry.shift_id]
    );

    const newEntry = await database.select<ScheduleEntry[]>(
      'SELECT * FROM schedule_entries WHERE id = ?',
      [result.lastInsertId]
    );

    if (!newEntry || newEntry.length === 0) {
      throw new Error('Nie znaleziono nowo dodanego wpisu');
    }

    return newEntry[0];
  }
}

/**
 * Waliduje i zapisuje wpis w grafiku
 * Zwraca wynik walidacji wraz z zapisanym wpisem (jeśli walidacja przeszła)
 */
export async function validateAndSaveScheduleEntry(
  entry: ScheduleEntry
): Promise<{ result: ValidationResult; entry?: ScheduleEntry }> {
  // Pobierz wszystkie dane potrzebne do walidacji
  const [allEntries, employees, shifts, absences] = await Promise.all([
    getSchedule('1900-01-01', '2100-12-31'), // Wszystkie wpisy
    getEmployees(),
    getShifts(),
    getAbsences(),
  ]);

  // Wykonaj walidację
  const validationResult = await validateScheduleEntry(entry, allEntries, employees, shifts, absences);

  // Jeśli są błędy krytyczne, nie zapisuj
  if (!validationResult.valid) {
    return { result: validationResult };
  }

  // Zapisz wpis
  const savedEntry = await updateScheduleEntry(entry);

  return {
    result: validationResult,
    entry: savedEntry,
  };
}

/**
 * Waliduje i zapisuje nieobecność
 */
export async function validateAndSaveAbsence(
  absence: Omit<Absence, 'id'>
): Promise<{ result: ValidationResult; absence?: Absence }> {
  const existingAbsences = await getAbsences();

  const validationResult = validateAbsence(absence, existingAbsences);

  if (!validationResult.valid) {
    return { result: validationResult };
  }

  const savedAbsence = await addAbsence(absence);

  return {
    result: validationResult,
    absence: savedAbsence,
  };
}
