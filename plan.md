Projekt: WorkSchedule PL Lokalnie

Cel: Lokalna aplikacja webowa do planowania i zarządzania grafikami pracy z wbudowanym wsparciem analizy, walidacji, automatycznego generowania oraz optymalizacji rozkładu godzin, uruchamiana przez PowerShell na Windows 11.

Architektura:

Front-end (UI): Next.js (TypeScript) - uruchamiany w lokalnej przeglądarce.

Back-end (Logika biznesowa, Silnik Generujący, API): Python (Flask lub FastAPI).

Baza Danych: SQLite (plikowa, zarządzana przez backend Pythona).

Silnik Optymalizacyjny: Google OR-Tools.

Uruchamianie: Skrypty PowerShell.

Faza 1: Planowanie i Projektowanie (Krytyczne dla Sukcesu)

1.1. Analiza Wymagań Biznesowych i Prawnych:

Dokładne rozpisanie Kodeksu Pracy: Stworzenie szczegółowej listy wszystkich artykułów KP dotyczących czasu pracy, odpoczynków (dobowy 11h, tygodniowy 35h), limitów godzinowych (dzienne, tygodniowe, miesięczne, roczne), pracy w nocy, w niedziele i święta, zasady po nocnej zmianie.

Zdefiniowanie Reguł Biznesowych:

Role Operacyjne: Lista ról (Kierownik, Z-ca, Kasjer, SSK itp.) i ich specyficzne wymagania.

Definicje Zmian: Godziny rozpoczęcia/zakończenia dla zmian: rano, środek, popołudnie (w tym nocne zakończenia po północy).

Wymagania Obsadowe: Minimalna i maksymalna liczba pracowników dla każdej roli na każdej zmianie, w zależności od dnia tygodnia.

Preferencje Pracowników: Dni wolne, preferowane zmiany, preferencje rotacji.

Wytyczne Generatora: Np. maksymalnie 2 zmiany nocne pod rząd, preferowany dzień wolny po nocnej zmianie, równomierne rozkładanie obciążenia, minimalna liczba dni wolnych pod rząd.

Definicja Nieobecności: Rodzaje (Urlop wypoczynkowy, L4, na żądanie, inne usprawiedliwione) i ich wpływ na grafik.

1.2. Projekt Bazy Danych (SQLite):

Diagram ERD (Entity-Relationship Diagram): Wizualny model wszystkich tabel i ich relacji.

Definicja Tabel:

Pracownicy: id, imie, nazwisko, rola_id, etat (np. "pelny", "pol"), limit_godzin_miesieczny (domyślny), preferencje (JSON), data_zatrudnienia.

Role: id, nazwa_roli (np. "Kierownik"), minimalna_obsada, maksymalna_obsada (per zmiana/dzien - może być w osobnym widoku).

ZmianyDefinicje: id, nazwa_zmiany (np. "Rano"), godzina_rozpoczecia, godzina_zakonczenia (z uwzględnieniem przejścia przez północ), wymagana_obsada (JSON: {"rola_id": {"min": X, "max": Y}} per dzień tygodnia).

GrafikMiesieczny: id, miesiac_rok, status (np. "roboczy", "zatwierdzony"), data_utworzenia.

GrafikEntry: id, grafik_miesieczny_id, pracownik_id, data, zmiana_id.

Nieobecnosci: id, pracownik_id, typ_nieobecnosci, data_od, data_do.

Swieta: id, data_swieta, nazwa_swieta.

ParametryGeneratora: id, nazwa_parametru, wartosc (np. max_zmian_nocnych_pod_rzad: 2).

WzorceHistoryczne: id, nazwa_wzorca, dane_grafiku (JSON).

Klucze i Indeksy: Zdefiniowanie kluczy głównych i obcych, indeksów dla optymalizacji zapytań.

1.3. Projekt API Backendu (RESTful):

Dokumentacja OpenAPI/Swagger: Precyzyjna specyfikacja wszystkich endpointów, metod HTTP, formatów danych (request/response JSON) i kodów odpowiedzi.

Główne Grupy Endpointów:

pracownicy: GET (wszyscy/jeden), POST, PUT, DELETE.

role: GET, POST, PUT, DELETE.

zmiany-definicje: GET, POST, PUT, DELETE.

nieobecnosci: GET, POST, PUT, DELETE.

swieta: GET, POST (dodaj nowe święto).

grafiki: GET (miesiąc), POST (zapisz), PUT (aktualizuj).

grafiki/generuj: POST (inicjuj generowanie, przyjmuje parametry), zwraca wygenerowany grafik i listę naruszeń.

raporty: GET (nadgodziny, naruszenia, podsumowania).

import/excel: POST (przesyła plik Excel, zwraca status importu).

parametry-generatora: GET, PUT.

1.4. Projekt Interfejsu Użytkownika (UI/UX - Makiety):

Szkice/Wireframes/Makiety: Dla każdego kluczowego widoku:

Dashboard: Podsumowanie miesiąca, status grafiku, szybkie alerty.

Zarządzanie Pracownikami: Tabela z danymi, formularz dodawania/edycji.

Konfiguracja Ról/Zmian: Formularze do definicji, tabelaryczne widoki wymagań obsadowych.

Widok Grafiku Miesięcznego (Kalendarz): Główny widok, przeciągnij-i-upuść przypisywanie/zmiana, kolorowanie zmian, wizualne alerty naruszeń.

Widok Grafiku (Oś Czasu/Tygodniowy): Wizualizacja odpoczynków, rotacji.

Ekran Generowania Grafiku: Formularz z parametrami (suwaki wag, checkbox "użyj wzorca"), przycisk "Generuj", wskaźnik postępu, logi z działania generatora.

Raporty: Filtry, tabele wyników, opcje eksportu.

Ustawienia: Ogólne parametry aplikacji, zarządzanie świętami.

Polski Język: Wszystkie etykiety, komunikaty, przyciski w języku polskim.

Responsywność: Aplikacja ma działać lokalnie, ale dobre praktyki UI/UX są zawsze wskazane.

Faza 2: Konfiguracja Środowiska i Podstawowa Implementacja

2.1. Konfiguracja Środowiska Deweloperskiego:

Instalacja Python 3.10+: Z venv.

Instalacja Node.js LTS (wraz z npm):

Instalacja VS Code: Z rozszerzeniami Python, TypeScript, React, ESLint, Prettier.

Git: System kontroli wersji (repozytorium lokalne).

2.2. Inicjalizacja Projektów:

Back-end (Python):

code
Bash
download
content_copy
expand_less
mkdir work_schedule_app
cd work_schedule_app
mkdir backend
cd backend
python -m venv venv
.\venv\Scripts\activate # Windows
pip install Flask SQLAlchemy Flask-CORS python-dotenv ortools pandas openpyxl reportlab
# lub FastAPI:
# pip install fastapi uvicorn "SQLAlchemy[asyncio]" "aiosqlite[asyncio]"

Front-end (Next.js):

code
Bash
download
content_copy
expand_less
cd ..
npx create-next-app@latest frontend --typescript --eslint --tailwind # Next.js 13+ z App Routerem i Tailwind CSS (opcjonalnie, dla szybkiego stylizowania)
cd frontend
npm install axios # Do komunikacji z API

2.3. Podstawowy Back-end (API i DB):

Struktura Katalogów: Zgodnie z planem (backend/, api/, services/, core/).

Konfiguracja Flask/FastAPI: Podstawowy plik app.py z uruchamianiem serwera, konfiguracją CORS (dla komunikacji z front-endem na innym porcie).

Moduł Bazy Danych (database.py):

Połączenie z SQLite (work_schedule.db).

Definicje modeli SQLAlchemy dla wszystkich tabel.

Funkcja create_db_tables().

Podstawowe Endpoints API: CRUD dla Pracowników i Ról – do testowania komunikacji.

2.4. Podstawowy Front-end (Next.js):

Konfiguracja Tailwind CSS (jeśli wybrano): Zgodnie z dokumentacją Next.js.

Layout (App Router): Stworzenie podstawowego layoutu z nagłówkiem, paskiem nawigacyjnym (sidebar) i główną treścią (app/layout.tsx).

Strony (App Router): Stworzenie pustych stron dla dashboard, pracownicy, grafik, raporty, ustawienia (app/dashboard/page.tsx itp.).

Moduł API (services/api.ts): Podstawowa konfiguracja Axios i funkcje do wywoływania endpointów /api/pracownicy i /api/role.

Pierwszy Widok: Prosty widok Pracowników z tabelą i formularzem (zasilany danymi z API Pythona).

Faza 3: Implementacja Kluczowych Modułów

3.1. Rozbudowa Backendu (Python):

Pełny CRUD dla Danych Podstawowych: Implementacja wszystkich endpointów API dla ZmianDefinicje, Nieobecności, Święta, ParametryGeneratora.

Moduł Walidacji (services/walidacja.py):

Implementacja funkcji sprawdzających zgodność grafiku z przepisami (11h/35h odpoczynku, limity godzinowe, praca w nocy/święta, po nocnej zmianie).

Zwracanie listy obiektów Naruszenie (typ, opis, pracownik_id, data).

Moduł Importu Excela (services/excel_importer.py):

Funkcja przyjmująca plik Excel, parsowanie danych o grafikach, zapisywanie do tabeli WzorceHistoryczne.

Moduł Raportów: Funkcje obliczające nadgodziny, sumy godzin, statystyki naruszeń.

Moduł Silnika Generującego (core/generator.py): Najważniejszy i najbardziej złożony etap.

Modelowanie Danych: Przełożenie Pracowników, ZmianDefinicje, WymagańObsadowych, Nieobecności, Świąt na obiekty/zmienne dla Google OR-Tools.

Zmienne Decyzyjne: Np. x[pracownik_id][data][zmiana_id] (boolean: czy pracownik pracuje na danej zmianie w danym dniu).

Ograniczenia (Constraints):

Prawne: Wszystkie reguły z KP (odpoczynki, limity, nocna/święta) – bezwzględne.

Biznesowe: Wymagana obsada dla ról, jeden pracownik może być na jednej zmianie.

Miękkie (Preferencje/Wytyczne): Preferencje pracowników, wytyczne generatora (np. rotacja zmian, liczba nocnych zmian pod rząd) – mogą mieć "wagi".

Funkcja Celu (Objective Function): Suma wag naruszonych "miękkich" ograniczeń (minimalizacja), lub równomierne rozłożenie pracy, minimalizacja nadgodzin.

Integracja z WzorceHistoryczne: Wykorzystanie wzorców jako "miękkich" sugestii lub punktu startowego dla generatora.

Wywołanie Solvera CP-SAT: Konfiguracja i uruchomienie OR-Tools.

Przetwarzanie Wyników: Parsowanie rozwiązania z OR-Tools do formatu GrafikEntry.

3.2. Rozbudowa Front-endu (Next.js):

Zarządzanie Pracownikami: Pełna strona z tabelą pracowników, formularzami dodawania/edycji, walidacją pól.

Zarządzanie Rolami i Zmianami: Strony do definicji ról i zmian, z możliwością ustawiania obsady dla każdej roli na zmianie (wygodny interfejs matrycowy).

Zarządzanie Nieobecnościami i Świętami: Kalendarzowy interfejs do zaznaczania urlopów/L4, lista świąt.

Główny Widok Grafiku (Kalendarz Miesięczny):

Wyświetlanie danych z GrafikEntry.

Interaktywne elementy: przeciąganie/upuszczanie zmian, klikanie do edycji.

Wizualizacja Naruszeń: Kolorowe oznaczenia, tooltipy z opisem naruszeń (dane z API walidacji).

Przyciski: "Generuj Grafik", "Zapisz", "Eksport (PDF/CSV)".

Ekran Generowania Grafiku:

Formularz z suwakami wag dla optymalizacji (zgodność z przepisami, równoważenie obciążenia, minimalizacja nadgodzin, uwzględnianie preferencji).

Checkbox "Użyj wzorca z Excela".

Wskaźnik postępu (wizualny pasek postępu), obszar na logi z działania generatora.

Strony Raportów:

Wyświetlanie raportów (nadgodziny, naruszenia, podsumowania godzin) pobranych z API backendu.

Opcje filtrowania i eksportu.

Eksport do PDF/CSV: Implementacja pobierania wygenerowanych raportów/grafików z API backendu (które generuje je np. za pomocą reportlab w Pythonie).

Faza 4: Uruchamianie, Testowanie i Dystrybucja Lokalna

4.1. Skrypty Uruchamiające PowerShell:

start_app.ps1:

Upewnij się, że Python i Node.js są zainstalowane i dostępne w PATH użytkownika (lub dodaj je dynamicznie w skrypcie).

Uruchamia backend Pythona w tle (uvicorn app:app --host 127.0.0.1 --port 5000 dla FastAPI lub python -m flask run --port 5000 dla Flask).

Czeka na uruchomienie backendu (np. przez próbę połączenia z portem).

Uruchamia serwer deweloperski Next.js (npm run dev) w tle, lub, dla dystrybucji lokalnej, serwuje skompilowaną aplikację Next.js (npm run build a następnie npm run start). Możliwe, że backend Pythona będzie musiał serwować statyczne pliki Next.js po buildzie.

Otwiera domyślną przeglądarkę na odpowiednim adresie localhost.

Obsługuje czyszczenie procesów po zamknięciu skryptu.

4.2. Testowanie:

Testy Jednostkowe: Dla funkcji walidacji, importu Excela, generatora (dla różnych scenariuszy i danych wejściowych).

Testy Integracyjne: Sprawdzenie komunikacji między front-endem a back-endem, całych przepływów danych.

Testy Użyteczności (UX Testing): Testowanie intuicyjności interfejsu z potencjalnymi użytkownikami.

Testy Zgodności z Prawem Pracy: Przygotowanie przypadków testowych, które celowo naruszają przepisy, aby sprawdzić poprawność walidacji i generatora.

4.3. Optymalizacja i Refaktoryzacja:

Optymalizacja zapytań do bazy danych.

Poprawa wydajności front-endu Next.js (lazy loading, code splitting).

Refaktoryzacja kodu dla lepszej czytelności i utrzymania.

4.4. Dystrybucja Lokalna (nie .exe):

npm run build dla front-endu Next.js.

Skopiowanie skompilowanego front-endu (katalog out/ lub .next/) do katalogu backendu, aby serwer Pythona mógł go serwować jako pliki statyczne.

Spakowanie całego katalogu aplikacji (backend + skompilowany frontend + skrypty PowerShell) w plik ZIP/RAR dla łatwej dystrybucji.

Instrukcja dla użytkownika, jak zainstalować Pythona/Node.js i uruchomić skrypt PowerShell (lub proste skrypty instalacyjne).

Faza 5: Potencjalna Konwersja do .exe (Electron - Przyszłość)

Integracja Electrona: Stworzenie nowego projektu Electron, który będzie ładował spakowany front-end Next.js.

Pakowanie Backendu: Wykorzystanie narzędzi takich jak pyinstaller do spakowania backendu Pythona w osobny plik wykonywalny lub bibliotekę, która zostanie uruchomiona przez Electron.

Komunikacja: Zapewnienie, że Electronowa aplikacja komunikuje się z lokalnie uruchomionym backendem Pythona (lub bezpośrednio przez IPC, jeśli backend jest osadzony).

Budowanie .exe: Użycie electron-builder do stworzenia finalnego pliku .exe dla Windows 11.
