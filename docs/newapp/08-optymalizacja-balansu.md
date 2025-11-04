# Optymalizacja balansu godzin

Cel: ograniczenie odchyleń liczby godzin per pracownik względem docelowych wartości dla ich etatów.

Wejścia:
- Aktualny grafik.
- Pracownicy z etatem (i wyliczonym celem miesięcznym).
- Parametry zmian (dla wyliczeń godzin).
- Limity per etat.
- Parametry walidacji (dla testu zmian).

Zasady działania:
- System oblicza aktualne godziny każdego pracownika w bieżącym miesiącu.
- Dzieli pracowników na grupy z nadmiarem i niedoborem godzin.
- Proponuje minimalne bezpieczne przesunięcia (przeniesienia przydziałów zmian) z nadmiaru do niedoboru:
  - Każdym ruchem testowo waliduje nową wersję grafiku.
  - Akceptuje tylko ruchy, które nie wprowadzają błędów krytycznych (lub nie zwiększają ich liczby).
- Limit liczby ruchów na pojedynczą operację (bezpieczne domyślne ograniczenie).
- Wynik:
  - Nowa propozycja grafiku.
  - Lista zastosowanych ruchów (dzień, zmiana, z → do, liczba godzin).
  - Zaktualizowane bilanse pracowników.

Interfejs:
- Przycisk uruchamiający optymalizację.
- Panel podsumowujący wynik: akcje „Zastosuj” lub „Odrzuć”.
- Przy „Zastosuj” – ponowna walidacja i podstawienie propozycji do bieżącego grafiku.
