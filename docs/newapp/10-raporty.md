# Raporty i telemetria

Zakres:
- Zakres dat wybierany przez użytkownika (od–do).
- Filtrowanie per pracownik lub „wszyscy”.

Raporty:
- Nadgodziny:
  - Per pracownik: razem godzin, limit miesięczny, nadgodziny, procent wykorzystania.
  - Eksport do CSV.
- Naruszenia zasad nocnych zmian:
  - Per pracownik: liczba naruszeń, data ostatniego naruszenia.
- Naruszenia odpoczynku:
  - Per pracownik: liczba naruszeń dobowych i tygodniowych, razem.
- Podsumowanie miesięczne:
  - Łączna liczba godzin, łączne nadgodziny, średnie wykorzystanie, udział pracowników z nadgodzinami.

Uwagi implementacyjne:
- Obliczenia na podstawie zapisanych grafików i parametrów zmian (a nie danych „losowych”).
- Wersja minimalna dopuszcza wstępnie uproszczone metryki, ale docelowo raporty wynikają bezpośrednio z grafiku i limitów.
