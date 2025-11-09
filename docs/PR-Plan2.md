# PR: Plan 2 – WorkSchedule PL Expansion

Branch: `001-extend-schedule-plan`

## Zakres zmian
- US2: Konfiguracja reguł, świąt, szablonów obsadowych (T021–T026)
- US3: Dashboard, raporty, eksport, paczka produkcyjna, instrukcja instalacji (T027–T033)
- Polish: Quickstart, README, QA report (T034–T036)

## Najważniejsze pliki
- Backend: `backend/api/holidays.py`, `backend/api/reporting.py`, `backend/services/reporter.py`
- Frontend: `frontend/app/page.tsx`, `frontend/app/reports/page.tsx`, `frontend/app/settings/page.tsx`
- Tests: `frontend/tests/e2e/reports-dashboard.spec.ts`, `backend/tests/test_ortools_generator.py`
- DevOps: `start_app.ps1`, `docs/INSTRUKCJA.md`, `docs/QA-report.md`

## Jak testować
1. Uruchom aplikację: `./start_app.ps1`
2. Zaseeduj dane: `python -m backend.sample_data`
3. Dashboard: `/` → sprawdź KPI, alerty, absencje
4. Raporty: `/reports` → filtr miesiąca, eksport CSV/JSON
5. Ustawienia: `/settings` → CRUD świąt, szablony obsadowe
6. Testy: `pytest` + `npx playwright install && npx playwright test`

## Status testów
- Backend: 7/8 PASS (1 test do doprecyzowania – akceptacja warnings)
- Frontend: testy zdefiniowane, wymagają `npx playwright install`

## Ryzyka i mitigacje
- Brak zainstalowanych przeglądarek Playwright → instalacja jednorazowa
- Heurystyczny generator może generować warnings → test aktualizowany w kolejnej iteracji

## Co po mergu
- Wykonać T037: accessibility audit
- Zwiększyć pokrycie testowe `reporter.py`, `configuration.py`
