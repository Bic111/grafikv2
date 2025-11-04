# Walidacja grafiku – reguły i rezultaty

Po każdej zmianie grafiku (generacja, edycja, optymalizacja) uruchamia się walidacja i prezentacja wyników.

Reguły (z opisem i poziomem):
- Konflikt z nieobecnością (leave_conflict) – krytyczne:
  - Jeśli pracownik ma przydział w dniu, w którym ma zatwierdzony urlop lub zwolnienie.
- Odpoczynek dobowy (rest_period) – krytyczne:
  - Minimalna przerwa między kolejnymi zmianami pracownika (konfigurowalna, domyślnie 11h).
- Limity godzin (hours_exceeded) – krytyczne:
  - Przekroczenie dziennego, tygodniowego lub miesięcznego limitu wynikającego z etatu.
- Praca w niedzielę (sunday_work) – ostrzeżenie:
  - Flaga ostrzegawcza (włączalna/wyłączalna).
- Praca w święta (holiday_work) – ostrzeżenie:
  - W zależności od polityki dnia (closed/reduced/open), z odpowiednim komunikatem.
- Zasada po nocnej zmianie (night_shift_violation) – krytyczne:
  - Jeśli zmiana kończy się między 00:00 a 06:00, następny dzień musi być wolny.

Wynik walidacji:
- Flaga ogólna zgodności (isValid).
- Lista błędów krytycznych (id, typ, pracownik, data, opis).
- Lista ostrzeżeń (analogicznie).
- Prezentacja w panelu walidacji (lista z ikonami i kolorami).
- Oznaczanie naruszeń bezpośrednio w widoku kalendarza (nazwiska z wyróżnieniem).

Konfiguracja walidacji:
- Minimalny odpoczynek dobowy (h).
- Minimalny odpoczynek tygodniowy (h).
- Sprawdzanie pracy w niedzielę: włącz/wyłącz.
- Zestaw świąt z polityką pracy (closed/open/reduced).

Uwagi dotyczące zmian z czatu AI:
- Zmiany zainicjowane przez asystenta AI (chat w widoku grafiku) uruchamiają tę samą walidację i podlegają tym samym regułom.
- Błędy krytyczne blokują zastosowanie zmian proponowanych przez AI.
