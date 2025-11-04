# Feature Specification: Core Application MVP

**Feature Branch**: `001-core-application-mvp`
**Created**: 2025-11-04
**Status**: Draft
**Input**: User description: "Build the core application MVP as described in the /docs/newapp/ documentation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Konfiguracja Systemu (Priority: P1)

Jako manager, chcę móc zdefiniować podstawowe parametry systemu, takie jak pracownicy, ich role, etaty, oraz parametry zmian (godziny, obsada), abym mógł przygotować system do planowania grafiku.

**Why this priority**: Jest to fundamentalny krok, bez którego żadne planowanie ani generowanie grafiku nie jest możliwe.

**Independent Test**: Można zweryfikować, czy system poprawnie zapisuje i odczytuje dane konfiguracyjne, oraz czy interfejs użytkownika pozwala na ich łatwe wprowadzanie i edycję.

**Acceptance Scenarios**:

1.  **Given** Czysta instalacja aplikacji, **When** Manager dodaje nowego pracownika z rolą i etatem, **Then** Pracownik jest widoczny na liście pracowników.
2.  **Given** Skonfigurowani pracownicy, **When** Manager definiuje parametry zmian dla dnia roboczego, **Then** Zmiany są zapisane i widoczne w panelu konfiguracji.

---

### User Story 2 - Zarządzanie Nieobecnościami i Walidacja Grafiku (Priority: P2)

Jako manager, chcę móc wprowadzać nieobecności pracowników (urlopy, zwolnienia) oraz ręcznie tworzyć i edytować grafik, a system musi na bieżąco walidować moje zmiany pod kątem zgodności z prawem pracy i regułami firmy.

**Why this priority**: Zapewnia zgodność z prawem i podstawową funkcjonalność ręcznego planowania, co jest rdzeniem aplikacji.

**Independent Test**: Można przetestować, czy dodanie zmiany w dniu urlopu pracownika generuje błąd krytyczny, oraz czy system poprawnie identyfikuje naruszenia np. 11-godzinnego odpoczynku.

**Acceptance Scenarios**:

1.  **Given** Pracownik ma zaplanowany urlop, **When** Manager próbuje przypisać go do zmiany w tym dniu, **Then** System wyświetla błąd krytyczny i nie pozwala na zapis.
2.  **Given** Pracownik kończy zmianę o 22:00, **When** Manager próbuje przypisać go do zmiany zaczynającej się o 6:00 następnego dnia, **Then** System wyświetla błąd krytyczny o naruszeniu 11-godzinnego odpoczynku.

---

### User Story 3 - Automatyczne Generowanie Grafiku (Priority: P3)

Jako manager, chcę móc zlecić systemowi automatyczne wygenerowanie projektu grafiku na podstawie zdefiniowanych reguł, pracowników i ich dostępności, aby zaoszczędzić czas na ręcznym planowaniu.

**Why this priority**: Jest to kluczowa funkcja "smart" aplikacji, która dostarcza największą wartość dodaną.

**Independent Test**: Można sprawdzić, czy po wciśnięciu przycisku "Generuj" system tworzy kompletny grafik, który nie zawiera błędów krytycznych i jest zoptymalizowany pod kątem równomiernego rozłożenia godzin.

**Acceptance Scenarios**:

1.  **Given** Pełna konfiguracja systemu (pracownicy, zmiany, nieobecności), **When** Manager klika "Generuj Grafik", **Then** System w ciągu kilku minut prezentuje projekt grafiku bez krytycznych błędów walidacyjnych.

---

### Edge Cases

-   Co w przypadku, gdy liczba pracowników jest niewystarczająca do obsadzenia wszystkich zmian?
-   Jak system obsługuje zmiany na przełomie roku/miesiąca?
-   Co się dzieje, gdy plik importu z Excela ma nieprawidłową strukturę?

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: System MUSI pozwalać na zarządzanie listą pracowników (dodawanie, edycja, usuwanie) z atrybutami: imię, nazwisko, rola, etat, status.
-   **FR-002**: System MUSI umożliwiać konfigurację parametrów zmian dla każdego dnia tygodnia, w tym godziny rozpoczęcia/zakończenia i wymaganą liczbę osób.
-   **FR-003**: System MUSI pozwalać na rejestrowanie nieobecności pracowników (urlopy, zwolnienia lekarskie).
-   **FR-004**: System MUSI przeprowadzać walidację grafiku po każdej zmianie, sprawdzając co najmniej: konflikt z nieobecnością, odpoczynek dobowy (11h), limity godzin, pracę po nocnej zmianie.
-   **FR-005**: Błędy krytyczne MUSZĄ być wyraźnie komunikowane i blokować zapis grafiku.
-   **FR-006**: System MUSI posiadać funkcję automatycznego generowania grafiku z wykorzystaniem AI, na podstawie zdefiniowanych wytycznych.
-   **FR-007**: Interfejs użytkownika i wszystkie komunikaty MUSZĄ być w języku polskim.
-   **FR-008**: System MUSI umożliwiać eksport grafiku do formatu PDF i CSV.
-   **FR-009**: Aplikacja MUSI działać jako samodzielna aplikacja desktopowa na systemie Windows.

### Key Entities *(include if feature involves data)*

-   **Pracownik**: Reprezentuje osobę w zespole; atrybuty: id, imię, nazwisko, rola, etat, status.
-   **Zmiana**: Reprezentuje pojedynczy blok pracy; atrybuty: początek, koniec, wymagana obsada.
-   **Nieobecność**: Reprezentuje okres, w którym pracownik jest niedostępny; atrybuty: id pracownika, początek, koniec, typ (urlop, zwolnienie).
-   **Grafik**: Reprezentuje miesięczny plan pracy dla zespołu.
-   **Reguła Walidacyjna**: Reprezentuje ograniczenie biznesowe lub prawne (np. odpoczynek dobowy).

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: Manager może skonfigurować system (pracownicy, zmiany) w czasie poniżej 30 minut.
-   **SC-002**: System identyfikuje 100% zdefiniowanych krytycznych naruszeń reguł w ręcznie edytowanym grafiku.
-   **SC-003**: Automatyczne generowanie grafiku dla 20-osobowego zespołu na jeden miesiąc trwa poniżej 5 minut.
-   **SC-004**: 90% wygenerowanych automatycznie grafików nie wymaga ręcznych poprawek w zakresie błędów krytycznych.