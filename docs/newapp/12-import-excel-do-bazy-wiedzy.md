# Import grafików Excel do bazy wiedzy (RAG)

Cel: Wczytać archiwalne grafiki w formacie Excel i przekształcić je w dokumenty tekstowe, które zasilą bazę wiedzy wykorzystywaną przy generowaniu przyszłych grafików.

Kanały importu:
- Interfejs WWW (formularz uploadu).
- Narzędzie CLI (skrypt uruchamiany z terminala).
- Endpoint API (przetwarzanie po stronie serwera).

Wymagany format pliku:
- Rozszerzenia: .xlsx lub .xls (opcjonalnie wsparcie .csv).
- Nagłówki kolumn (w pierwszym wierszu):
  - Date (1..31) – numer dnia.
  - Morning – lista nazw pracowników rozdzielona przecinkiem.
  - Afternoon – j.w.
  - Evening – j.w.
- Dozwolone: puste wartości (oznaczają brak przydziałów).
- Nazwa pliku powinna zawierać miesiąc i rok w formacie MM-YYYY (np. 10-2024.xlsx) – używane do identyfikacji dokumentu.

Walidacja błędów:
- Brak wymaganych kolumn → błąd.
- Pusty plik/arkusz → błąd.
- Brak możliwości wyodrębnienia miesiąca/roku z nazwy pliku → błąd z instrukcją zmiany nazwy.

Konwersja:
- Excel → struktura dni → tekst „RAG”:
  - Dzień X: rano[Jan Kowalski, …] popołudniu[…], wieczór[…].
- Dokument RAG:
  - Id: schedule-MM-YYYY.
  - Content: sformatowany tekst grafiku dla miesiąca/roku.
  - Metadata: źródło (nazwa pliku), month, year, liczba pozycji, data importu, typ = excel.

Zapis:
- Dokumenty są dopisywane lub nadpisywane w pliku/zbiorze bazy wiedzy.
- Po imporcie: indeksacja wektorowa dokumentów (wykonywana osobno w interfejsie indeksowania).

UI (WWW):
- Wybór pliku.
- Przyciski „Importuj”.
- Statusy: idle, loading, success, error; komunikat o imporcie (miesiąc/rok).
- Licznik zaimportowanych dokumentów (sesja).

CLI:
- Pojedynczy plik: uruchomienie z parametrem ścieżki.
- Katalog: wsadowe wczytanie wszystkich plików Excel z folderu.

Uwaga:
- Import dokumentu z tym samym MM-YYYY nadpisuje istniejący dokument o tym id.
