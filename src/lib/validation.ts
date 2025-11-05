import type { Employee, Shift, Absence, ScheduleEntry } from './types';

export interface ValidationError {
  severity: 'critical' | 'warning';
  message: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Parsuje czas HH:MM do liczby minut od północy
 */
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Oblicza różnicę w godzinach między dwoma czasami
 */
function hoursDifference(time1: string, time2: string): number {
  const minutes1 = parseTime(time1);
  const minutes2 = parseTime(time2);
  return Math.abs(minutes2 - minutes1) / 60;
}

/**
 * Sprawdza czy data jest w okresie nieobecności
 */
function isDateInAbsence(date: string, absence: Absence): boolean {
  return date >= absence.start_date && date <= absence.end_date;
}

/**
 * Waliduje przypisanie zmiany do pracownika
 */
export async function validateScheduleEntry(
  entry: ScheduleEntry,
  allEntries: ScheduleEntry[],
  employees: Employee[],
  shifts: Shift[],
  absences: Absence[]
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  // Znajdź pracownika
  const employee = employees.find((e) => e.id === entry.employee_id);
  if (!employee) {
    errors.push({
      severity: 'critical',
      message: 'Nie znaleziono pracownika',
      field: 'employee_id',
    });
    return { valid: false, errors };
  }

  // Znajdź zmianę
  const shift = shifts.find((s) => s.id === entry.shift_id);
  if (!shift) {
    errors.push({
      severity: 'critical',
      message: 'Nie znaleziono definicji zmiany',
      field: 'shift_id',
    });
    return { valid: false, errors };
  }

  // Sprawdź nieobecności
  const employeeAbsences = absences.filter((a) => a.employee_id === entry.employee_id);
  for (const absence of employeeAbsences) {
    if (isDateInAbsence(entry.date, absence)) {
      errors.push({
        severity: 'critical',
        message: `Pracownik ma nieobecność (${absence.type}) w tym dniu (${absence.start_date} - ${absence.end_date})`,
        field: 'date',
      });
    }
  }

  // Sprawdź 11-godzinny odpoczynek między zmianami
  const previousDayEntries = allEntries.filter(
    (e) =>
      e.employee_id === entry.employee_id &&
      e.id !== entry.id &&
      e.date < entry.date
  );

  if (previousDayEntries.length > 0) {
    // Sortuj malejąco po dacie, żeby znaleźć ostatnią zmianę
    previousDayEntries.sort((a, b) => b.date.localeCompare(a.date));
    const lastEntry = previousDayEntries[0];
    const lastShift = shifts.find((s) => s.id === lastEntry.shift_id);

    if (lastShift) {
      // Sprawdź czy ostatnia zmiana była poprzedniego dnia
      const lastDate = new Date(lastEntry.date);
      const currentDate = new Date(entry.date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Oblicz czas odpoczynku
        const lastShiftEnd = parseTime(lastShift.end_time);
        const currentShiftStart = parseTime(shift.start_time);

        // Jeśli zmiana kończy się po północy, dodaj 24h
        let restMinutes = currentShiftStart + (24 * 60) - lastShiftEnd;
        if (restMinutes < 0) restMinutes += 24 * 60;

        const restHours = restMinutes / 60;

        if (restHours < 11) {
          errors.push({
            severity: 'critical',
            message: `Nie zachowany 11-godzinny odpoczynek (tylko ${restHours.toFixed(1)}h). Ostatnia zmiana: ${lastEntry.date} ${lastShift.end_time}, nowa zmiana: ${entry.date} ${shift.start_time}`,
            field: 'date',
          });
        }
      }
    }
  }

  // Sprawdź duplikaty - czy pracownik nie ma już przypisanej zmiany tego dnia
  const duplicates = allEntries.filter(
    (e) =>
      e.employee_id === entry.employee_id &&
      e.date === entry.date &&
      e.id !== entry.id
  );

  if (duplicates.length > 0) {
    errors.push({
      severity: 'warning',
      message: 'Pracownik ma już przypisaną zmianę w tym dniu',
      field: 'date',
    });
  }

  // Sprawdź limity godzinowe według wymiaru etatu (uproszczona wersja)
  const weekStart = getWeekStart(entry.date);
  const weekEnd = getWeekEnd(entry.date);

  const weekEntries = allEntries.filter(
    (e) =>
      e.employee_id === entry.employee_id &&
      e.date >= weekStart &&
      e.date <= weekEnd &&
      e.id !== entry.id
  );

  let totalWeekHours = 0;
  for (const weekEntry of weekEntries) {
    const weekShift = shifts.find((s) => s.id === weekEntry.shift_id);
    if (weekShift) {
      totalWeekHours += hoursDifference(weekShift.start_time, weekShift.end_time);
    }
  }

  // Dodaj godziny z aktualnej zmiany
  totalWeekHours += hoursDifference(shift.start_time, shift.end_time);

  // Limity według wymiaru etatu
  const weeklyLimits: Record<string, number> = {
    'Pełny etat': 40,
    'Pół etatu': 20,
    '3/4 etatu': 30,
    '1/4 etatu': 10,
  };

  const limit = weeklyLimits[employee.employment_type] || 40;

  if (totalWeekHours > limit) {
    errors.push({
      severity: 'warning',
      message: `Przekroczenie limitu tygodniowego (${totalWeekHours.toFixed(1)}h / ${limit}h dla ${employee.employment_type})`,
      field: 'date',
    });
  }

  return {
    valid: errors.filter((e) => e.severity === 'critical').length === 0,
    errors,
  };
}

/**
 * Pobiera datę początku tygodnia (poniedziałek) dla danej daty
 */
function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Poniedziałek
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/**
 * Pobiera datę końca tygodnia (niedziela) dla danej daty
 */
function getWeekEnd(dateStr: string): string {
  const weekStart = new Date(getWeekStart(dateStr));
  const sunday = new Date(weekStart);
  sunday.setDate(weekStart.getDate() + 6);
  return sunday.toISOString().split('T')[0];
}

/**
 * Waliduje nieobecność
 */
export function validateAbsence(
  absence: Omit<Absence, 'id'>,
  existingAbsences: Absence[]
): ValidationResult {
  const errors: ValidationError[] = [];

  // Sprawdź czy data końca jest po dacie początku
  if (absence.end_date < absence.start_date) {
    errors.push({
      severity: 'critical',
      message: 'Data zakończenia musi być późniejsza niż data rozpoczęcia',
      field: 'end_date',
    });
  }

  // Sprawdź nakładające się nieobecności dla tego samego pracownika
  const overlapping = existingAbsences.filter((existing) => {
    if (existing.employee_id !== absence.employee_id) return false;

    // Sprawdź czy zakresy się nakładają
    return (
      (absence.start_date >= existing.start_date && absence.start_date <= existing.end_date) ||
      (absence.end_date >= existing.start_date && absence.end_date <= existing.end_date) ||
      (absence.start_date <= existing.start_date && absence.end_date >= existing.end_date)
    );
  });

  if (overlapping.length > 0) {
    errors.push({
      severity: 'warning',
      message: `Nakładająca się nieobecność: ${overlapping[0].start_date} - ${overlapping[0].end_date} (${overlapping[0].type})`,
      field: 'start_date',
    });
  }

  return {
    valid: errors.filter((e) => e.severity === 'critical').length === 0,
    errors,
  };
}
