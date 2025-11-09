# Feature Specification: WorkSchedule PL Lokalnie

**Feature Branch**: `001-work-schedule-app`
**Created**: 2025-11-09
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Konfiguracja Systemu (Priority: P1)
Jako Manager, chcę móc zdefiniować podstawowe parametry systemu, takie jak pracownicy, ich role, rodzaje zmian oraz wymagania obsadowe, aby przygotować aplikację do generowania grafików.
**Why this priority**: Jest to fundamentalny krok, bez którego niemożliwe jest dalsze działanie aplikacji.
**Independent Test**: Można zweryfikować, czy wszystkie dane konfiguracyjne zostały poprawnie zapisane w bazie danych i są dostępne przez API.
**Acceptance Scenarios**:
1. **Given** Czysta instalacja aplikacji, **When** Dodaję nowego pracownika z rolą "Kasjer", **Then** Pracownik jest widoczny na liście pracowników z poprawnymi danymi.
2. **Given** Zdefiniowane role, **When** Definiuję nową zmianę "Ranną" z wymaganiem obsady 2 "Kasjerów", **Then** Zmiana jest zapisana i widoczna w konfiguracji.

### User Story 2 - Generowanie Grafiku (Priority: P1)
Jako Manager, chcę wygenerować nowy grafik na przyszły miesiąc, uwzględniając wszystkie zdefiniowane zasady (Kodeks Pracy, wymagania obsadowe, preferencje), aby szybko otrzymać zoptymalizowany i zgodny z prawem plan pracy.
**Why this priority**: Główna funkcjonalność aplikacji, która dostarcza największą wartość.
**Independent Test**: Można zweryfikować, czy wygenerowany grafik spełnia wszystkie twarde ograniczenia (prawne i biznesowe) i czy jest zapisany w bazie.
**Acceptance Scenarios**:
1. **Given** Pełna konfiguracja systemu, **When** Uruchamiam generator dla następnego miesiąca, **Then** System zwraca kompletny grafik bez naruszeń Kodeksu Pracy.
2. **Given** Grafik z naruszeniami, **When** Przeglądam grafik, **Then** Widzę wizualne ostrzeżenia przy naruszonych pozycjach.

### User Story 3 - Zarządzanie Grafikiem (Priority: P2)
Jako Manager, chcę mieć możliwość ręcznej edycji wygenerowanego grafiku (np. zamiana zmian między pracownikami) oraz wprowadzania nieobecności, aby dynamicznie reagować na zmiany i nieprzewidziane sytuacje.
**Why this priority**: Zapewnia elastyczność i możliwość ludzkiej interwencji w automatycznym procesie.
**Independent Test**: Można zweryfikować, czy ręczne zmiany są poprawnie zapisywane i czy system ponownie waliduje grafik po zmianie.
**Acceptance Scenarios**:
1. **Given** Wygenerowany grafik, **When** Przeciągam zmianę pracownika A na pracownika B, **Then** Zmiana zostaje zapisana, a system pokazuje ewentualne nowe naruszenia.
2. **Given** Pracownik zgłasza urlop, **When** Dodaję nieobecność w systemie, **Then** Pracownik nie jest uwzględniany w grafiku w danym okresie.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUSI pozwalać na zarządzanie (CRUD) danymi pracowników, ról i definicji zmian.
- **FR-002**: System MUSI przechowywać i zarządzać informacjami o nieobecnościach i świętach.
- **FR-003**: System MUSI automatycznie generować grafiki pracy na podstawie zdefiniowanych reguł.
- **FR-004**: Generator MUSI uwzględniać ograniczenia wynikające z Kodeksu Pracy (odpoczynek dobowy, tygodniowy, limity godzin).
- **FR-005**: System MUSI pozwalać na ręczną edycję grafiku z natychmiastową walidacją wprowadzonych zmian.
- **FR-006**: System MUSI umożliwiać import historycznych wzorców grafików z plików Excel.
- **FR-007**: System MUSI generować raporty (nadgodziny, naruszenia).
- **FR-008**: Interfejs użytkownika MUSI być w języku polskim.

### Key Entities
- **Pracownik**: Reprezentuje osobę zatrudnioną; zawiera dane osobowe, rolę, etat, preferencje.
- **Rola**: Definiuje stanowisko w firmie (np. Kierownik) wraz z wymaganiami obsadowymi.
- **Zmiana**: Określony przedział czasu pracy (np. "Rano", 06:00-14:00).
- **Grafik**: Zbiór przypisanych zmian dla wszystkich pracowników w danym miesiącu.
- **Nieobecność**: Okres, w którym pracownik jest niedostępny (np. urlop, L4).

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: Czas generowania grafiku dla 50 pracowników na jeden miesiąc nie powinien przekraczać 5 minut.
- **SC-002**: System musi poprawnie zidentyfikować 100% predefiniowanych naruszeń Kodeksu Pracy w testowych zestawach danych.
- **SC-003**: Ręczna zmiana w grafiku (przeciągnij-i-upuść) powinna być zweryfikowana i zapisana w czasie poniżej 2 sekund.
- **SC-004**: 90% użytkowników musi być w stanie samodzielnie skonfigurować system i wygenerować pierwszy grafik po 15-minutowym wprowadzeniu.
