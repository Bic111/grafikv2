# Model domeny i zasady

Podstawowe byty i ich atrybuty (poziom domenowy):

- Pracownik:
  - id, firstName, lastName, role ∈ {Kierownik, Z-ca kierownika, Kasjer, SSK}, status ∈ {Aktywny, Na urlopie, Chorobowe}, etat ∈ {1, 0.75, 0.5, 0.25}.

- Urlop:
  - id, employeeId, startDate, endDate, status ∈ {pending, approved, rejected}, reason?; w UI dodawane jako approved.

- Zwolnienie lekarskie:
  - id, employeeId, startDate, endDate, status ∈ {pending, approved, rejected}, notes?, createdAt; w UI dodawane jako approved.

- Parametry zmian (tydzień):
  - monday..sunday → DailyShiftSettings:
    - rows: [ShiftRow{ id, type ∈ {default, supervisor, custom}, morning|middle|afternoon: ShiftSetting{start, end, count, hours?} }].
  - Wsparcie dziedziczenia legacy (pojedynczy zestaw zmian bez rows); system migruje do rows.

- Limity według etatu:
  - etat, dailyMax, weeklyMax, monthlyMax, quarterlyMax?.

- Święto:
  - date (ISO), name, type, source, workPolicy ∈ {closed, open, reduced}, active?.

- Grafik (miesiąc/rok):
  - schedule: { [dzień]: { morning|middle|afternoon: { assignedEmployeeIds: [id], assignments? (dla formatu wielowierszowego) } } }.
  - suggestions?: tekst z sugestiami.

- Dostępność (Availability):
  - id, employeeId, date (ISO) lub wzorzec per dzień tygodnia, slot ∈ {morning, middle, afternoon}, availability ∈ {available, unavailable, prefer}, notes?.

- Wstępny plan 3-miesięczny (QuarterPlan):
  - periodStart (YYYY-MM-01), periodEnd (YYYY-MM-<last>), szkic obsad podobny do „Grafik”, opcjonalnie lżejszy (np. tylko liczba osób/role/wiersze bez nazwisk), referencje do „Dostępność”.

Zasady kluczowe:
- Role „Kierownik”, „Z-ca kierownika”, „SSK” mogą oznaczać prowadzącego zmianę (wyświetlane jako wyróżnienie).
- Godziny zmiany mogą przechodzić na następny dzień (np. koniec 02:00).
- Błędy krytyczne nigdy nie mogą być ignorowane przy przyjmowaniu propozycji optymalizacji ani przy zapisie docelowym.
 - Generowanie docelowego grafiku miesięcznego wymaga uzupełnionych: „Dostępność” (horyzont 3M) oraz „Wstępny plan 3-miesięczny” (QuarterPlan) – wykorzystywanych do równomiernego rozkładu godzin w kwartale.

I18n:
- Całość interfejsu i raportowania w języku polskim.

Dane wejściowe:
- Import z Excel do bazy wiedzy (opis w osobnym pliku).# Model domeny i zasady

Podstawowe byty i ich atrybuty (poziom domenowy):

- Pracownik:
  - id, firstName, lastName, role ∈ {Kierownik, Z-ca kierownika, Kasjer, SSK}, status ∈ {Aktywny, Na urlopie, Chorobowe}, etat ∈ {1, 0.75, 0.5, 0.25}.

- Urlop:
  - id, employeeId, startDate, endDate, status ∈ {pending, approved, rejected}, reason?; w UI dodawane jako approved.

- Zwolnienie lekarskie:
  - id, employeeId, startDate, endDate, status ∈ {pending, approved, rejected}, notes?, createdAt; w UI dodawane jako approved.

- Parametry zmian (tydzień):
  - monday..sunday → DailyShiftSettings:
    - rows: [ShiftRow{ id, type ∈ {default, supervisor, custom}, morning|middle|afternoon: ShiftSetting{start, end, count, hours?} }].
  - Wsparcie dziedziczenia legacy (pojedynczy zestaw zmian bez rows); system migruje do rows.

- Limity według etatu:
  - etat, dailyMax, weeklyMax, monthlyMax, quarterlyMax?.

- Święto:
  - date (ISO), name, type, source, workPolicy ∈ {closed, open, reduced}, active?.

- Grafik (miesiąc/rok):
  - schedule: { [dzień]: { morning|middle|afternoon: { assignedEmployeeIds: [id], assignments? (dla formatu wielowierszowego) } } }.
  - suggestions?: tekst z sugestiami.

Zasady kluczowe:
- Role „Kierownik”, „Z-ca kierownika”, „SSK” mogą oznaczać prowadzącego zmianę (wyświetlane jako wyróżnienie).
- Godziny zmiany mogą przechodzić na następny dzień (np. koniec 02:00).
- Błędy krytyczne nigdy nie mogą być ignorowane przy przyjmowaniu propozycji optymalizacji ani przy zapisie docelowym.

I18n:
- Całość interfejsu i raportowania w języku polskim.

Dane wejściowe:
- Import z Excel do bazy wiedzy (opis w osobnym pliku).
