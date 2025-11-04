# Model Danych

Ten dokument jest generowany na podstawie `spec.md` i dopracowany w oparciu o decyzje w `research.md`. Definiuje on podstawowe struktury danych dla aplikacji, które będą przechowywane w lokalnej bazie danych SQLite.

---

### 1. Pracownik (Employee)

Reprezentuje pracownika w zespole.

**Nazwa Tabeli**: `employees`

| Kolumna | Typ | Ograniczenia | Opis |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unikalny identyfikator pracownika. |
| `first_name` | `TEXT` | `NOT NULL` | Imię pracownika. |
| `last_name` | `TEXT` | `NOT NULL` | Nazwisko pracownika. |
| `role` | `TEXT` | | Rola w zespole (np. Manager, Recepcjonista). |
| `employment_type` | `TEXT` | `NOT NULL` | Wymiar etatu (np. "Pełny etat", "Pół etatu"). |
| `status` | `TEXT` | `NOT NULL DEFAULT 'active'` | Status pracownika (np. 'active', 'inactive'). |

---

### 2. Zmiana (Shift)

Reprezentuje pojedynczy blok zmiany, który wymaga obsadzenia.

**Nazwa Tabeli**: `shifts`

| Kolumna | Typ | Ograniczenia | Opis |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unikalny identyfikator definicji zmiany. |
| `day_of_week` | `INTEGER` | `NOT NULL` | Dzień tygodnia (0=Niedziela, 1=Poniedziałek, ..., 6=Sobota). |
| `start_time` | `TEXT` | `NOT NULL` | Godzina rozpoczęcia w formacie `HH:MM`. |
| `end_time` | `TEXT` | `NOT NULL` | Godzina zakończenia w formacie `HH:MM`. |
| `required_staff` | `INTEGER` | `NOT NULL DEFAULT 1` | Wymagana liczba osób na zmianie. |

---

### 3. Nieobecność (Absence)

Reprezentuje okres, w którym pracownik jest niedostępny.

**Nazwa Tabeli**: `absences`

| Kolumna | Typ | Ograniczenia | Opis |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unikalny identyfikator wpisu o nieobecności. |
| `employee_id` | `INTEGER` | `NOT NULL, FOREIGN KEY(employees.id)` | ID pracownika, którego dotyczy nieobecność. |
| `start_date` | `TEXT` | `NOT NULL` | Data rozpoczęcia nieobecności w formacie `YYYY-MM-DD`. |
| `end_date` | `TEXT` | `NOT NULL` | Data zakończenia nieobecności w formacie `YYYY-MM-DD`. |
| `type` | `TEXT` | `NOT NULL` | Typ nieobecności (np. 'urlop', 'zwolnienie'). |

---

### 4. Grafik (Schedule)

Reprezentuje przypisanie pracownika do konkretnej zmiany w określonym dniu. Jest to główna tabela dla widoku grafiku.

**Nazwa Tabeli**: `schedule_entries`

| Kolumna | Typ | Ograniczenia | Opis |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unikalny identyfikator wpisu w grafiku. |
| `employee_id` | `INTEGER` | `NOT NULL, FOREIGN KEY(employees.id)` | ID przypisanego pracownika. |
| `date` | `TEXT` | `NOT NULL` | Data zmiany w formacie `YYYY-MM-DD`. |
| `shift_id` | `INTEGER` | `NOT NULL, FOREIGN KEY(shifts.id)` | ID definicji zmiany. |

---

### 5. Reguła Walidacyjna (Validation Rule)

Jest to encja koncepcyjna i nie będzie przechowywana w bazie danych jako tabela. Reguły zostaną zaimplementowane w logice aplikacji (zarówno w backendzie Rust, jak i w skrypcie solwera w Pythonie).

**Przykłady reguł:**
- 11-godzinny okres odpoczynku między zmianami.
- Brak przydziałów podczas okresu nieobecności.
- Przestrzeganie limitów godzinowych `employment_type` w zdefiniowanym okresie.
