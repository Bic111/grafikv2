# Limity godzin i święta

## Limity godzin pracy według etatu
Dla każdego dozwolonego etatu [1.0, 0.75, 0.5, 0.25] definiowane są limity:
- Max dziennie (h).
- Max tygodniowo (h).
- Max miesięcznie (h) — twardy limit (naruszenie = błąd krytyczny).
- Max kwartalnie (h) — opcjonalny.

Wymagania funkcjonalne:
- Lista limitów z możliwością dodania/edycji/usunięcia rekordu.
- Walidacja zakresów wartości (np. 1–24 dla doby).

## Święta i dni wolne
Dane święta:
- Data (YYYY-MM-DD).
- Nazwa.
- Polityka pracy: closed | open | reduced.
- Źródło: system | import | manual.
- Typ: fixed | movable | import.
- Flaga aktywności.

Wymagania funkcjonalne:
- Dodawanie prostych wpisów (data, nazwa); edycja i usuwanie.
- Lista najbliższych (sort po dacie), filtr aktywności.
- Dane te są używane przez walidację grafiku w kontekście pracy w święta (patrz reguły walidacji).
