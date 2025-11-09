# Grafikv2 - WorkSchedule PL

System do zarządzania grafikami pracowniczymi z automatycznym generowaniem harmonogramów przy użyciu Google OR-Tools i pełnej walidacji zgodności z prawem pracy.

## � Plan 2 - WorkSchedule PL Expansion (UKOŃCZONY ✅)

**Rozszerzenie obejmuje:**
- ✅ Kompletną dokumentację prawną (ANALIZA_KP.md)
- ✅ Przebudowę generatora grafików z wykorzystaniem OR-Tools z pełnymi ograniczeniami
- ✅ Rozbudowę UI: Dashboard z KPI, Raporty, Konfiguracja wymagań obsadowych
- ✅ Pakiet dystrybucyjny z instalacją offline
- ✅ Testy automatyczne (pytest, Playwright)

**Główne funkcje:**
- **Generator OR-Tools**: Optymalizacja grafików z zachowaniem przepisów prawa pracy (11h odpoczynek, limity godzin, święta)
- **Dashboard**: Metryki KPI (pokrycie obsady, nadgodziny, alerty), nadchodzące nieobecności
- **Raporty**: Szczegółowe raporty z eksportem CSV/JSON (godziny, nadgodziny, pokrycie, alerty)
- **Konfiguracja**: Zarządzanie świętami, szablonami obsadowymi, parametrami generatora
- **Dystrybucja**: Paczka instalacyjna offline z pełną dokumentacją

📖 **Dokumentacja Plan 2**: [specs/001-extend-schedule-plan/](specs/001-extend-schedule-plan/)

## 🚀 Szybki start

### Wymagania wstępne

1. **Python** 3.11+ (sprawdź: `python --version`)
2. **Node.js** 20 LTS (sprawdź: `node --version`)
3. **PowerShell** 7+ (Windows)

**Instalacja:**
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/
- PowerShell 7: `winget install Microsoft.PowerShell`

### Instalacja zależności

**Backend (Python):**
```powershell
cd backend
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
cd ..
```

**Frontend (Node.js):**
```powershell
cd frontend
npm install
cd ..
```

### Uruchomienie aplikacji

**Tryb rozwojowy** (backend + frontend):
```powershell
./start_app.ps1
```
- Backend Flask: `http://localhost:5000`
- Frontend Next.js: `http://localhost:3000`

**Tylko backend:**
```powershell
./start_app.ps1 -NoFrontend
```

**Tryb produkcyjny** (buduje i pakuje aplikację):
```powershell
./start_app.ps1 -Production
```
Tworzy katalog `release/` z kompletną paczką instalacyjną.

### Pierwsze uruchomienie

1. Uruchom aplikację: `./start_app.ps1`
2. Zaseeduj dane: 
   ```powershell
   cd backend
   ./venv/Scripts/Activate.ps1
   python -m backend.sample_data
   ```
3. Otwórz przeglądarkę: `http://localhost:3000`
4. Sprawdź Dashboard → Pracownicy → Grafik → Ustawienia

📖 **Szczegółowy quickstart**: [specs/001-extend-schedule-plan/quickstart.md](specs/001-extend-schedule-plan/quickstart.md)

### Build produkcyjny

**Paczka instalacyjna offline:**
```powershell
./start_app.ps1 -Production
```
Tworzy katalog `release/` zawierający:
- Backend Python z wszystkimi zależnościami
- Zbudowany frontend Next.js
- Dokumentację instalacyjną (`docs/INSTRUKCJA.md`)
- Skrypt startowy dla środowiska produkcyjnego

**Tylko build frontendu:**
```powershell
cd frontend
npm run build
```

📖 **Instrukcja instalacji offline**: [docs/INSTRUKCJA.md](docs/INSTRUKCJA.md)

### Testy

**Backend (pytest):**
```powershell
cd backend
./venv/Scripts/Activate.ps1
python -m pytest tests/ -v --cov=backend
```

**Frontend (Playwright e2e):**
```powershell
cd frontend
npx playwright install  # jednorazowo
npx playwright test
```

## 🛠️ Stack technologiczny

### Frontend
- **Framework:** [Next.js 13+](https://nextjs.org) (App Router)
- **Język:** [TypeScript](https://www.typescriptlang.org)
- **Style:** [Tailwind CSS](https://tailwindcss.com)
- **UI Library:** [React](https://react.dev)
- **Testing:** [Playwright](https://playwright.dev) (e2e)

### Backend
- **Framework:** [Flask](https://flask.palletsprojects.com)
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org)
- **Solver:** [Google OR-Tools](https://developers.google.com/optimization) (CP-SAT)
- **Baza danych:** SQLite
- **Testing:** [pytest](https://pytest.org)

### Architektura
- Aplikacja dwuwarstwowa: oddzielny backend (Flask) i frontend (Next.js)
- API-first design: RESTful API z polskimi nazwami endpointów
- Walidacja biznesowa: pełne reguły prawa pracy (Kodeks Pracy 2025)
- Optymalizacja: OR-Tools CP-SAT solver z konfigurowalnymi wagami

## 📁 Struktura projektu

```
Grafikv2/
├── backend/
│   ├── api/              # Endpointy REST API (Flask Blueprints)
│   ├── core/             # Generatory grafików (heurystyczny, OR-Tools)
│   ├── services/         # Serwisy biznesowe (konfiguracja, raporty, walidacja)
│   ├── tests/            # Testy jednostkowe (pytest)
│   ├── app.py            # Główny plik aplikacji Flask
│   ├── models.py         # Modele SQLAlchemy
│   └── database.py       # Konfiguracja bazy danych
├── frontend/
│   ├── app/              # Strony Next.js (App Router)
│   │   ├── page.tsx      # Dashboard (KPI, alerty)
│   │   ├── schedule/     # Widok grafiku
│   │   ├── employees/    # Zarządzanie pracownikami
│   │   ├── absences/     # Zarządzanie nieobecnościami
│   │   ├── settings/     # Konfiguracja (święta, szablony)
│   │   └── reports/      # Raporty i eksport
│   ├── components/       # Komponenty React
│   └── tests/            # Testy e2e (Playwright)
├── docs/
│   ├── analysis/         # Analiza przepisów prawa pracy
│   ├── schema/           # Diagramy ERD (Mermaid)
│   ├── ui/               # Makiety UI
│   └── INSTRUKCJA.md     # Instrukcja instalacji offline
├── specs/
│   └── 001-extend-schedule-plan/  # Specyfikacja Plan 2
│       ├── spec.md       # Wymagania funkcjonalne
│       ├── data-model.md # Model danych
│       ├── tasks.md      # Plan zadań
│       ├── quickstart.md # Przewodnik szybkiego startu
│       └── contracts/    # Kontrakty API (OpenAPI)
└── start_app.ps1         # Skrypt uruchomieniowy
```

## ⚙️ Konfiguracja

### Baza danych

Aplikacja używa SQLite. Baza jest tworzona automatycznie przy pierwszym uruchomieniu w lokalizacji `backend/grafik.db`.

**Migracje** (jeśli zmieniono modele):
```powershell
cd backend
./venv/Scripts/Activate.ps1
python -c "from database import init_db; init_db()"
```

### Dane testowe

Wypełnienie bazy przykładowymi danymi:
```powershell
cd backend
./venv/Scripts/Activate.ps1
python -m backend.sample_data
```

Tworzy:
- 4 role (Kierownik, Z-ca kierownika, Sprzedawca, Kasjer)
- 3 zmiany (Poranna 6-14, Popołudniowa 14-22, Nocna 22-6)
- 15 pracowników z przykładowymi danymi
- Święta na rok 2025
- Szablony obsadowe (WEEKDAY/WEEKEND)
- Parametry generatora OR-Tools
- Reguły prawa pracy (LaborLawRule)

### Konfiguracja środowiskowa

Utwórz plik `.env` w katalogu głównym (opcjonalnie):
```env
# Backend
FLASK_ENV=development
DATABASE_URL=sqlite:///backend/grafik.db

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🎯 Funkcje

### ✅ Zarządzanie danymi podstawowymi
- Pracownicy: dodawanie, edycja, role, preferencje (preferowane dni wolne, zmiany, max godzin)
- Role: kierownik, z-ca kierownika, sprzedawca, kasjer
- Zmiany: poranna, popołudniowa, nocna (konfiguracja godzin)
- Nieobecności: urlopy, L4, wnioski urlopowe

### ✅ Generowanie grafików
- **Algorytm heurystyczny**: Szybkie generowanie z podstawowymi regułami
- **OR-Tools CP-SAT**: Zaawansowana optymalizacja z pełnymi ograniczeniami prawnymi
  - Scenariusze: Zbalansowany / Minimalizuj pracę / Maksymalizuj pokrycie
  - Pełne reguły prawa pracy (11h odpoczynek, 35h przerwa tygodniowa, limity nadgodzin)
  - Uwzględnienie świąt, wymagań obsadowych, preferencji pracowników

### ✅ Walidacja grafików
- Automatyczna walidacja zgodności z przepisami Kodeksu Pracy
- Poziomy severity: BLOKUJĄCE, OSTRZEŻENIE
- Reguły: odpoczynek, limity godzin, święta, wymagania obsadowe

### ✅ Konfiguracja i ustawienia
- Święta: zarządzanie kalendarzem świąt państwowych i sklepowych
- Szablony obsadowe: minimalna/docelowa/maksymalna obsada per dzień/zmiana/rola
- Parametry generatora: wagi optymalizacji (pokrycie, równowaga, preferencje)

### ✅ Monitoring i raporty
- **Dashboard**: KPI (pracownicy, zmiany, pokrycie, nadgodziny), alerty, nieobecności
- **Raporty szczegółowe**: godziny pracy, nadgodziny, pokrycie obsady, alerty
- **Eksport**: CSV, JSON
- **Metryki jakości**: pokrycie obsady, balans godzin, przestrzeganie preferencji

### ✅ Dystrybucja
- Pakiet instalacyjny offline (`release/`)
- Dokumentacja instalacji i konfiguracji
- Skrypt startowy dla środowiska produkcyjnego

## 📝 Informacje o rozwoju

### Architektura

Projekt wykorzystuje:
- **Backend**: Flask z SQLAlchemy, OR-Tools CP-SAT solver, Blueprint API
- **Frontend**: Next.js 13+ z App Router, React Server Components, Tailwind CSS
- **Komunikacja**: RESTful API z polskimi nazwami endpointów (`/api/pracownicy`, `/api/grafiki`, etc.)
- **Wzorce**: session_scope context manager, serialize functions, optimistic UI

### Endpointy API

Główne endpointy:
- `/api/pracownicy` - zarządzanie pracownikami
- `/api/role` - zarządzanie rolami
- `/api/zmiany` - zarządzanie zmianami
- `/api/nieobecnosci` - zarządzanie nieobecnościami
- `/api/swieta` - zarządzanie świętami
- `/api/szablony-obsady` - szablony wymagań obsadowych
- `/api/grafiki/generuj` - generowanie grafików
- `/api/walidacja/grafik/{id}` - walidacja grafiku
- `/api/raporty` - raporty i eksport
- `/api/dashboard/metrics` - metryki KPI
- `/api/dashboard/absences` - nadchodzące nieobecności

📖 **Pełna specyfikacja API**: [specs/001-extend-schedule-plan/contracts/openapi.yaml](specs/001-extend-schedule-plan/contracts/openapi.yaml)

### Konwencje kodu

- **Backend**: PEP 8, type hints, docstringi
- **Frontend**: ESLint, TypeScript strict mode, functional components
- **Testy**: pytest dla backendu, Playwright dla e2e frontendu
- **Dokumentacja**: Markdown w `docs/` i `specs/`

Więcej informacji o architekturze: **[CLAUDE.md](CLAUDE.md)**

## 📚 Dokumentacja

### Plan 2 - WorkSchedule PL Expansion
- [Specyfikacja funkcjonalna](specs/001-extend-schedule-plan/spec.md)
- [Model danych](specs/001-extend-schedule-plan/data-model.md)
- [Plan zadań](specs/001-extend-schedule-plan/tasks.md)
- [Quickstart guide](specs/001-extend-schedule-plan/quickstart.md)
- [Kontrakt API (OpenAPI)](specs/001-extend-schedule-plan/contracts/openapi.yaml)

### Dokumentacja techniczna
- [Analiza przepisów prawa pracy](docs/analysis/ANALIZA_KP.md)
- [Diagram ERD](docs/schema/work-schedule.mmd)
- [Makiety UI](docs/ui/) (dashboard, settings, reports)
- [Instrukcja instalacji offline](docs/INSTRUKCJA.md)

### Dokumentacja projektu
- [Konstytucja projektu](.specify/memory/constitution.md)
- [Kontekst dla AI](.specify/memory/context.md)
- [Notatki rozwojowe](CLAUDE.md)

## 🤝 Rozwój i wkład

Aby dodać nowe funkcje:
1. Utwórz branch od `main`: `git checkout -b feature/nazwa-funkcji`
2. Zaktualizuj specyfikację w `specs/`
3. Zaimplementuj zmiany (backend → testy → frontend)
4. Uruchom testy: `pytest` + `npx playwright test`
5. Utwórz Pull Request

## 📄 Licencja

Projekt prywatny - WorkSchedule PL © 2025

## 🆘 Wsparcie

W razie problemów:
1. Sprawdź [quickstart guide](specs/001-extend-schedule-plan/quickstart.md)
2. Przejrzyj [instrukcję instalacji](docs/INSTRUKCJA.md)
3. Sprawdź logi w terminalu (backend: Flask output, frontend: npm dev)
4. Sprawdź czy wszystkie zależności są zainstalowane (`pip list`, `npm list`)

**Typowe problemy:**
- Brak venv: `python -m venv backend/venv`
- Błędy importu: `pip install -r backend/requirements.txt`
- Port zajęty: zmień w `backend/app.py` lub `frontend/package.json`
- Baza nie istnieje: uruchom `python -m backend.sample_data`