# Research – Plan 2 WorkSchedule PL

## Decision Log

### Decision 1: Playwright jako narzędzie testów E2E dla Next.js
- **Rationale**: Playwright oferuje natywne wsparcie dla przeglądarek Chromium/Firefox/WebKit, łatwo integruje się z CI i zapewnia stabilne testy interfejsów Next.js. Umożliwia testy drag-and-drop oraz wgrywanie plików (import Excel) potrzebne w nowym UI.
- **Alternatives Considered**:
  - **Cypress** – bogaty ekosystem, lecz ogranicza się do Chromium, a licencja i koszty mogą wzrosnąć; gorzej współgra z testami wielu przeglądarek offline.
  - **Puppeteer** – dobra automatyzacja Chrome, ale wymaga budowy własnych warstw asercji i brak gotowych raportów.

### Decision 2: Docelowe metryki wydajności
- **Rationale**: Ustalono cel 5 minut dla typowego wygenerowania miesięcznego grafiku (twardy limit 10 minut zgodnie z SC-002), a także <3 sekund na załadowanie dashboardu i <1 sekundy na operacje CRUD w UI po stronie klienta. Dzięki temu użytkownik jednoosobowy sprawnie iteruje nad grafikiem i raportami.
- **Alternatives Considered**:
  - **Brak dodatkowego celu (tylko 10 minut)** – grozi odkładaniem optymalizacji i niezadowoleniem użytkownika przy większych zespołach.
  - **Agresywny limit 2 minut** – wymagałby znacznie bardziej złożonej dekompozycji problemu lub kosztownych heurystyk, co nie jest konieczne dla bieżącej skali.

### Decision 3: Najlepsze praktyki integracji OR-Tools w WorkSchedule PL
- **Rationale**: Model CP-SAT zostanie utrzymany w warstwie `backend/core/ortools_generator.py` z jasno zdefiniowanym interfejsem wejścia/wyjścia (DTO). Wymagania twarde są dekodowane z `LaborLawRule` i `StaffingRequirementTemplate`, a miękkie ograniczenia parametryzowane przez `GeneratorParameter`. Rozwiązanie wykorzysta `PartialSolutionCallback` do diagnostyki. Pozwoli to zachować modularność oraz uprościć testy.
- **Alternatives Considered**:
  - **Monolityczne łączenie heurystyk i OR-Tools** – utrudnia debugowanie, łamie zasadę modułowości.
  - **Migracja do innego solvera (np. OptaPlanner)** – brak uzasadnienia, zrywa z konstytucją (OR-Tools jako standard).
