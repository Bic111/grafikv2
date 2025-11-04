# Grafik: widoki, edycja, zapis i eksport

## Przegląd
Grafik miesięczny (miesiąc/rok) składa się z dni 1..N, dla każdego dnia:
- Zmiany: rano, środek, popołudniu (z obsługą nocnych zakończeń).
- Każda zmiana może mieć przydzielonych pracowników:
  - Widok per wiersz (rowId) — dla wielowierszowej definicji zmian (oznaczenia kolorami).
  - Prowadzący zmianę jest wizualnie wyróżniony (na podstawie stanowiska).

## Widoki
- Kalendarz: siatka 7×(4–6 tygodni), nagłówki dni (Pn–Nd), sobota/niedziela wyróżnione, legenda kolorów zmian.
- Oś czasu: pracownik × dni, z naniesionymi zmianami i czasami (dla eksportów).
- Wykres (statystyki per pracownik): sumy godzin, limity, procenty wykorzystania.

### Asystent AI w widoku grafiku (chat)
- Stały dymek/ikona czatu dostępna w prawym dolnym rogu widoku grafiku (lub jako panel boczny).
- Komunikacja w języku naturalnym, z kontekstem: bieżący miesiąc, pracownicy, parametry zmian, nieobecności, dostępności oraz (jeśli dostępny) wstępny plan 3M.
- Możliwości:
  - Propozycje zmian i bezpośrednie edycje bieżącego grafiku przez AI (po akceptacji użytkownika).
  - Emisja poleceń do generatora/optimizera (np. „wyrównaj godziny w weekendy”).
- Każda zmiana dokonana z czatu podlega standardowej walidacji (błędy krytyczne blokują zastosowanie).
- Historia rozmowy i log zastosowanych zmian dostępne w ramach panelu czatu.

Przełączanie widoków odbywa się w obrębie zakładek.

## Edycja
- Wstępny grafik 3-miesięczny i dostępności:
  - Osobny tryb edycji szkicu na 3 miesiące (kolejne miesiące), służący do przygotowania kontekstu do generowania.
  - Rejestrowanie dostępności pracowników per dzień/zmiana (dostępny/niedostępny/preferowany).
  - Dane te są wykorzystywane przez generator do lepszego rozkładu godzin w skali kwartału.
- Edycja pojedynczego dnia w oknie modalnym:
  - Zmiany: rano, środek, popołudniu.
  - Lista pracowników (checkboxy) dla każdej zmiany.
  - Zapis zmian tylko lokalnie (w kontekście bieżącego grafiku) do momentu zapisu całego grafiku.

## Zapis/ładowanie/oczyszczanie
- Wczytywanie zapisanego grafiku (dla bieżącego miesiąca/roku).
- Zapis aktualnego grafiku (z datą utworzenia/aktualizacji).
- Czyszczenie grafiku (usunięcie wersji zapisanej) wymaga potwierdzenia.
- Po zapisie możliwe uruchomienie asynchronicznego indeksowania do bazy wiedzy (RAG) na potrzeby wyszukiwania wzorców.

## Eksporty
- CSV:
  - Widok kalendarza: kolumny m.in. Data, Dzień tygodnia, Zmiana, Pracownik, Czas start, Czas koniec, Liczba godzin, Prowadzący.
  - Oś czasu: per pracownik zbiorczo: "Dzień X Zmiana" i "Dzień X Godziny", sumy, dni pracy, średnia.
  - Wykres: per pracownik statystyki (razem godzin, limity tyg./mies./kw., różnica, procent wykorzystania, nadgodziny, dni pracy, średnia).
- PDF:
  - Eksport bieżącego widoku (kalendarz/oś/tabela) z tytułem (miesiąc/rok).
  - Sekcja "Limity godzin pracy" (jeśli zdefiniowane) – czytelny wykaz.

Uwagi:
- Dni spoza bieżącego miesiąca w siatce kalendarza są puste.
- Jeśli wygenerowany/zapisany grafik dotyczy innego miesiąca niż aktualnie przeglądany, wyświetla się komunikat z informacją i prośbą o przełączenie miesiąca.
