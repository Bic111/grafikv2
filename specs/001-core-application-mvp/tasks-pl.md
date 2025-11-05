# Plan Działania: Rdzeń Aplikacji MVP

**Gałąź**: `001-core-application-mvp` | **Specyfikacja**: `spec.md`

Ten plan określa zadania wymagane do wdrożenia Rdzenia Aplikacji MVP, w oparciu o dostarczone artefakty projektowe.

## Strategia Implementacji

Implementacja będzie prowadzona etapami, przy czym każdy etap odpowiada Historii Użytkownika ze specyfikacji. Pozwala to na przyrostowe dostarczanie i testowanie. MVP jest zdefiniowane jako ukończenie Historii Użytkownika 1, która zapewnia podstawowe możliwości konfiguracyjne.

## Graf Zależności

`Konfiguracja` → `HU1 (Fundament)` → `HU2 (Ręczne Planowanie)` → `HU3 (Automatyczne Generowanie)` → `Dopracowanie`

---

## Faza 1: Konfiguracja Projektu

*Cel: Inicjalizacja struktury projektu i konfiguracja wszystkich podstawowych technologii.*

- [X] T001 Zainicjuj projekt Tauri i zintegruj frontend Next.js.
- [X] T002 Skonfiguruj Next.js do eksportu statycznego (`output: 'export'`) zgodnie z wymaganiami Tauri w `next.config.ts`.
- [X] T003 Dodaj i skonfiguruj Vitest do testowania, włączając podstawową konfigurację testów w `vitest.config.ts`.
- [X] T004 Skonfiguruj backend Rust z `tauri-plugin-sql` i skryptem migracji do utworzenia początkowego schematu bazy danych SQLite na podstawie `data-model.md`.
- [X] T005 Utwórz katalog `solver/` i podstawowy skrypt Pythona `solver/solve_schedule.py` z zależnością `google-ortools`.

---

## Faza 2: HU1 - Konfiguracja Systemu (Fundament)

*Cel: Umożliwienie menedżerowi konfiguracji pracowników i zmian.*
*Test Niezależny: Sprawdź, czy system poprawnie zapisuje i odczytuje dane konfiguracyjne za pośrednictwem interfejsu użytkownika.*

- [ ] T006 [HU1] Zaimplementuj struktury Rust w `src-tauri/src/models.rs` odpowiadające tabelom `Employee` i `Shift` z `data-model.md`.
- [ ] T007 [HU1] Zaimplementuj polecenia Tauri w `src-tauri/src/main.rs` dla `get_employees`, `add_employee`, `update_employee`, `get_shifts` i `update_shifts` zgodnie z definicją w `contracts.md`.
- [ ] T008 [P] [HU1] Utwórz stronę/komponent do zarządzania pracownikami w `src/app/settings/employees/page.tsx` do listowania, dodawania i edytowania pracowników.
- [ ] T009 [P] [HU1] Utwórz stronę/komponent do konfiguracji zmian w `src/app/settings/shifts/page.tsx` do definiowania zmian na każdy dzień tygodnia.
- [ ] T010 [P] [HU1] Utwórz współdzielony hak `useTauriQuery` w `src/lib/hooks/useTauri.ts` dla uproszczonego pobierania danych z backendu Rust.

---

## Faza 3: HU2 - Ręczne Planowanie i Walidacja

*Cel: Umożliwienie ręcznego tworzenia grafiku, zarządzania nieobecnościami i walidacji.*
*Test Niezależny: Sprawdź, czy dodanie zmiany w dniu urlopu pracownika pokazuje błąd krytyczny.*

- [ ] T011 [HU2] Zaimplementuj struktury Rust w `src-tauri/src/models.rs` dla `Absence` i `ScheduleEntry`.
- [ ] T012 [HU2] Zaimplementuj polecenia Tauri w `src-tauri/src/main.rs` dla `get_absences`, `add_absence`, `delete_absence`, `get_schedule` i `update_schedule_entry`.
- [ ] T013 [HU2] Zaimplementuj podstawową logikę walidacji (np. 11-godzinny odpoczynek, brak konfliktów z nieobecnościami) w backendzie Rust, która będzie wywoływana przez `update_schedule_entry`.
- [ ] T014 [P] [HU2] Utwórz stronę/komponent do zarządzania nieobecnościami w `src/app/settings/absences/page.tsx`.
- [ ] T015 [P] [HU2] Utwórz główny komponent siatki grafiku w `src/app/schedule/page.tsx`, umożliwiający przeciąganie i upuszczanie lub ręczne przypisywanie pracowników do zmian.

---

## Faza 4: HU3 - Automatyczne Generowanie Grafiku

*Cel: Automatyczne generowanie wersji roboczej grafiku przy użyciu lokalnych i chmurowych solverów.*
*Test Niezależny: Sprawdź, czy kliknięcie "Generuj" tworzy prawidłowy grafik bez błędów krytycznych.*

- [ ] T016 [HU3] Zaimplementuj polecenie `run_local_solver` Tauri w `src-tauri/src/main.rs`. To polecenie będzie serializować stan bazy danych (pracownicy, zmiany, nieobecności) do formatu JSON i przekazywać go do skryptu `solver/solve_schedule.py` za pośrednictwem procesu potomnego.
- [ ] T017 [HU3] Zaimplementuj główną logikę w `solver/solve_schedule.py` do odczytu danych wejściowych JSON, budowy modelu OR-Tools, rozwiązania go i wydrukowania wynikowych przypisań grafiku na standardowe wyjście.
- [ ] T018 [HU3] Zaimplementuj polecenie `run_gemini_solver` Tauri w `src-tauri/src/main.rs`. To polecenie bezpiecznie dołączy klucz API i przekaże żądanie do API Gemini.
- [ ] T019 [P] [HU3] Dodaj przyciski "Generuj (Lokalnie)" i "Generuj (Chmura)" do interfejsu użytkownika strony grafiku w `src/app/schedule/page.tsx`, które wywołują odpowiednie polecenia Tauri.
- [ ] T020 [P] [HU3] Zaimplementuj logikę interfejsu użytkownika do wyświetlania ostrzeżeń i błędów zwróconych przez polecenia solwera.

---

## Faza 5: Dopracowanie i Kwestie Ogólne

*Cel: Finalizacja aplikacji do wydania.*

- [ ] T021 Zaimplementuj funkcjonalność eksportu do PDF i CSV zgodnie z definicją w FR-008. Może to być nowe polecenie Tauri.
- [ ] T022 Przejrzyj i rozwiąż wszelkie pozostałe elementy "TODO" lub "WYMAGA WYJAŚNIENIA" z bazy kodu.
- [ ] T023 Zaktualizuj `quickstart.md` i utwórz `README.md` z ostatecznymi instrukcjami budowania i użytkowania.
- [ ] T024 Wykonaj ostateczną kompilację za pomocą `npm run tauri build` i przetestuj samodzielny plik wykonywalny dla systemu Windows.
