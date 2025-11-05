# Specyfikacja Funkcji: Rdzeń Aplikacji MVP

**Gałąź Funkcji**: `002-core-application-mvp`
**Utworzono**: 2025-11-04
**Status**: Wersja Robocza
**Wejście**: Opis użytkownika: "Zbuduj rdzeń aplikacji MVP zgodnie z opisem w dokumentacji /docs/newapp/."

## Wyjaśnienia

### Sesja 2025-11-04
- P: W jaki sposób powinien być zabezpieczony dostęp do aplikacji? → O: Brak zabezpieczeń. Aplikacja uruchamia się natychmiast, a każda osoba z dostępem do komputera może z niej korzystać.
- P: Jakiego rodzaju mechanizm AI powinien zostać użyty? → O: Model hybrydowy. Proste przypadki rozwiązywane są lokalnie, a bardziej złożone wysyłane do zewnętrznej usługi (Gemini API).
- P: Jaka jest przewidywana maksymalna liczba pracowników, którą system powinien być w stanie płynnie obsłużyć? → O: Zazwyczaj 15, maksymalnie 20 pracowników.
- P: Jak system powinien obsługiwać niekrytyczne problemy lub ostrzeżenia? → O: Generator zapewnia poprawność grafiku; ostrzeżenia wyświetlane użytkownikowi do ręcznej korekty lub zatwierdzenia.
- P: Co w przypadku, gdy liczba pracowników jest niewystarczająca do obsadzenia wszystkich zmian? → O: System wygeneruje grafik z brakami, wyraźnie je wskazując, i wyświetli ostrzeżenie.

## Scenariusze Użytkownika i Testowanie *(obowiązkowe)*

### Historia Użytkownika 1 - Konfiguracja Systemu (Priorytet: P1)

Jako manager, chcę móc zdefiniować podstawowe parametry systemu, takie jak pracownicy, ich role, etaty, oraz parametry zmian (godziny, obsada), abym mógł przygotować system do planowania grafiku.

**Dlaczego ten priorytet**: Jest to fundamentalny krok, bez którego żadne planowanie ani generowanie grafiku nie jest możliwe.

**Test Niezależny**: Można zweryfikować, czy system poprawnie zapisuje i odczytuje dane konfiguracyjne, oraz czy interfejs użytkownika pozwala na ich łatwe wprowadzanie i edycję.

**Scenariusze Akceptacyjne**:

1.  **Mając** Czystą instalację aplikacji, **Kiedy** Manager dodaje nowego pracownika z rolą i etatem, **Wtedy** Pracownik jest widoczny na liście pracowników.
2.  **Mając** Skonfigurowanych pracowników, **Kiedy** Manager definiuje parametry zmian dla dnia roboczego, **Wtedy** Zmiany są zapisane i widoczne w panelu konfiguracji.

---

### Historia Użytkownika 2 - Zarządzanie Nieobecnościami i Walidacja Grafiku (Priorytet: P2)

Jako manager, chcę móc wprowadzać nieobecności pracowników (urlopy, zwolnienia) oraz ręcznie tworzyć i edytować grafik, a system musi na bieżąco walidować moje zmiany pod kątem zgodności z prawem pracy i regułami firmy.

**Dlaczego ten priorytet**: Zapewnia zgodność z prawem i podstawową funkcjonalność ręcznego planowania, co jest rdzeniem aplikacji.

**Test Niezależny**: Można przetestować, czy dodanie zmiany w dniu urlopu pracownika generuje błąd krytyczny, oraz czy system poprawnie identyfikuje naruszenia np. 11-godzinnego odpoczynku.

**Scenariusze Akceptacyjne**:

1.  **Mając** Pracownika z zaplanowanym urlopem, **Kiedy** Manager próbuje przypisać go do zmiany w tym dniu, **Wtedy** System wyświetla błąd krytyczny i nie pozwala na zapis.
2.  **Mając** Pracownika kończącego zmianę o 22:00, **Kiedy** Manager próbuje przypisać go do zmiany zaczynającej się o 6:00 następnego dnia, **Wtedy** System wyświetla błąd krytyczny o naruszeniu 11-godzinnego odpoczynku.

---

### Historia Użytkownika 3 - Automatyczne Generowanie Grafiku (Priorytet: P3)

Jako manager, chcę móc zlecić systemowi automatyczne wygenerowanie projektu grafiku na podstawie zdefiniowanych reguł, pracowników i ich dostępności, aby zaoszczędzić czas na ręcznym planowaniu.

**Dlaczego ten priorytet**: Jest to kluczowa funkcja "smart" aplikacji, która dostarcza największą wartość dodaną.

**Test Niezależny**: Można sprawdzić, czy po wciśnięciu przycisku "Generuj" system tworzy kompletny grafik, który nie zawiera błędów krytycznych i jest zoptymalizowany pod kątem równomiernego rozłożenia godzin.

**Scenariusze Akceptacyjne**:

1.  **Mając** Pełną konfigurację systemu (pracownicy, zmiany, nieobecności), **Kiedy** Manager klika "Generuj Grafik", **Wtedy** System w ciągu kilku minut prezentuje projekt grafiku bez krytycznych błędów walidacyjnych.

---

### Przypadki Brzegowe

-   **Zachowanie w przypadku niewystarczającej obsady:** System wygeneruje grafik z brakami, wyraźnie wskazując, które zmiany nie zostały obsadzone, i wyświetli ostrzeżenie.
-   Jak system obsługuje zmiany na przełomie roku/miesiąca?
-   Co się dzieje, gdy plik importu z Excela ma nieprawidłową strukturę?

## Wymagania *(obowiązkowe)*

### Wymagania Funkcjonalne

-   **FR-001**: System MUSI pozwalać na zarządzanie listą pracowników (dodawanie, edycja, usuwanie) z atrybutami: imię, nazwisko, rola, etat, status.
-   **FR-002**: System MUSI umożliwiać konfigurację parametrów zmian dla każdego dnia tygodnia, w tym godziny rozpoczęcia/zakończenia i wymaganą liczbę osób.
-   **FR-003**: System MUSI pozwalać na rejestrowanie nieobecności pracowników (urlopy, zwolnienia lekarskie).
-   **FR-004**: System MUSI przeprowadzać walidację grafiku po każdej zmianie, sprawdzając co najmniej: konflikt z nieobecnością, odpoczynek dobowy (11h), limity godzin, pracę po nocnej zmianie.
-   **FR-005**: Błędy krytyczne MUSZĄ być wyraźnie komunikowane i blokować zapis grafiku.
-   **FR-006**: System MUSI posiadać funkcję automatycznego generowania grafiku z wykorzystaniem AI, na podstawie zdefiniowanych wytycznych.
-   **FR-007**: Interfejs użytkownika i wszystkie komunikaty MUSZĄ być w języku polskim.
-   **FR-008**: System MUSI umożliwiać eksport grafiku do formatu PDF i CSV.
-   **FR-009**: Aplikacja MUSI działać jako samodzielna aplikacja desktopowa na systemie Windows.

### Wymagania Niefunkcjonalne

-   **NFR-001 (Bezpieczeństwo)**: Aplikacja nie wymaga uwierzytelniania. Dostęp jest otwarty dla każdego użytkownika komputera, zgodnie z założeniem o lokalnym wykorzystaniu przez jedną osobę.
-   **NFR-002 (Generowanie AI)**: Generowanie grafiku będzie realizowane w modelu hybrydowym:
    -   Domyślnie system spróbuje rozwiązać grafik przy użyciu prostego, lokalnego algorytmu.
    -   W przypadku złożonych scenariuszy lub na żądanie managera, system użyje zewnętrznego API (Gemini) do wygenerowania propozycji grafiku.
-   **NFR-003 (Łączność)**: Do użycia zaawansowanego trybu generowania grafiku (przez API) wymagane jest aktywne połączenie z internetem oraz skonfigurowany klucz API.
-   **NFR-004 (Skalowalność/Wydajność)**: System musi płynnie obsługiwać grafik dla zespołu liczącego zazwyczaj 15 pracowników, z maksymalną liczbą 20 pracowników.
-   **NFR-005 (Obsługa Ostrzeżeń)**: System powinien wyświetlać ostrzeżenia dotyczące niekrytycznych problemów (np. niespełnione preferencje, zbliżanie się do limitów godzin), pozwalając managerowi na ręczną korektę lub zatwierdzenie grafiku z ostrzeżeniami. Generator grafiku ma zapewnić brak błędów krytycznych.

### Kluczowe Encje *(dołącz, jeśli funkcja obejmuje dane)*

-   **Pracownik**: Reprezentuje osobę w zespole; atrybuty: id, imię, nazwisko, rola, etat, status.
-   **Zmiana**: Reprezentuje pojedynczy blok pracy; atrybuty: początek, koniec, wymagana obsada.
-   **Nieobecność**: Reprezentuje okres, w którym pracownik jest niedostępny; atrybuty: id pracownika, początek, koniec, typ (urlop, zwolnienie).
-   **Grafik**: Reprezentuje miesięczny plan pracy dla zespołu.
-   **Reguła Walidacyjna**: Reprezentuje ograniczenie biznesowe lub prawne (np. odpoczynek dobowy).

## Kryteria Sukcesu *(obowiązkowe)*

### Mierzalne Wyniki

-   **SC-001**: Manager może skonfigurować system (pracownicy, zmiany) w czasie poniżej 30 minut.
-   **SC-002**: System identyfikuje 100% zdefiniowanych krytycznych naruszeń reguł w ręcznie edytowanym grafiku.
-   **SC-003**: Automatyczne generowanie grafiku dla 20-osobowego zespołu na jeden miesiąc trwa poniżej 5 minut.
-   **SC-004**: 90% wygenerowanych automatycznie grafików nie wymaga ręcznych poprawek w zakresie błędów krytycznych.
