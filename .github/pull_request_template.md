# Pull Request

## Tytuł
<!-- Krótki, jednoznaczny tytuł -->

## Zakres zmian
<!-- Opisz co zostało zrobione -->
- [ ] Backend
- [ ] Frontend
- [ ] Dokumentacja
- [ ] Testy
- [ ] DevOps / Release

## Powiązane zadania (tasks.md)
Wymień ID zadań: TXXX

## Opis szczegółowy
<!-- Dlaczego zmiana jest potrzebna? Co rozwiązuje? Jaką wartość biznesową wnosi? -->

## Jak testować
1. Backend:
   ```powershell
   cd backend
   ./venv/Scripts/Activate.ps1
   python -m pytest tests/ -v
   ```
2. Frontend e2e:
   ```powershell
   cd frontend
   npx playwright install
   npx playwright test
   ```
3. Ręcznie:
   - Wejdź na /schedule i wygeneruj grafik OR-Tools
   - Sprawdź /settings (święta, szablony obsady)
   - Sprawdź /reports (raport + eksport CSV)
   - Sprawdź dashboard (/)

## Checklist przed mergem
- [ ] Brak błędów krytycznych w testach backendu
- [ ] Playwright testy przechodzą lub mają uzasadnione skipy
- [ ] Zaktualizowano README.md jeśli wymagane
- [ ] Zaktualizowano quickstart.md jeśli wymagane
- [ ] Brak pozostawionych TODO w kodzie
- [ ] Zmiany zgodne z OpenAPI (`contracts/openapi.yaml`)
- [ ] Brak wycieków sekretów / kluczy

## Potencjalne ryzyka
<!-- Wypisz znane ryzyka i plan mitigacji -->

## Kroki po mergu
- [ ] Wykonać accessibility audit (T037)
- [ ] Zaplanować zwiększenie pokrycia testowego reporter/configuration

## Zrzuty ekranu / Artefakty
<!-- Wstaw obrazki jeśli to UI feature -->

## Dodatkowe uwagi
<!-- Wszystko co istotne dla recenzenta -->
