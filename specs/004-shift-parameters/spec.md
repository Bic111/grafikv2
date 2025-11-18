# Feature Specification: Refactor ParametryZmianTab.tsx to React Hook Form + Zod

**Feature Branch**: `004-shift-parameters`
**Created**: 2025-11-10
**Status**: Draft
**Input**: Należy przepisać komponent ParametryZmianTab.tsx aby używał React Hook Form + Zod zamiast uncontrolled components, zmieniając jednocześnie strukturę zarządzania stanem i walidacją formularza. Następnie trzeba przetestować integrację z backendem i upewnić się, że wszystkie operacje CRUD (create, read, update, delete) działają poprawnie dla każdego dnia tygodnia.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Manager konfiguruje parametry zmian ze zwalidowanym formularzem (Priority: P1)

Manager otwiera zakładkę "Parametry zmian" i widzi siedem sekcji rozwijanych (jeden dla każdego dnia tygodnia). Po rozwinięciu sekcji dnia, widzi dwie podsekcje: "Domyślne ustawienia zmian" i "Prowadzący zmianę". Każda podsekcja zawiera formularz z polami dla trzech typów zmian (Rano, Środek, Popoludniu) oraz opcją dodawania kolejnych zmian. Formularz waliduje dane w czasie rzeczywistym i pokazuje błędy walidacji dla nieprawidłowych pól.

**Why this priority**: Podstawowa funkcjonalność tab - manager musi móc skonfigurować parametry zmian z pewnością, że dane są prawidłowe przed wysłaniem na backend.

**Independent Test**: Manager może otworzyć dowolny dzień, wypełnić pola (godziny, liczba obsad) i zobaczyć komunikaty walidacji dla nieprawidłowych danych - testuje niezależnie bez zależności od innych komponentów.

**Acceptance Scenarios**:

1. **Given** manager jest w zakładce "Parametry zmian", **When** tab się ładuje, **Then** widzi siedem sekcji (jeden dla każdego dnia tygodnia) z domyślnie pierwszym dniem rozwijniętym
2. **Given** sekcja dnia jest rozwinięta, **When** manager przygląda się, **Then** widzi "Domyślne ustawienia zmian" i "Prowadzący zmianę" z formularzem dla każdego typu zmiany
3. **Given** formularz jest widoczny, **When** manager zostawia pole "godzina_od" puste i kliknie "Zapisz ustawienia dnia", **Then** pojawia się komunikat błędu "To pole jest wymagane" obok pola
4. **Given** manager wpisuje godzinę w złym formacie (np. "25:00"), **When** opuszcza pole, **Then** pojawia się komunikat "Godzina musi być w formacie HH:MM"
5. **Given** manager wpisuje liczbę obsad poniżej 0, **When** opuszcza pole, **Then** pojawia się komunikat "Liczba obsad musi być dodatnia"
6. **Given** manager wypełni formularz prawidłowo i kliknie "Zapisz ustawienia dnia", **Then** dane są wysyłane na backend i pojawia się komunikat sukcesu

---

### User Story 2 - Manager dodaje i usuwa dodatkowe zmiany dla dnia (Priority: P1)

Manager w dowolnym dniu klika "+ dodaj kolejną zmianę" i pojawia się nowy formularz dla zmiany. Manager może wypełnić dane dla nowej zmiany. Jeśli chce usunąć dodatkową zmianę (więcej niż trzy standardowe), klika przycisk usunięcia i zmiana jest usuwana (z potwierdzeniem, jeśli zmiana ma ID z bazy danych).

**Why this priority**: Kluczowa funkcjonalność pozwalająca na elastyczne konfigurowanie zmian - manager musi móc dodawać i usuwać zmiany bez ograniczeń.

**Independent Test**: Manager może dodać nową zmianę, wypełnić jej dane, zapisać i zobaczyć ją w liście - niezależnie testowalne bez innych zmian.

**Acceptance Scenarios**:

1. **Given** sekcja dnia jest rozwinięta, **When** manager klika "+ dodaj kolejną zmianę" w sekcji "Domyślne ustawienia zmian", **Then** pojawia się nowy, pusty formularz
2. **Given** nowy formularz jest widoczny, **When** manager wypełni wszystkie pola prawidłowo, **Then** przycisk usunięcia jest aktywny (wymagane min. 3 zmiany standardowe)
3. **Given** dodatkowa zmiana istnieje w formularzu, **When** manager klika przycisk usunięcia, **Then** zmiana jest natychmiast usunięta z UI (jeśli nie ma ID) lub pojawia się potwierdzenie (jeśli zmiana z bazy)
4. **Given** manager dodał zmianę, **When** klika "Zapisz ustawienia dnia", **Then** nowa zmiana jest wysłana na backend jako create
5. **Given** zmiana ma ID (istnieje w bazie), **When** manager usuwa zmianę i kliknie potwierdzenie, **Then** zmiana jest usuwana z bazy poprzez DELETE

---

### User Story 3 - Manager edytuje istniejące parametry zmian dla każdego dnia (Priority: P1)

Manager przechodzi do dowolnego dnia i widzi istniejące parametry zmian (załadowane z bazy danych). Zmienia wartości pól i klika "Zapisz ustawienia dnia". System wysyła aktualizacje na backend dla wszystkich zmienionych pól.

**Why this priority**: Edycja istniejących konfiguracji jest niezbędna dla pełnego cyklu CRUD.

**Independent Test**: Manager może załadować istniejące parametry, zmienić wartości, zapisać i sprawdzić, że zmiany są persystentne w bazie.

**Acceptance Scenarios**:

1. **Given** sekcja dnia jest rozwinięta i parametry są załadowane, **When** manager zmienia godzinę_od dla pierwszej zmiany, **Then** pola są edytowalne i pokazują aktualne wartości
2. **Given** manager zmienia wiele pól na raz, **When** kliknie "Zapisz ustawienia dnia", **Then** wszystkie zmiany są wysyłane na backend (PUT requests)
3. **Given** manager zmienia liczbę_obsad, **When** zapisuje, **Then** nowa wartość jest przechowywana w bazie i odzwierciedlona w UI
4. **Given** manager edytuje zmianę, która już istnieje w bazie, **When** zapisuje, **Then** system wysyła PUT request z aktualnym ID parametru
5. **Given** zmiana jest zedytowana, **When** manager odświeży stronę, **Then** zmienione wartości się utrzymują

---


### Edge Cases

- **Brak parametrów zmian dla dnia**: Gdy nie ma żadnych parametrów dla dnia, pokazać domyślne puste formularz z trzema typami zmian
- **Godzina_od >= godzina_do**: Pokazać błąd walidacji "Godzina rozpoczęcia musi być wcześniejsza niż godzina końca"
- **Błąd API podczas zapisywania**: Pokazać komunikat błędu i utrzymać dane w formularzu (nie tracić zmian)
- **Wiele żądań jednocześnie**: Disabled przycisk "Zapisz" podczas wysyłania, aby uniemożliwić duplikowanie żądań
- **Usunięcie zmieniane podczas edycji**: Jeśli zmiana zostanie usunięta z bazy przez innego użytkownika, pokazać błąd
- **Timeout API**: Jeśli request trwa dłużej niż 30 sekund, pokazać timeout error

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

**Frontend - React Hook Form Integration**

- **FR-001**: Komponent MUSI używać `useForm` z React Hook Form do zarządzania stanem formularza dla każdego dnia
- **FR-002**: Komponent MUSI używać `useFieldArray` do zarządzania dynamiczną listą zmian dla każdego dnia
- **FR-003**: Każde pole MUSI być zarejestrowane z `register()` i powiązane z Zod schematem
- **FR-004**: Komponent MUSI używać `handleSubmit` callback do obsługi zapisywania zmian
- **FR-005**: Komponent MUSI wyświetlać błędy walidacji obok każdego pola zaraz po utracie focusu

**Frontend - Zod Validation**

- **FR-006**: Komponent MUSI używać Zod schema do walidacji wszystkich pól formularza
- **FR-007**: Schema MUSI walidować `godzina_od` w formacie HH:MM (00:00-23:59)
- **FR-008**: Schema MUSI walidować `godzina_do` w formacie HH:MM (00:00-23:59)
- **FR-009**: Schema MUSI walidować, że `godzina_od` < `godzina_do`
- **FR-010**: Schema MUSI walidować `liczba_obsad` >= 0
- **FR-011**: Schema MUSI wymagać wszystkich pól obowiązkowych
- **FR-012**: Komunikaty walidacji MUSZĄ być w języku polskim

**Frontend - Form State Management**

- **FR-013**: Komponent MUSI ładować parametry zmian z API GET `/shift-parameters?day=X` przy montażu
- **FR-014**: Komponent MUSI obsługiwać dodawanie nowych zmian (useFieldArray append)
- **FR-015**: Komponent MUSI obsługiwać usuwanie zmian (useFieldArray remove)
- **FR-016**: Komponent MUSI utrzymywać osobny formularz dla każdego dnia tygodnia
- **FR-017**: Komponent MUSI pokazywać spinner podczas ładowania danych
- **FR-018**: Komponent MUSI pokazywać komunikat sukcesu po zapisaniu ("Ustawienia zapisane pomyślnie")

**Backend - CRUD Operations**

- **FR-019**: Endpoint GET `/shift-parameters` MUSI zwracać listę wszystkich parametrów zmian
- **FR-020**: Endpoint GET `/shift-parameters?day=X` MUSI zwracać parametry tylko dla dnia X
- **FR-021**: Endpoint POST `/shift-parameters` MUSI tworzyć nowy parametr i zwracać status 201
- **FR-022**: Endpoint PUT `/shift-parameters/<id>` MUSI aktualizować istniejący parametr
- **FR-023**: Endpoint DELETE `/shift-parameters/<id>` MUSI usuwać parametr i zwracać status 204
- **FR-024**: Wszystkie endpointy MUSZĄ walidować dane wejściowe i zwracać status 400 dla niepełnych danych
- **FR-025**: Wszystkie endpointy MUSZĄ zwracać status 404 dla nieistniejących parametrów


### Key Entities

- **ShiftParameter**: Reprezentuje konfigurację zmiany dla dnia tygodnia z atrybutami: id (backend), localId (frontend), dzien_tygodnia, typ_zmiany, godzina_od, godzina_do, liczba_obsad, czy_prowadzacy

- **ShiftParameterFormValue**: Frontend representation z dodatkowym polem `localId` dla nowych (niezapisanych) zmian

- **ShiftParameterInput**: Schema Zod dla walidacji pól formularza

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Wszystkie pola formularza są zwalidowane za pomocą Zod schema bez błędów typu
- **SC-002**: Walidacja błędów pojawia się w ciągu <100ms od utraty focusu pola
- **SC-003**: System prawidłowo wysyła POST request dla nowych parametrów zmian (CREATE)
- **SC-004**: System prawidłowo wysyła PUT request dla edytowanych parametrów (UPDATE)
- **SC-005**: System prawidłowo wysyła DELETE request dla usuwanych parametrów (DELETE)
- **SC-006**: System prawidłowo pobiera parametry z GET `/shift-parameters?day=X` dla każdego dnia (READ)
- **SC-007**: Błędy API są wyświetlone użytkownikowi w ciągu <2 sekund
- **SC-008**: Po zapisaniu, dane w formularzu są odświeżane z bazy danych
- **SC-009**: Dodanie i usunięcie zmiany dynamicznie aktualizuje UI
- **SC-010**: 100% pól formularza ma komunikaty błędów dla nieprawidłowych danych
- **SC-011**: React Hook Form zmniejsza boilerplate stanu formularza w stosunku do uncontrolled components

---

### Assumptions

1. Backend API jest dostępny pod `/api/shift-parameters` lub `/shift-parameters`
2. Zod schema już istnieje lub będzie stworzona w ramach tej cechy
3. React Hook Form jest już zainstalowany w projekcie
4. Godziny są zawsze w formacie HH:MM (24-godzinny format)
5. Liczba obsad jest całkowitą, dodatnią liczbą
6. Typ zmiany (Rano, Środek, Popoludniu) nie zmienia się dynamicznie
7. Dzień tygodnia (0-6) nie zmienia się dynamicznie dla istniejących parametrów
8. Tylko managerowie/administratorzy mają dostęp do tej zakładki
9. Usunięcia są trwałe i nie mogą być przywrócone
10. Walidacja po stronie klienta wystarczy (backend ma backup)

---

**Ostatnia aktualizacja**: 2025-11-10
**Status**: Ready for Quality Validation Checklist
