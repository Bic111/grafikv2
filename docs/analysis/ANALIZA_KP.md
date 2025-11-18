# Analiza Prawna - Kodeks Pracy dla WorkSchedule PL

**Wersja**: 1.0  
**Data**: 2025-11-09  
**Autor**: System AI

## Cel dokumentu

Dokument ten stanowi kompendium zasad polskiego Kodeksu Pracy, które muszą być zaimplementowane i walidowane w systemie WorkSchedule PL. Każda reguła jest mapowana na konkretne byty w modelu danych (`data-model.md`) i będzie egzekwowana przez generator grafików OR-Tools oraz silnik walidacyjny.

## Kluczowe obszary regulacyjne

### 1. Czas Pracy
- **Norma dobowa**: 8 godzin.
- **Norma tygodniowa**: Przeciętnie 40 godzin w pięciodniowym tygodniu pracy w przyjętym okresie rozliczeniowym.
- **Okres rozliczeniowy**: Domyślnie 1 miesiąc (z możliwością konfiguracji do 4 miesięcy).

### 2. Odpoczynek
- **Odpoczynek dobowy**: Minimum 11 godzin nieprzerwanego odpoczynku w każdej dobie.
- **Odpoczynek tygodniowy**: Minimum 35 godzin nieprzerwanego odpoczynku w każdym tygodniu, obejmującego co najmniej 11 godzin odpoczynku dobowego.

### 3. Praca w Niedziele i Święta
- **Zasada**: Praca w niedziele i święta jest dozwolona w przypadkach określonych w Kodeksie Pracy (np. handel).
- **Rekompensata**: Pracownikowi wykonującemu pracę w niedzielę lub święto, pracodawca jest obowiązany zapewnić inny dzień wolny od pracy.
- **Ograniczenia**: Co najmniej jedna niedziela w ciągu 4 tygodni powinna być wolna od pracy.

### 4. Praca w Porze Nocnej
- **Definicja**: 8 godzin między 21:00 a 7:00.
- **Limit**: Czas pracy pracującego w nocy nie może przekraczać 8 godzin na dobę, jeżeli wykonuje prace szczególnie niebezpieczne albo związane z dużym wysiłkiem fizycznym lub umysłowym.

### 5. Godziny Nadliczbowe
- **Limit dobowy**: Liczba godzin nadliczbowych nie może przekroczyć dla poszczególnego pracownika 150 godzin w roku kalendarzowym.
- **Limit tygodniowy**: Łączny tygodniowy czas pracy wraz z godzinami nadliczbowymi nie może przekraczać przeciętnie 48 godzin w przyjętym okresie rozliczeniowym.

## Mapowanie na model danych

| Zasada KP | Encja w `data-model.md` | Parametry | Egzekwowanie |
|---|---|---|---|
| Odpoczynek dobowy | `LaborLawRule` (kod: `REST_DAILY`) | `{ "min_hours": 11 }` | Generator OR-Tools, Walidacja (BLOCKING) |
| Odpoczynek tygodniowy | `LaborLawRule` (kod: `REST_WEEKLY`) | `{ "min_hours": 35 }` | Generator OR-Tools, Walidacja (BLOCKING) |
| Limit 48h/tydzień | `LaborLawRule` (kod: `HOURS_WEEKLY_MAX`) | `{ "max_hours": 48 }` | Generator OR-Tools, Walidacja (BLOCKING) |
| Wolna niedziela | `LaborLawRule` (kod: `SUNDAY_FREE_IN_4W`) | `{ "weeks": 4, "count": 1 }` | Generator OR-Tools, Walidacja (WARNING) |
| Praca w święta | `Holiday` (flaga `StoreClosed`) | - | Generator (nie planuje pracy), Walidacja |

*Tabela będzie rozbudowywana w miarę implementacji kolejnych, bardziej szczegółowych reguł.*
