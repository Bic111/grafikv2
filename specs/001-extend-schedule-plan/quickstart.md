# Quickstart – Plan 2 WorkSchedule PL

## Cel
Szybkie uruchomienie rozszerzonej wersji WorkSchedule PL na stanowisku jednego schedulera, wraz z importem danych i wygenerowaniem grafiku OR-Tools.

## Wymagania wstępne
- Windows 10+ z PowerShell 7
- Python 3.11 (venv w repozytorium `venv/` lub `.venv/`)
- Node.js 20 LTS + pnpm (opcjonalnie npm)
- Zainstalowane zależności `pip install -r requirements.txt` oraz `npm install` w katalogu `frontend/`
- Upewnij się, że pliki dokumentacyjne (ANALIZA_KP.md, zaktualizowany `openapi.yaml`, makiety) są aktualne

## Krok 1 – Start środowiska
```powershell
# z repo root (dla trybu rozwojowego)
./start_app.ps1
```
- Backend: Flask na `http://localhost:5000`
- Frontend: Next.js na `http://localhost:3000`

**Uwaga**: Jeśli środowisko wirtualne Python nie istnieje, utwórz je najpierw:
```powershell
cd backend
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
cd ..
```

## Krok 2 – Przygotowanie danych
1. Uruchom skrypt seedujący w osobnym terminalu:
```powershell
cd backend
./venv/Scripts/Activate.ps1
python -m backend.sample_data
```
Skrypt wypełni bazę rolami, zmianami, pracownikami, świętami, parametrami generatora i szablonami obsadowymi.

2. Sprawdź dane w UI:
   - Pracownicy: `http://localhost:3000/employees`
   - Ustawienia: `http://localhost:3000/settings` (święta, szablony obsady)
   - Grafik: `http://localhost:3000/schedule`

3. (Opcjonalnie) Dodaj własne święta przez UI lub API:
```powershell
# Przykład: dodanie święta przez API
curl -X POST http://localhost:5000/api/swieta \
  -H "Content-Type: application/json" \
  -d '{"data": "2025-05-01", "nazwa": "Święto Pracy", "store_closed": true}'
```

4. (Opcjonalnie) Wprowadź preferencje pracowników w zakładce `Pracownicy` → kliknij pracownika → rozwiń sekcję "Preferencje" → edytuj i zapisz.

## Krok 3 – Walidacja konfiguracji
- Sprawdź zakładkę `Ustawienia` (`http://localhost:3000/settings`) i upewnij się, że:
  - Święta są zdefiniowane dla bieżącego roku
  - Szablony obsadowe zawierają wymagania minimalne/docelowe/maksymalne dla każdego typu dnia (WEEKDAY/WEEKEND), zmiany i roli
- Otwórz `docs/analysis/ANALIZA_KP.md` i potwierdź, że wszystkie reguły mają odwzorowanie w systemie (model `LaborLawRule` w `backend/models.py`).
- Uruchom testy walidacyjne:
```powershell
cd backend
./venv/Scripts/Activate.ps1
python -m pytest tests/test_walidacja.py -v
```

## Krok 4 – Generowanie grafiku OR-Tools
1. Przejdź do zakładki `Grafik` (`http://localhost:3000/schedule`).
2. W panelu Generator Grafiku:
   - Wybierz rok i miesiąc (np. 2025-01)
   - Wybierz algorytm: **Heurystyczny** lub **OR-Tools**
   - Jeśli wybrałeś OR-Tools, wybierz scenariusz optymalizacji:
     - **Zbalansowany** (balansuje wszystkie cele)
     - **Minimalizuj pracę** (priorytet: niskie nadgodziny)
     - **Maksymalizuj pokrycie** (priorytet: pełna obsada)
3. Kliknij **„Generuj Grafik"**.
4. Poczekaj na wynik (oczekiwany czas: 10-300 sekund, zależnie od rozmiaru danych).
5. Po wygenerowaniu:
   - Sprawdź panel diagnostyki w prawej części ekranu
   - Przejrzyj listę naruszeń (jeśli występują)
   - Kolumna "Status" pokazuje, czy naruszenie jest BLOKUJĄCE czy OSTRZEŻENIE

**Uwaga**: Jeśli generowanie nie działa, sprawdź logi backendu w terminalu gdzie uruchomiono `start_app.ps1`.

## Krok 5 – Edycja i zapis grafiku
- Otwórz zakładkę `Grafik` (`http://localhost:3000/schedule`).
- Skoryguj przydziały klikając na komórki i wybierając zmianę z listy rozwijanej.
- Kliknij **„Zapisz"** aby utrwalić zmiany w bazie (wywołuje `PUT /api/grafiki/{id}`).
- Uruchom walidację ponownie klikając **„Waliduj"** i upewnij się, że wszystkie blokujące naruszenia zniknęły.

**Uwaga**: Interfejs kalendarza wspiera widoki miesięczne. Edycja drag-and-drop nie jest jeszcze zaimplementowana - użyj menu rozwijanego w komórce.

## Krok 6 – Raporty i eksport
- Odwiedź Dashboard (`http://localhost:3000/`) aby zobaczyć:
  - KPI: liczba pracowników, zmian, pokrycie obsady, nadgodziny
  - Alerty: wykryte problemy z poziomem severity (critical, high, medium, low)
  - Nadchodzące nieobecności
- Odwiedź zakładkę `Raporty` (`http://localhost:3000/reports`):
  - Wybierz miesiąc z rozwijanej listy
  - Kliknij **„Eksportuj CSV"** lub **„Eksportuj JSON"** aby pobrać raport
  - Raport zawiera: godziny pracy, nadgodziny, pokrycie obsady, alerty
- Bezpośredni dostęp API:
```powershell
# Raport w formacie JSON z dodatkowymi metrykami
curl "http://localhost:5000/api/raporty?month=2025-01&enhanced=true"

# Eksport CSV
curl "http://localhost:5000/api/raporty?month=2025-01&format=csv" -o raport.csv
```

## Krok 7 – Pakiet dystrybucyjny (Produkcja)
Aby przygotować aplikację do instalacji offline:

```powershell
# Uruchom tryb produkcyjny (buduje frontend i pakuje całość)
./start_app.ps1 -Production
```

Skrypt utworzy katalog `release/` zawierający:
- `backend/` - kod backendu bez plików tymczasowych
- `frontend/` - zbudowany frontend (Next.js static export lub .next build)
- `docs/` - dokumentację instalacyjną
- `start_production.ps1` - skrypt startowy dla środowiska produkcyjnego
- `README.md` - instrukcje instalacji i uruchomienia

Aby tylko zbudować bez uruchamiania:
```powershell
./start_app.ps1 -BuildOnly
```

Paczka `release/` może być skopiowana na inne stanowisko i uruchomiona zgodnie z `docs/INSTRUKCJA.md`.

## Testy końcowe
**Backend (pytest)**:
```powershell
cd backend
./venv/Scripts/Activate.ps1
python -m pytest tests/ -v --cov=backend --cov-report=html
```
Raport pokrycia zostanie wygenerowany w `backend/htmlcov/index.html`.

**Frontend (Playwright e2e)**:
```powershell
cd frontend
npm install  # jeśli nie zainstalowano wcześniej
npx playwright install  # instalacja przeglądarek (jednorazowo)
npx playwright test
```

Testy e2e pokrywają:
- Konfigurację reguł, świąt i parametrów (`tests/e2e/configure-rules.spec.ts`)
- Generowanie grafiku (oba algorytmy: heurystyczny i OR-Tools) (`tests/e2e/generate-schedule.spec.ts` - jeśli istnieje)
- Dashboard i raporty (`tests/e2e/reports-dashboard.spec.ts`)

**Manualna weryfikacja dokumentacji**:
- [ ] `docs/analysis/ANALIZA_KP.md` - kompletna analiza przepisów prawa pracy
- [ ] `specs/001-extend-schedule-plan/contracts/openapi.yaml` - aktualna specyfikacja API
- [ ] `docs/schema/work-schedule.mmd` - aktualny diagram ERD
- [ ] `docs/ui/*.md` - makiety UI (dashboard, settings, reports)
- [ ] `docs/INSTRUKCJA.md` - kompletna instrukcja instalacji offline
