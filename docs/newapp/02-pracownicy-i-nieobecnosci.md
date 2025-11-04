# Pracownicy i nieobecności

## Pracownicy
Dane pracownika:
- Identyfikator.
- Imię, nazwisko.
- Stanowisko: jedno z [Kierownik, Z-ca kierownika, Kasjer, SSK].
- Status: jedno z [Aktywny, Na urlopie, Chorobowe].
- Etat (FTE): jeden z [1.0, 0.75, 0.5, 0.25].

Wymagania funkcjonalne:
- Lista pracowników (tabela): imię i nazwisko, stanowisko, status, etat, menu akcji.
- Dodawanie nowego pracownika (formularz).
- Edycja istniejącego pracownika (formularz).
- Usuwanie pracownika.
- Walidacja etatu tylko do dozwolonych wartości (1, 0.75, 0.5, 0.25).

Wymagania UX:
- Prosty formularz, walidacja długości imienia/nazwiska, wybór stanowiska i statusu z listy, wybór etatu z listy predefiniowanej.
- Potwierdzenie operacji i komunikaty o powodzeniu/błędach.

## Urlopy
Dane urlopu:
- Pracownik (odniesienie).
- Zakres dat (od–do).
- Status: domyślnie "approved".
- Powód (opcjonalnie, tekst).

Wymagania funkcjonalne:
- Dodawanie urlopu dla wskazanego pracownika i zakresu dat.
- Lista zaplanowanych urlopów (pracownik, od, do) z możliwością usunięcia.
- Blokada dodania urlopu, jeżeli dla tego pracownika istnieje w tym okresie zatwierdzone zwolnienie lekarskie (sprawdzanie nakładania się zakresów dat).

## Zwolnienia lekarskie (chorobowe)
Dane:
- Pracownik (odniesienie).
- Zakres dat (od–do).
- Status: domyślnie "approved".
- Notatki (np. numer L4).

Wymagania funkcjonalne:
- Dodawanie zwolnienia dla pracownika i zakresu dat.
- Lista zwolnień (pracownik, od, do, notatki) z możliwością usunięcia.
- Blokada dodania zwolnienia, jeśli pracownik ma zatwierdzony urlop w tym samym zakresie (sprawdzanie nakładania się dat).

Uwagi:
- Spójne sprawdzanie konfliktów (urlop ↔ zwolnienie) przy dodawaniu każdego z nich.
- Daty przechowywane i prezentowane w formacie czytelnym dla użytkownika (polskie nazwy miesięcy).
