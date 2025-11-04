# Nowa aplikacja — spis treści

Poniżej znajdziesz kompletną specyfikację funkcjonalną nowej aplikacji, rozbitą na krótkie, samodzielne rozdziały. Każdy dokument opisuje wymagania i zachowanie modułu bez narzucania technologii.

## Spis treści

1. Wizja i zakres  
   ./01-wizja-i-zakres.md

2. Pracownicy i nieobecności  
   ./02-pracownicy-i-nieobecnosci.md

3. Parametry zmian i wzorce  
   ./03-parametry-zmian-i-wzorce.md

4. Limity godzin i święta  
   ./04-limity-etatow-i-swieta.md

5. Grafik: widoki, edycja, zapis i eksport  
   ./05-grafik-widoki-edycja-zapis.md

6. Generowanie grafiku z AI (proces wieloetapowy)  
   ./06-generowanie-z-wsparciem-AI.md

7. Walidacja grafiku – reguły i rezultaty  
   ./07-walidacja-reguly.md

8. Optymalizacja balansu godzin  
   ./08-optymalizacja-balansu.md

9. Ustawienia AI: wytyczne i klucz  
   ./09-ustawienia-AI-wytyczne-i-klucz.md

10. Raporty i telemetria  
    ./10-raporty.md

11. Asystent AI (analiza i sugestie)  
    ./11-asystent-AI.md

12. Import grafików Excel do bazy wiedzy (RAG)  
    ./12-import-excel-do-bazy-wiedzy.md

13. Flagi funkcji (Feature Flags)  
    ./13-flagi-funkcji.md

14. Model domeny i zasady  
    ./14-model-domeny-i-zasady.md

15. Wymagania niefunkcjonalne  
    ./15-wymagania-niefunkcjonalne.md

16. Scenariusze testowe (happy path + edge cases)  
   ./scenariusze-testowe.md

## Jak korzystać

- Zacznij od „Wizja i zakres”, aby złapać pełny obraz i granice rozwiązania.  
- Następnie przejdź przez „Pracownicy i nieobecności” oraz „Parametry zmian i wzorce”, bo te moduły są bazą danych wejściowych do grafiku.  
- „Grafik…” + „Generowanie…” + „Walidacja…” + „Optymalizacja…” opisują główny trzon działania.  
- „Raporty” i „Asystent AI” to moduły analityczno-wspierające.  
- „Import Excel…” pozwala dołączyć wiedzę historyczną.  
- „Flagi funkcji” wyjaśniają sterowanie dostępnością modułów.  
- „Model domeny…” i „Wymagania niefunkcjonalne” domykają całość.
