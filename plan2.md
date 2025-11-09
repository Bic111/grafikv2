# Plan 2 – Kontynuacja rozwoju WorkSchedule PL

Dokument łączy działania priorytetowe z planów `plan1.1.md` (szczegółowy OR-Tools) oraz `plan1.2.md` (fazy uzupełniające), porządkując je w cztery główne etapy prac.

---

## Faza 1 – Uzupełnienie fundamentów i dokumentacji

**Cel:** stworzyć pełny kontekst projektowy (wymagania, schematy, API, makiety), który umożliwi wdrożenie docelowego generatora.

1. **Analiza Prawa Pracy (Artefakt: `ANALIZA_KP.md`)**  
   - Zebrać wszystkie przepisy Kodeksu Pracy dotyczące czasu pracy, odpoczynków, pracy nocnej, pracy w niedziele/święta, limitów godzin, zasad po zmianie nocnej itp.  
   - Każdą regułę zapisać w formie warunku logicznego, który później zostanie odwzorowany w walidacji oraz w modelu OR-Tools.

2. **Projekt bazy danych**  
   - Rozszerzyć modele SQLAlchemy o brakujące encje: `Swieta`, `ParametryGeneratora`, `WzorceHistoryczne`.  
   - Przygotować migracje bazy lub skrypt aktualizujący istniejące schematy.  
   - Utworzyć diagram ERD (np. `docs/database_schema.png` lub `docs/schema.md` z Mermaidem) przedstawiający relacje wszystkich tabel.

3. **Aktualizacja dokumentacji API (OpenAPI)**  
   - Uzupełnić `openapi.yaml` o endpointy istniejące w kodzie, których jeszcze brakuje (m.in. `PUT /api/grafiki/{id}`, `/api/raporty`, `/api/import/excel`, `/api/swieta`, `/api/parametry-generatora`).  
   - Zdefiniować struktury odpowiedzi oraz parametry dla nowych zasobów.

4. **Makiety i UX brakujących ekranów**  
   - Przygotować proste makiety (Figma/Balsamiq) dla widoków: dashboard, raporty (UI), zarządzanie świętami, panel konfiguracji generatora (wagi, wymagania obsadowe per dzień), preferencje pracowników.  
   - Makiety dołączyć do repozytorium (np. `docs/ui/`).

---

## Faza 2 – Implementacja zaawansowanej logiki backendu (OR-Tools)

**Cel:** zastąpić heurystyczne generowanie harmonogramu pełnym modelem CP-SAT oraz rozszerzyć API o brakujące moduły.

1. **Rozbudowa CRUD API**  
   - Dokończyć endpointy dla `Swieta` i `ParametryGeneratora` (GET/POST/PUT/DELETE), wraz z walidacją danych.  
   - Zintegrować je z aktualizowanym `openapi.yaml` i dodać testy jednostkowe.

2. **Refaktoryzacja generatora**  
   - Obecną implementację przenieść do klasy `HeuristicGenerator` (dla zachowania funkcji MVP).  
   - Utworzyć nową klasę `ORToolsGenerator` w `core/generator.py` zgodnie ze szczegółowym planem technicznym (`plan1.1.md`).

3. **Model CP-SAT – działania szczegółowe**  
   - Przygotować struktury danych wejściowych: pracownicy (role, preferencje), zmiany, wymagania obsadowe per dzień, nieobecności, święta, parametry generatora, wzorce historyczne.  
   - Utworzyć zmienne decyzyjne `work[pracownik][dzień][zmiana]`.  
   - Dodać twarde ograniczenia:  
     - jedna zmiana na pracownika/dzień,  
     - wymagania obsadowe z podziałem na role,  
     - nieobecności,  
     - pełna implementacja wszystkich zasad z `ANALIZA_KP.md` (odpoczynek dobowy i tygodniowy, ograniczenia godzinowe, święta, zasada po nocnej zmianie itd.).  
   - Dodać miękkie ograniczenia: preferencje pracowników, rotacja zmian, równomierne obciążenie, wykorzystanie wzorców historycznych, priorytety biznesowe.  
   - Zaimplementować funkcję celu minimalizującą sumę kar z wagami sterowanymi w `ParametryGeneratora`.

4. **Integracja OR-Tools z API**  
   - Endpoint `POST /api/grafiki/generuj` powinien przyjmować parametr `generator_type` (heuristic/ortools) i przekierowywać do odpowiedniej implementacji.  
   - Zwracać wygenerowany grafik wraz z listą naruszeń i diagnostyką (czas działania, liczba iteracji itp.).

5. **Rozszerzenie walidacji (`services/walidacja.py`)**  
   - Uzupełnić istniejące sprawdzenia o wszystkie reguły z `ANALIZA_KP.md`.  
   - Zapewnić spójność wyników walidacji z ograniczeniami w OR-Tools (walidacja jest niezależnym bezpiecznikiem).

---

## Faza 3 – Rozbudowa interfejsu użytkownika

**Cel:** udostępnić w UI pełnię możliwości aplikacji wynikających z nowych modułów backendu.

1. **Nowe widoki**  
   - **Dashboard**: podsumowania godzin pracy, ostrzeżenia, nadchodzące nieobecności.  
   - **Raporty**: tabela + wizualizacje (Chart.js) korzystające z `/api/raporty`.  
   - **Zarządzanie świętami**: CRUD w oparciu o nowe API.

2. **Rozbudowa istniejących widoków**  
   - **Ustawienia/Generator**:  
     - formularz do edycji `ParametryGeneratora` (suwaki/wagi),  
     - edycja wymagań obsadowych per dzień tygodnia i zmianę,  
     - preferencje pracowników (dni wolne, preferowane zmiany) w formularzu pracownika.  
   - **Grafik**: wizualizacja naruszeń, tryb porównania generator heuristic vs OR-Tools, przycisk eksportu.

3. **Integracja z importem/raportami**  
   - Dodać możliwość wgrywania plików Excel z UI (formularz do `/api/import/excel`).  
   - Zapewnić eksport raportów (PDF/CSV) w oparciu o wynik API (później można rozbudować backend o generację dokumentów).

---

## Faza 4 – Finalizacja, testowanie, dystrybucja

**Cel:** dopracować jakość, przygotować aplikację do użycia przez użytkowników końcowych.

1. **Testy**  
   - Jednostkowe: ORToolsGenerator, walidacja wszystkich reguł, nowe endpointy.  
   - Integracyjne: przepływ generowania, zapisu, walidacji, importu i raportowania.  
   - Manualne/UX: przejście wszystkich ekranów, testy użyteczności.

2. **Optymalizacja i przygotowanie do dystrybucji**  
   - `npm run build` + serwowanie statyczne z backendu w trybie produkcyjnym.  
   - Rozszerzyć `start_app.ps1` o przełącznik dev/prod.  
   - Przygotować paczkę dystrybucyjną (backend + zbudowany frontend + skrypty + `requirements.txt` + `INSTRUKCJA.md`).

3. **Dalsze kroki (opcjonalnie)**  
   - Plan na wersję Electron/.exe (z planu głównego) pozostaje w backlogu; można go zrealizować po udanym wdrożeniu lokalnym.

---

## Uwagi końcowe

- Faza 1 powinna zostać zrealizowana przed implementacją OR-Tools, aby wszystkie reguły i artefakty były gotowe.  
- Fazy 2 i 3 można częściowo prowadzić równolegle (np. CRUD świąt + UI świąt).  
- Każda faza kończy się przeglądem: przegląd dokumentów (Faza 1), przegląd techniczny (Faza 2), przegląd UX (Faza 3), przegląd QA/dystrybucji (Faza 4).
