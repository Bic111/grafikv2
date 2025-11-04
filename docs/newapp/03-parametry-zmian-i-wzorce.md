# Parametry zmian i wzorce

## Parametry zmian (tydzień → dni → zmiany)
Struktura ustawień dla każdego dnia tygodnia:
- Wersja z wierszami (zalecana): lista wierszy, każdy z typem oraz zestawem zmian (rano, środek, popołudniu), gdzie każda zmiana definiuje:
  - Godzina startu (HH:MM).
  - Godzina końca (HH:MM), z obsługą przejścia przez północ (np. 22:00–02:00).
  - Liczba wymaganych osób (count).
- Co najmniej dwa wiersze są typowo używane:
  - default — główny wiersz obsady.
  - supervisor — wiersz prowadzącego zmianę (1 osoba), w tych samych godzinach.

Wymagania funkcjonalne:
- Formularz edycji parametrów zmian dla wszystkich dni tygodnia.
- Możliwość dodawania/usuwania własnych wierszy (typ custom).
- Walidacja godzin (format HH:MM) i liczby osób (liczby nieujemne).
- Zapis ustawień jako wartości domyślnych używanych przy generowaniu i wyświetlaniu grafiku.

## Wzorce grafików
Wzorzec = nazwana kopia pełnych parametrów zmian:
- Lista wzorców (nazwa).
- Dodawanie nowego wzorca na bazie aktualnych parametrów zmian.
- Edycja istniejącego wzorca.
- Usuwanie wzorca.

Uwagi:
- Wiersz typu supervisor reprezentuje wymóg "prowadzącego zmianę" i będzie oddzielnie oznaczany w widokach grafiku.
