# Flagi funkcji (Feature Flags)

Cel: Bezpieczny rollout i sterowanie dostępnością funkcji bez zmian w kodzie.

Grupy i przykładowe flagi:
- Generowanie i wejście AI: np. włączenie nowego formatu wejściowego.
- Walidacja i auto-fix: panel walidacji, zasada nocnych zmian, automatyczne poprawki.
- Optymalizacja balansu: włączenie algorytmu i jego UI.
- Eksporty: włączenie CSV, PDF, limitów kwartalnych w eksporcie.
- Raporty: włączenie strony raportów, raportów nadgodzin, naruszeń.
- UI/UX: widoki oś czasu i wykres.

Wymagania:
- Trzymanie stanu flag po stronie klienta (lokalnie).
- Ekran ustawień flag z przełącznikami, opisami i resetem do domyślnych.
- Wpływ na widoczność/aktywność wybranych elementów UI i ścieżek działań.
