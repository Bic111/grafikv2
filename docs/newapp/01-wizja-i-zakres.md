# Wizja i zakres

Cel: Aplikacja do planowania i zarządzania grafikami pracy z wbudowanym wsparciem analizy, walidacji, automatycznego generowania oraz optymalizacji rozkładu godzin. System zapewnia:
- Tworzenie, podgląd, edycję i zapis grafików miesięcznych dla jednego zespołu (typowo 15–20 osób).
- Zarządzanie pracownikami, ich rolami, etatem i nieobecnościami (urlopy, zwolnienia lekarskie).
- Walidację zgodności z przepisami (odpoczynek, limity godzin, praca w niedzielę/święta, zasada po nocnej zmianie).
- Eksporty (CSV, PDF) i raporty (nadgodziny, naruszenia, podsumowania).
- Konfigurowalne parametry zmian (godziny i obsady per dzień tygodnia), limity godzin per etat, święta oraz wytyczne dla generatora.
- Import historycznych grafików z plików Excel do bazy wiedzy, używanej jako wzorce do generowania.

Zakres organizacyjny:
- Jeden zespół pracowników (15–20 osób) w jednym miejscu pracy.
- Role operacyjne w zespole (m.in. Kierownik, Z-ca kierownika, Kasjer, SSK) wpływające na obsadę (np. prowadzący zmianę).
- Grafiki miesięczne z trzema głównymi zmianami dziennie: rano, środek, popołudniu (z obsługą nocnych zakończeń).

Język i UX:
- Interfejs i komunikaty w języku polskim.
- Widoki wielomodalne: kalendarz, oś czasu, wykresy; wskaźnik postępu generowania.

Środowisko i sposób użycia:
- Aplikacja działa lokalnie na pojedynczym komputerze (brak współdzielenia danych w chmurze).
- Docelowa platforma użytkownika: Windows 11.
- Jeden użytkownik (scenariusz single-user); brak wymagań wielostanowiskowych.
- Dystrybucja: możliwość spakowania/udostępnienia jako samodzielny plik wykonywalny (.exe) dla Windows 11.
