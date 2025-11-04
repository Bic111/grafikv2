# Data Model

This document is generated from `spec.md` and refined based on the decisions in `research.md`. It defines the core data structures for the application, which will be stored in a local SQLite database.

---

### 1. Pracownik (Employee)

Represents an employee in the team.

**Table Name**: `employees`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for the employee. |
| `first_name` | `TEXT` | `NOT NULL` | Imię pracownika. |
| `last_name` | `TEXT` | `NOT NULL` | Nazwisko pracownika. |
| `role` | `TEXT` | | Rola w zespole (np. Manager, Recepcjonista). |
| `employment_type` | `TEXT` | `NOT NULL` | Wymiar etatu (np. "Pełny etat", "Pół etatu"). |
| `status` | `TEXT` | `NOT NULL DEFAULT 'active'` | Status pracownika (np. 'active', 'inactive'). |

---

### 2. Zmiana (Shift)

Represents a single shift block that needs to be staffed.

**Table Name**: `shifts`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for the shift definition. |
| `day_of_week` | `INTEGER` | `NOT NULL` | Dzień tygodnia (0=Niedziela, 1=Poniedziałek, ..., 6=Sobota). |
| `start_time` | `TEXT` | `NOT NULL` | Godzina rozpoczęcia w formacie `HH:MM`. |
| `end_time` | `TEXT` | `NOT NULL` | Godzina zakończenia w formacie `HH:MM`. |
| `required_staff` | `INTEGER` | `NOT NULL DEFAULT 1` | Wymagana liczba osób na zmianie. |

---

### 3. Nieobecność (Absence)

Represents a period when an employee is unavailable.

**Table Name**: `absences`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for the absence entry. |
| `employee_id` | `INTEGER` | `NOT NULL, FOREIGN KEY(employees.id)` | ID pracownika, którego dotyczy nieobecność. |
| `start_date` | `TEXT` | `NOT NULL` | Data rozpoczęcia nieobecności w formacie `YYYY-MM-DD`. |
| `end_date` | `TEXT` | `NOT NULL` | Data zakończenia nieobecności w formacie `YYYY-MM-DD`. |
| `type` | `TEXT` | `NOT NULL` | Typ nieobecności (np. 'urlop', 'zwolnienie'). |

---

### 4. Grafik (Schedule)

Represents the assignment of an employee to a specific shift on a specific day. This is the main table for the schedule view.

**Table Name**: `schedule_entries`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for the schedule entry. |
| `employee_id` | `INTEGER` | `NOT NULL, FOREIGN KEY(employees.id)` | ID przypisanego pracownika. |
| `date` | `TEXT` | `NOT NULL` | Data zmiany w formacie `YYYY-MM-DD`. |
| `shift_id` | `INTEGER` | `NOT NULL, FOREIGN KEY(shifts.id)` | ID definicji zmiany. |

---

### 5. Reguła Walidacyjna (Validation Rule)

This is a conceptual entity and will not be stored in the database as a table. The rules will be implemented in the application logic (both in the Rust backend and the Python solver script).

**Examples of rules:**
- 11-hour rest period between shifts.
- No assignments during an absence period.
- Adherence to `employment_type` hour limits over a defined period.
