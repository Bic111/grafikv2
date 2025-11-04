# Asystent AI (analiza i sugestie)

Cel:
- Użytkownik wpisuje polecenia/założenia (np. „Sprawdź zgodność z odpoczynkiem tygodniowym”, „Zaproponuj wzmocnienie obsady w weekendy”).
- System zwraca:
  - Sugestie optymalizacji (lista punktów).
  - Alerty zgodności (lista punktów).

Wejścia:
- Dane pracowników (id, imię i nazwisko, rola, status, etat).
- Parametry zmian.
- Opcjonalnie: bieżący grafik (np. w formacie JSON).
- Dostępności pracowników (per dzień/zmiana) w horyzoncie 3 miesięcy.
- Wstępny plan 3-miesięczny (szkic grafiku na kwartał) – jeśli dostępny.
- Tekst założeń (pole textarea).
- Klucz API (jeśli wymagany do wywołań).

Wyjście:
- Sekcja „Sugestie optymalizacji” (lista).
- Sekcja „Alerty zgodności” (lista).
- Sekcja „Błąd” w przypadku problemów.

Interfejs:
- Formularz z polem tekstowym i przyciskiem uruchamiającym.
- Opcje zaawansowane (klucz API).
- Wskaźniki ładowania i komunikaty o błędach.

## Tryb osadzony w widoku grafiku (chat bubble)
- Chat dostępny bezpośrednio na ekranie grafiku (dymek/panel), z pełnym kontekstem bieżącego miesiąca.
- Uprawnienia:
  - Proponowanie i aplikacja zmian w grafiku (po potwierdzeniu przez użytkownika).
  - Wysyłanie poleceń do generatora/optimizera (np. przeliczenia wybranych dni/zakresów).
- Bezpieczeństwo i walidacja:
  - Wszystkie zmiany wywołane z czatu przechodzą tę samą walidację, co edycje ręczne.
  - Błędy krytyczne blokują zastosowanie zmian; ostrzeżenia są sygnalizowane użytkownikowi.
