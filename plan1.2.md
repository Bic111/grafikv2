Faza 1: Uzupełnienie Fundamentów i Dokumentacji
Cel: Stworzenie solidnych podstaw projektowych i uzupełnienie brakujących artefaktów. Poprawne wykonanie tej fazy jest kluczowe dla spójności i jakości dalszych prac.
Zadania:
Stworzenie Dokumentu Analizy Prawa Pracy:
Artefakt: Dedykowany plik ANALIZA_KP.md w repozytorium.
Treść: Szczegółowa lista wszystkich reguł Kodeksu Pracy dotyczących czasu pracy, które mają być zaimplementowane (odpoczynek dobowy/tygodniowy, limity godzin, praca w nocy, praca w niedziele i święta z uwzględnieniem dni wolnych, zasady po zmianie nocnej itp.). Każda reguła powinna być opisana w formie warunku logicznego.
Finalizacja Projektu Bazy Danych:
Rozbudowa Modeli ORM (Python/SQLAlchemy): Dodanie brakujących modeli: Swieta, ParametryGeneratora, WzorceHistoryczne.
Aktualizacja Schematu Bazy: Wygenerowanie i wykonanie migracji bazy danych, aby uwzględnić nowe tabele.
Stworzenie Diagramu ERD:
Artefakt: Plik database_schema.png lub schema.md (z kodem Mermaid).
Narzędzie: draw.io, Lucidchart lub wtyczka do VS Code.
Cel: Wizualna reprezentacja wszystkich tabel i ich relacji.
Aktualizacja Dokumentacji API (OpenAPI):
Artefakt: Aktualizacja pliku openapi.yaml.
Treść: Dodanie specyfikacji dla wszystkich brakujących endpointów:
PUT /api/grafiki/{id} (do aktualizacji grafiku po drag&drop).
GET /api/raporty/{typ} (z pełnymi parametrami).
GET, POST, PUT, DELETE dla /api/swieta i /api/parametry-generatora.
Stworzenie Makiet UI:
Artefakt: Proste makiety/wireframes dla brakujących widoków.
Narzędzie: Figma, Balsamiq lub nawet rysunki na papierze.
Zakres: Dashboard, strona z raportami (UI), widok zarządzania świętami, panel konfiguracji generatora i wymagań obsadowych per dzień.
Faza 2: Implementacja Zaawansowanej Logiki Biznesowej (Backend)
Cel: Zastąpienie tymczasowego generatora heurystycznego pełnoprawnym silnikiem OR-Tools oraz rozbudowa walidacji i logiki pomocniczej.
Zadania:
Rozbudowa CRUD API:
Implementacja pełnej logiki API (GET, POST, PUT, DELETE) dla modeli Swieta i ParametryGeneratora.
Integracja Silnika OR-Tools:
Refaktoryzacja: Zmiana nazwy istniejącego generatora na HeuristicGenerator.
Stworzenie nowej klasy ORToolsGenerator w core/generator.py.
Implementacja Modelu CP-SAT:
Definicja zmiennych decyzyjnych (work[pracownik][dzien][zmiana]).
Implementacja Twardych Ograniczeń: Stopniowe dodawanie reguł na podstawie dokumentu ANALIZA_KP.md (odpoczynek dobowy/tygodniowy, limity etatu, nieobecności, obsada).
Implementacja Miękkich Ograniczeń: Dodanie logiki dla preferencji pracowników, rotacji zmian, równomiernego obciążenia.
Integracja Wzorców Historycznych: Wykorzystanie danych z tabeli WzorceHistoryczne jako dodatkowych "miękkich" ograniczeń.
Implementacja Funkcji Celu: Stworzenie funkcji celu minimalizującej sumę kar za złamanie miękkich ograniczeń, z wagami pobieranymi z tabeli ParametryGeneratora.
Aktualizacja Endpointu API: Modyfikacja endpointu /api/grafiki/generuj, aby przyjmował parametr generator_type (heuristic lub ortools) i odpowiednio wywoływał właściwą klasę.
Rozbudowa Modułu Walidacji (services/walidacja.py):
Uzupełnienie logiki walidacji o wszystkie reguły z dokumentu ANALIZA_KP.md, które nie zostały jeszcze zaimplementowane. Walidacja musi być w 100% zgodna z analizą.
Faza 3: Rozbudowa Interfejsu Użytkownika (Frontend)
Cel: Stworzenie brakujących widoków i komponentów, aby użytkownik miał dostęp do pełnej funkcjonalności aplikacji.
Zadania:
Implementacja Brakujących Widoków:
Dashboard: Stworzenie strony głównej z kluczowymi widgetami (np. podsumowanie godzin, lista nadchodzących nieobecności, alerty o naruszeniach w obecnym grafiku).
Strona Raportów (UI): Implementacja widoku, który będzie pobierał i wizualizował dane z /api/raporty w formie tabel i prostych wykresów (np. Chart.js).
Strona Zarządzania Świętami: Prosty interfejs CRUD do dodawania i edycji świąt w kalendarzu.
Rozbudowa Istniejących Widoków:
Panel Ustawień / Konfiguracji:
Dodanie interfejsu do zarządzania ParametramiGeneratora (np. suwaki do ustawiania wag dla OR-Tools).
Stworzenie zaawansowanego komponentu do edycji wymagań obsadowych per dzień tygodnia dla każdej zmiany i roli.
Formularz Pracownika: Dodanie pól do definiowania preferencji (np. wybór preferowanych dni wolnych, preferowanych zmian).
Faza 4: Finalizacja, Testowanie i Wdrożenie Lokalne
Cel: Zapewnienie jakości, stabilności i przygotowanie aplikacji do łatwego uruchomienia przez użytkownika końcowego.
Zadania:
Rozbudowa Testów:
Testy Jednostkowe (pytest): Dodanie testów dla nowej, kompleksowej logiki walidacji oraz dla kluczowych ograniczeń w ORToolsGenerator.
Testy Integracyjne: Stworzenie testów dla całego przepływu: od wywołania API generującego grafik, przez jego zapis, po walidację.
Testy Manualne (UX): Przejście przez wszystkie funkcjonalności aplikacji z perspektywy użytkownika, weryfikacja intuicyjności i spójności interfejsu.
Optymalizacja i Przygotowanie do Dystrybucji:
Build Frontendu: Uruchomienie npm run build w projekcie Next.js w celu stworzenia zoptymalizowanej, statycznej wersji aplikacji.
Serwowanie Statyczne: Skonfigurowanie backendu Flask/FastAPI tak, aby w trybie "produkcyjnym" serwował pliki z katalogu build frontendu.
Aktualizacja Skryptu start_app.ps1: Dodanie logiki rozróżniającej tryb deweloperski (uruchamia serwer next dev) od produkcyjnego (uruchamia tylko backend, który serwuje zbudowany frontend).
Stworzenie Pakietu Dystrybucyjnego:
Przygotowanie katalogu zawierającego backend Pythona, zbudowany frontend, skrypt start_app.ps1 oraz plik requirements.txt.
Stworzenie prostej instrukcji (INSTRUKCJA.md) dla użytkownika, wyjaśniającej, jak zainstalować zależności (Python, Node.js - jeśli potrzebny) i uruchomić aplikację.
Proponowana Kolejność Działań:
Faza 1: Rozpocznij od uzupełnienia dokumentacji (Analiza KP, ERD, OpenAPI). To uporządkuje dalszą pracę.
Faza 2 (Backend): Zaimplementuj brakujące modele i CRUD API, a następnie skup się na kluczowym zadaniu – integracji OR-Tools. Równolegle rozbudowuj moduł walidacji.
Faza 3 (Frontend): Po ukończeniu backendu, zaimplementuj brakujące widoki UI, które będą korzystać z nowych endpointów.
Faza 4: Na końcu skup się na testach, optymalizacji i przygotowaniu finalnego pakietu do uruchomienia.