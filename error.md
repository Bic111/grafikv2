# PHASE 9 – błędy implementacji

- [`LimitForm.tsx`](frontend/components/employees/forms/LimitForm.tsx:32) oraz [`LimitForm.tsx`](frontend/components/employees/forms/LimitForm.tsx:139) używają klucza `max_miesiecznie` zamiast `max_miesięcznie`, przez co formularz nie wypełnia pola „Max miesiąc” przy edycji i wysyła błędny payload do API.
- [`RegulyTab.tsx`](frontend/components/employees/RegulyTab.tsx:176) oraz [`RegulyTab.tsx`](frontend/components/employees/RegulyTab.tsx:333) mieszają klucze `max_miesięcznie` i `max_miesiecznie`, co powoduje wyświetlanie wartości `—` w kolumnie „Max miesiąc (h)” po zapisaniu limitu oraz niespójne sortowanie tej kolumny.
- W pliku [`schemas.ts`](frontend/lib/validation/schemas.ts) w schemacie walidacji dla limitów godzinowych, klucz `max_miesiecznie` jest używany zamiast `max_miesięcznie`, co powoduje problemy z walidacją i wyświetlaniem danych.

## Błędy sieciowe

### Error Type
Console NetworkError

### Error Message
Network connection failed

    at fetchWithTimeout (services/api/client.ts:34:13)
    at async HolidayAPI.get (services/api/client.ts:57:22)
    at async loadHolidays (components/employees/SwietaTab.tsx:52:20)

### Code Frame
  32 |     }
  33 |     if (error instanceof TypeError) {
> 34 |       throw new NetworkError('Network connection failed');
     |             ^
  35 |     }
  36 |     throw error;
  37 |   } finally {

Next.js version: 16.0.1 (Turbopack)

### Error Type
Console NetworkError

### Error Message
Network connection failed

    at fetchWithTimeout (services/api/client.ts:34:13)
    at async RuleAPI.get (services/api/client.ts:57:22)
    at async loadData (components/employees/RegulyTab.tsx:82:39)

### Code Frame
  32 |     }
  33 |     if (error instanceof TypeError) {
> 34 |       throw new NetworkError('Network connection failed');
     |             ^
  35 |     }
  36 |     throw error;
  37 |   } finally {

Next.js version: 16.0.1 (Turbopack)

## Błędy walidacji schematu "employees.tabs.ruleForm"

- Przy edycji pracownika nie można zapisać zmian "Proszę wybrać prawidłowy etat"
- Przy dodawaniu urlopu dodaje też to samo w zwolnienia a to zupełnie inne kategorie
- Parametry zmian > zapis nie może być blokowany z powodu niewypełnienia wszystkich zmian, błąd może wyskakiwać jedynie jeżeli w jednej zmianie nie uzupełnię wszystkich pól
- Nie można zapisać wypełnionych parametrów zmian
- Święta i reguły to samo

## Zmiany w strukturze zakładek

- Zakładki "Parametry zmian" i "Reguły" zostaną przeniesione z sekcji "Pracownicy" do sekcji "Ustawienia".
- Zakładka "Święta" w sekcji "Pracownicy" zostanie usunięta. Istniejąca zakładka "Święta i dni specjalne" w "Ustawieniach" pozostaje.
- Zakładki "Wymagania obsadowe", "Role", "Zmiany" w sekcji "Ustawienia" zostaną usunięte.