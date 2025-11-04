# Generowanie grafiku z AI

## Proces wieloetapowy (5 etapów z postępem)
- Etap 0 (warunek wstępny): Przygotowanie kontekstu kwartalnego – wstępny grafik na 3 miesiące + dostępności pracowników (per dzień/zmiana). Jeśli brak, użytkownik jest proszony o jego uzupełnienie przed startem generowania miesiąca.
- Etapy: Walidacja wejścia → Generowanie → Optymalizacja → Przegląd → Finalizacja.
- Wskaźnik postępu z komunikatem bieżącego etapu; aktualizacje w czasie rzeczywistym.
- Odporność: ponawianie prób przy błędach oraz ograniczenie częstotliwości wywołań.

## Wejście do generowania
- Miesiąc/rok (kontekst).
- Pracownicy (wraz z etatem, rolą, statusem).
- Parametry zmian (dni tygodnia → wiersze → zmiany z godzinami i liczbą osób).
- Nieobecności (urlopy i zwolnienia per pracownik, zakresy dat).
- Święta (daty + polityka pracy).
- Limity per etat (dzienny, tygodniowy, miesięczny, opcjonalnie kwartalny).
- Wstępny grafik 3-miesięczny (kwartał) – szkic obsad dla 3 kolejnych miesięcy.
- Dostępności pracowników (per dzień/zmiana) w horyzoncie 3 miesięcy.
- Wytyczne (lista zasad, z priorytetami).
- Cele optymalizacyjne (np. wyrównanie godzin względem celu miesięcznego i kwartalnego dla każdego etatu).

## Wyjście i integracja
- Wygenerowany grafik w strukturze dziennej ze zmianami i przydziałami.
- Sugestie optymalizacji (lista, tekstowe).
- Zapisywanie i późniejsze indeksowanie do bazy wiedzy (RAG) po zapisie grafiku.

## Interakcje użytkownika
- Panel generowania: wybór miesiąca/roku, przycisk generuj, podgląd payloadu wejściowego (do diagnostyki).
- Wskaźnik postępu dostępny przez cały czas trwania procesu.
- Komunikaty o błędach (np. brak pracowników/parametrów/klucza, błędny format wyniku).
- Jeśli brakuje wstępnego grafiku 3M lub dostępności – użytkownik otrzymuje wskazanie sekcji, którą należy najpierw uzupełnić (link do edycji 3M i dostępności).
