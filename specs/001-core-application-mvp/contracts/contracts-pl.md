# Kontrakty API (Polecenia Tauri)

Ten dokument definiuje kontrakty dla poleceń Tauri, których frontend Next.js będzie używał do interakcji z backendem Rust. Te polecenia stanowią główne API aplikacji.

---

### Zarządzanie Pracownikami

**`get_employees`**
- **Opis**: Pobiera wszystkich pracowników z bazy danych.
- **Ładunek**: Brak
- **Zwraca**: `Promise<Employee[]>`

**`add_employee`**
- **Opis**: Dodaje nowego pracownika.
- **Ładunek**: `Omit<Employee, 'id'>`
- **Zwraca**: `Promise<Employee>` (nowo utworzony pracownik z jego ID)

**`update_employee`**
- **Opis**: Aktualizuje istniejącego pracownika.
- **Ładunek**: `Employee`
- **Zwraca**: `Promise<Employee>`

---

### Zarządzanie Zmianami

**`get_shifts`**
- **Opis**: Pobiera wszystkie definicje zmian.
- **Ładunek**: Brak
- **Zwraca**: `Promise<Shift[]>`

**`update_shifts`**
- **Opis**: Nadpisuje wszystkie definicje zmian dla wszystkich dni tygodnia.
- **Ładunek**: `Shift[]`
- **Zwraca**: `Promise<void>`

---

### Zarządzanie Nieobecnościami

**`get_absences`**
- **Opis**: Pobiera wszystkie nieobecności.
- **Ładunek**: Brak
- **Zwraca**: `Promise<Absence[]>`

**`add_absence`**
- **Opis**: Dodaje nową nieobecność.
- **Ładunek**: `Omit<Absence, 'id'>`
- **Zwraca**: `Promise<Absence>`

**`delete_absence`**
- **Opis**: Usuwa nieobecność.
- **Ładunek**: `{ id: number }`
- **Zwraca**: `Promise<void>`

---

### Zarządzanie Grafikiem

**`get_schedule`**
- **Opis**: Pobiera wszystkie wpisy grafiku dla danego zakresu dat.
- **Ładunek**: `{ startDate: string; endDate: string; }` (np. '2025-11-01')
- **Zwraca**: `Promise<ScheduleEntry[]>`

**`update_schedule_entry`**
- **Opis**: Tworzy lub aktualizuje pojedynczy wpis grafiku (przypisanie ręczne).
- **Ładunek**: `ScheduleEntry`
- **Zwraca**: `Promise<ScheduleEntry>`

---

### Polecenia Solvera

**`run_local_solver`**
- **Opis**: Uruchamia lokalny solver (skrypt Pythona z OR-Tools) w celu wygenerowania grafiku dla danego zakresu dat.
- **Ładunek**: `{ startDate: string; endDate: string; }`
- **Zwraca**: `Promise<SolverResult>`

**`run_gemini_solver`**
- **Opis**: Uruchamia solver Gemini w celu wygenerowania propozycji grafiku.
- **Ładunek**: `{ startDate: string; endDate: string; }`
- **Zwraca**: `Promise<SolverResult>`

---

### Typy Pomocnicze

```typescript
// Na podstawie data-model.md

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