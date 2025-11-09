# Data Model – Plan 2 WorkSchedule PL

## Overview

Plan 2 rozszerza istniejący schemat grafiku o pełną reprezentację reguł, preferencji oraz artefaktów raportowych potrzebnych do integracji z OR-Tools i nowymi modułami UI. Poniższe encje stanowią podstawę projektowanej logiki.

## Core Entities

### LaborLawRule
- **Id**: UUID / INT (PK)
- **Code**: string (unikalny identyfikator reguły, np. `odpoczynek_dobowy`)
- **Name**: string (opis czytelny biznesowo)
- **Category**: enum (`REST`, `HOURS_LIMIT`, `NIGHT_WORK`, `SUNDAY`, `HOLIDAY`, `OTHER`)
- **Severity**: enum (`HARD`, `SOFT`)
- **Parameters**: JSON (klucz-wartość, np. minimalne_ godziny_odpoczynku)
- **Description**: text (opis logiczny zgodny z ANALIZA_KP)
- **ActiveFrom / ActiveTo**: date (opcjonalne zakresy obowiązywania)
- **Relationships**: wykorzystywana przez `ScheduleScenario` (walidacja) i generator OR-Tools.
- **Validation**: `Code` unikalny; `Parameters` muszą dostarczać wymagane pola zależne od kategorii; reguły typu `HARD` nie mogą być dezaktywowane bez podania przyczyny.

### Holiday
- **Id**: UUID / INT (PK)
- **Date**: date (unikalny)
- **Name**: string
- **CoverageOverrides**: JSON (np. `{shift_id: {role_id: {min: 1, max: 2}}}`)
- **StoreClosed**: boolean (czy grafiku nie generować)
- **Relationships**: referencje do `StaffingRequirementTemplate` (nadpisuje wartości) i `ScheduleScenario` (oznaczanie dni specjalnych).
- **Validation**: `Date` unikalny; `CoverageOverrides` musi zgadzać się z istniejącymi identyfikatorami zmian i ról.

### StaffingRequirementTemplate
- **Id**: UUID / INT (PK)
- **DayType**: enum (`WEEKDAY`, `WEEKEND`, `HOLIDAY`, lub custom)
- **ShiftId**: FK → Shift
- **RoleId**: FK → Role
- **MinStaff**: integer ≥0
- **TargetStaff**: integer ≥MinStaff
- **MaxStaff**: integer ≥TargetStaff lub NULL
- **EffectiveFrom / EffectiveTo**: date range
- **Relationships**: konsumowana przez generator oraz walidację; holiday overrides dziedziczą z niej domyślne wartości.
- **Validation**: brak nakładających się szablonów dla tej samej kombinacji DayType/Shift/Role w tym samym okresie.

### GeneratorParameter
- **Id**: PK
- **ScenarioType**: enum (`DEFAULT`, `NIGHT_FOCUS`, `PEAK_SEASON`, etc.)
- **Weights**: JSON (np. `{"soft_preference": 5, "rotation": 3}`)
- **MaxConsecutiveNights**: integer
- **MinRestHoursOverride**: integer (opcjonalne doprecyzowanie)
- **LastUpdatedBy**: string
- **Relationships**: mapowane do profili wywołań generatora (Scheduler wybiera typ scenariusza).
- **Validation**: wagi muszą być dodatnie; sumaryczne wagi mogą być normalizowane przy zapisie.

### EmployeePreference
- **Id**: PK
- **EmployeeId**: FK → Employee
- **PreferredOffDays**: JSON (lista dni tygodnia / dat)
- **PreferredShifts**: JSON (lista shift_id z priorytetem)
- **AvoidShifts**: JSON
- **MaxWeeklyHours**: integer (konkretyzuje etat)
- **Notes**: text
- **Relationships**: wejście miękkich ograniczeń OR-Tools, wpływ na walidację miękką.
- **Validation**: nie może sprzeciwiać się `LaborLawRule` (np. preferencja pracy > ustawowych limitów).

### ScheduleScenario
- **Id**: PK
- **Month**: date (pierwszy dzień miesiąca)
- **GeneratorType**: enum (`HEURISTIC`, `ORTOOLS`)
- **Status**: enum (`DRAFT`, `APPROVED`, `ARCHIVED`)
- **RunStartedAt / RunCompletedAt**: datetime
- **RuntimeMs**: integer
- **PenaltyScore**: decimal
- **AssignmentEntries**: relationship → `ScheduleEntry` (istniejąca tabela `GrafikEntry`)
- **Relationships**: powiązana z `ValidationIssue`, `GeneratorParameter`, `LaborLawRule` snapshot.
- **Validation**: `RuntimeMs` weryfikowany względem celu (<= 10 min); `Status` wymaga powiązanej walidacji `APPROVED`.

### ValidationIssue
- **Id**: PK
- **ScenarioId**: FK → ScheduleScenario
- **Severity**: enum (`BLOCKING`, `WARNING`)
- **RuleCode**: FK → LaborLawRule
- **Message**: text
- **AffectedAssignments**: JSON (np. lista `(employee_id, date, shift_id)`)
- **ResolvedAt**: datetime (opcjonalne)
- **Validation**: `Severity=BLOCKING` musi blokować status `APPROVED`.

### ReportSnapshot
- **Id**: PK
- **ScenarioId**: FK → ScheduleScenario
- **GeneratedAt**: datetime
- **Metrics**: JSON (np. praca nadgodziny, obsada per rola)
- **AbsenceSummary**: JSON
- **Format**: enum (`JSON`, `CSV`, `PDF`)
- **StoragePath**: string (lokalizacja pliku jeśli wygenerowany)
- **Validation**: `Format` i `StoragePath` wymagane tylko dla eksportów; JSON waliduje się schematem.

## Supporting Entities (istniejące)
- **Employee**: zawiera dane personalne, umowy, powiązanie z Role.
- **Role**: opis stanowiska, limitów etatu.
- **Shift**: nazwa, godziny start/koniec, typ zmiany.
- **Absence**: typ, zakres dat, powiązanie z Employee.
- **ScheduleEntry (GrafikEntry)**: przypisanie pracownika do zmiany konkretnego dnia.

## Relationships (diagram opisowy)
- `ScheduleScenario` 1..* → `ScheduleEntry`
- `ScheduleScenario` 1..* → `ValidationIssue`
- `ScheduleScenario` 1..* → `ReportSnapshot`
- `LaborLawRule` ↔ `ValidationIssue` (FK do `RuleCode`)
- `Holiday` wpływa na `StaffingRequirementTemplate` poprzez overrides
- `EmployeePreference`, `GeneratorParameter`, `StaffingRequirementTemplate`, `LaborLawRule`, `Holiday`, `Absence` są agregowane przez generator OR-Tools przy tworzeniu `ScheduleScenario`

## Data Governance
- Każda zmiana krytycznych artefaktów (`LaborLawRule`, `GeneratorParameter`, `StaffingRequirementTemplate`) powinna być wersjonowana (pole `EffectiveFrom/To`).
- Dokument `ANALIZA_KP.md` jest źródłem logicznej prawdy, natomiast rekordy w bazie stanowią odwzorowanie operacyjne; wymagane synchronizacje.
- Makiety i raporty są przechowywane w repozytorium (lub systemie plików), a informacje o wersjach powiązane w `ReportSnapshot` / dokumentacji.
