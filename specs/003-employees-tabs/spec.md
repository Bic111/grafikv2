# Feature Specification: Przebudowa UI Zakładki Pracownicy z Systemem Tabs

**Feature Branch**: `003-employees-tabs`
**Created**: 2025-11-10
**Status**: Draft
**Input**: Przebudowa UI zakładki Pracownicy z systemem tabs (Wszyscy, Urlopy, Zwolnienia, Parametry zmian, Święta, Reguły) – kompletna implementacja wszystkich tab bez odraczania żadnych funkcjonalności.

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

### User Story 1 - Manager przegląda i zarządza pracownikami w zakładce "Wszyscy" (Priority: P1)

Manager dostęp do strony `/employees` i widzi zakładkę "Wszyscy" zawierającą listę wszystkich pracowników z kolumnami: Imię i nazwisko, Stanowisko, Status, Etat. Manager może dodawać nowych pracowników, edytować istniejących, zarządzać preferencjami oraz usuwać pracowników.

**Why this priority**: Podstawowa funkcjonalność strony Pracownicy – umożliwia zarządzanie bazą pracowników, która jest kluczowa dla całego systemu planowania grafików i urlopów.

**Independent Test**: Ta zakładka może być w pełni testowana poprzez dodanie pracownika, edycję jego danych, i usunięcie – stanowi niezależną wartość dla użytkownika bez konieczności pozostałych tab.

**Acceptance Scenarios**:

1. **Given** manager jest na stronie `/employees`, **When** otwiera aplikację, **Then** widzi zakładkę "Wszyscy" jako aktywną domyślnie z listą wszystkich pracowników
2. **Given** widok listy pracowników, **When** manager klika przycisk "+ Dodaj pracownika", **Then** otwiera się formularz z polami: Imię, Nazwisko, Stanowisko (lista rozwijana), Status (lista rozwijana), Etat (lista rozwijana)
3. **Given** formularz dodawania pracownika jest otwarty, **When** manager wypełni Imię i Nazwisko oraz wybierze Stanowisko, Status i Etat, **Then** po kliknięciu "Zapisz zmiany" pracownik pojawia się w liście
4. **Given** pracownik istnieje w liście, **When** manager klika "Edytuj" w menu akcji, **Then** otwiera się formularz edycji z aktualnym danymi
5. **Given** formularz edycji jest otwarty, **When** manager zmieni dane i kliknie "Zapisz zmiany", **Then** zmiany są zapisane i lista się odświeża
6. **Given** pracownik istnieje w liście, **When** manager klika "Usuń" w menu akcji, **Then** pojawia się potwierdzenie usunięcia i pracownik znika z listy
7. **Given** lista pracowników się ładuje, **When** dane są pobierane z API, **Then** pokazany jest spinner lub skeleton screen

---

### User Story 2 - Manager planuje i zarządza urlopami w zakładce "Urlopy" (Priority: P1)

Manager przełącza się do zakładki "Urlopy" i widzi formularz do planowania urlopów oraz tabelę z zaplanowanymi urlopami. Manager może dodawać nowe urlopy, edytować i usuwać istniejące, oraz filtrować urlopy po roku/miesiącu.

**Why this priority**: Zarządzanie urlopami pracowników jest kluczową funkcjonalnością HR i jest połączone z planowaniem grafików – jest niezbędne do pełnego działania systemu.

**Independent Test**: Tab "Urlopy" dostarcza pełną funkcjonalność do zarządzania urlopami niezależnie – manager może dodawać, edytować i usuwać urlopy bez dostępu do innych części aplikacji.

**Acceptance Scenarios**:

1. **Given** manager jest w zakładce "Urlopy", **When** tab się ładuje, **Then** widzi formularz "Zaplanuj urlop" z polami: Pracownik (lista), Okres urlopu (daty), przycisk "Zaplanuj urlop"
2. **Given** formularz jest widoczny, **When** manager wybierze pracownika i zakresy dat, **Then** po kliknięciu "Zaplanuj urlop" nowy urlop pojawia się w tabeli
3. **Given** urlopy zostały zaplanowane, **When** manager przygląda się tabeli, **Then** widzi kolumny: Pracownik, Od, Do, Liczba dni, Akcje
4. **Given** urlop istnieje w tabeli, **When** manager kliknie "Edytuj", **Then** może zmienić daty i zapisać
5. **Given** urlop istnieje w tabeli, **When** manager kliknie "Usuń", **Then** pojawia się potwierdzenie i urlop jest usunięty
6. **Given** urlopy zostały zaplanowane, **When** manager filtruje po roku/miesiącu, **Then** tabela pokazuje tylko urlopy z wybranego okresu

---

### User Story 3 - Manager rejestruje zwolnienia lekarskie w zakładce "Zwolnienia" (Priority: P1)

Manager przełącza się do zakładki "Zwolnienia" i widzi formularz do dodawania zwolnień lekarskich oraz tabelę zarejestrowanych zwolnień. Manager może dodawać nowe zwolnienia, edytować i usuwać istniejące.

**Why this priority**: Rejestracja zwolnień lekarskich jest wymagana prawnie i wpływa na planning grafików.

**Independent Test**: Tab "Zwolnienia" umożliwia niezależne zarządzanie zwolnieniami – manager może dodawać, edytować i usuwać zwolnienia bez dostępu do innych tab.

**Acceptance Scenarios**:

1. **Given** manager jest w zakładce "Zwolnienia", **When** tab się ładuje, **Then** widzi formularz z polami: Pracownik, Okres zwolnienia (daty), Notatki/Numer L4
2. **Given** formularz jest widoczny, **When** manager wybierze pracownika i daty, **Then** po kliknięciu "Dodaj zwolnienie" zwolnienie pojawia się w tabeli
3. **Given** zwolnienia zostały zarejestrowane, **When** manager przygląda się tabeli, **Then** widzi kolumny: Pracownik, Od, Do, Typ zwolnienia, Notatki, Akcje
4. **Given** zwolnienie istnieje w tabeli, **When** manager kliknie "Edytuj", **Then** może zmienić daty i notatki
5. **Given** zwolnienie istnieje w tabeli, **When** manager kliknie "Usuń", **Then** pojawia się potwierdzenie i zwolnienie jest usunięte

---

### User Story 4 - Manager konfiguruje parametry zmian w zakładce "Parametry zmian" (Priority: P2)

Manager przełącza się do zakładki "Parametry zmian" i konfiguruje domyślne ustawienia zmian dla każdego dnia tygodnia, definiując godziny i liczbę obsad dla zmian: Rano, Środek, Popoludniu. Manager może również konfigurować stanowisko "Prowadzący zmianę".

**Why this priority**: Parametry zmian są kluczowe dla generowania grafików, ale mogą być skonfigurowane jako druga iteracja.

**Independent Test**: Tab "Parametry zmian" umożliwia pełną konfigurację zmian niezależnie – można testować poprzez dodawanie i edytowanie parametrów dla każdego dnia tygodnia.

**Acceptance Scenarios**:

1. **Given** manager jest w zakładce "Parametry zmian", **When** tab się ładuje, **Then** widzi siedem sekcji (jeden dla każdego dnia tygodnia)
2. **Given** sekcja dla dnia tygodnia jest widoczna, **When** manager przygląda się strukturze, **Then** widzi "Domyślne ustawienia zmian" i "Prowadzący zmianę"
3. **Given** sekcja ustawień zmian, **When** manager przygląda się, **Then** widzi trzy części: Rano, Środek, Popoludniu z polami: od (czas), do (czas), liczba obsad
4. **Given** parametry dla dnia są zdefiniowane, **When** manager zmieni wartości, **Then** może zapisać zmiany dla tego dnia

---

### User Story 5 - Manager zarządza dniami świętymi w zakładce "Święta" (Priority: P2)

Manager przełącza się do zakładki "Święta" i widzi możliwość dodawania, edytowania i usuwania dni świątecznych.

**Why this priority**: Zarządzanie dniami świętymi wpływa na planning grafików – dni świąteczne nie powinny być uwzględniane w generowaniu grafików. Jest to ważne, ale może być skonfigurowane po implementacji podstawowych funkcji.

**Independent Test**: Tab "Święta" umożliwia niezależne zarządzanie dniami świątecznym poprzez dodawanie, edytowanie i usuwanie.

**Acceptance Scenarios**:

1. **Given** manager jest w zakładce "Święta", **When** tab się ładuje, **Then** widzi tabelę z dniami świątecznym
2. **Given** tabela dni świątecznych jest widoczna, **When** manager klika "+ Dodaj święto", **Then** pojawia się formularz z polami: Data, Nazwa, Opis (opcjonalnie)
3. **Given** nowy dzień święty jest dodawany, **When** manager wypełni formularz, **Then** dzień pojawia się w tabeli
4. **Given** dzień święty istnieje w tabeli, **When** manager klika "Edytuj", **Then** może zmienić dane

---

### User Story 6 - Manager definiuje reguły i limity godzin w zakładce "Reguły" (Priority: P2)

Manager przełącza się do zakładki "Reguły" i widzi dwie sekcje: "Limity godzin według etatu" i "Krytyczne wytyczne i reguły". Manager może definiować maksymalne godziny dla każdego etatu oraz dodawać reguły pracy.

**Why this priority**: Reguły i limity są ważne dla prawidłowego planowania grafików, ale mogą być wdrażane jako druga/trzecia iteracja.

**Independent Test**: Tab "Reguły" umożliwia niezależne zarządzanie limitami i regułami poprzez dodawanie, edytowanie i usuwanie.

**Acceptance Scenarios**:

1. **Given** manager jest w zakładce "Reguły", **When** tab się ładuje, **Then** widzi dwie sekcje: "Limity godzin według etatu" i "Krytyczne wytyczne i reguły"
2. **Given** sekcja limitów jest widoczna, **When** manager przygląda się tabeli, **Then** widzi kolumny: Etat, Max dziennie, Max tydzień, Max miesiąc, Max kwartał
3. **Given** manager klika "+ Dodaj limit", **When** pojawia się formularz, **Then** może wprowadzić nowy limit etatu
4. **Given** sekcja reguł jest widoczna, **When** manager klika "+ Dodaj regułę", **Then** pojawia się formularz do dodania nowej reguły

---

### User Story 7 - Przełączanie między zakładkami jest płynne i intuicyjne (Priority: P1)

Użytkownik kliknie na dowolną zakładkę (Wszyscy, Urlopy, Zwolnienia, Parametry zmian, Święta, Reguły) i natychmiast widzi zawartość tej zakładki bez konieczności przeładowania strony. Aktywna zakładka jest wyraźnie zaznaczona.

**Why this priority**: Doświadczenie użytkownika przy nawigacji między zakładkami jest fundamentalne.

**Independent Test**: Testowanie przełączania między wszystkimi sześcioma zakładkami – każda powinna ładować zawartość bez przeładowania strony i bez błędów.

**Acceptance Scenarios**:

1. **Given** użytkownik jest na stronie `/employees`, **When** klika na inny tab, **Then** zawartość zmienia się bez przeładowania strony
2. **Given** użytkownik zmienia tab, **When** przełącza się między tab, **Then** nie ma opóźnień w wyświetlaniu zawartości
3. **Given** użytkownik jest w dowolnym tab, **When** przygląda się interfejsowi, **Then** aktywny tab jest wyraźnie zaznaczony
4. **Given** przechodząc między tab, **When** wraca do poprzedniego tab, **Then** dane w poprzednim tab są zachowane

---

### Edge Cases

- **Brak pracowników**: Gdy lista pracowników jest pusta, wyświetlić komunikat "Brak pracowników" z przyciskiem "+ Dodaj pracownika"
- **Brak urlopów/zwolnień**: Gdy tabele są puste, wyświetlić komunikat "Brak zaplanowanych urlopów" z przyciskiem do dodania
- **Błąd przy ładowaniu danych**: Gdy API zwróci błąd, wyświetlić komunikat błędu z opcją ponownego załadowania
- **Daty nieprawidłowe**: Gdy data "Od" jest większa niż data "Do", pokazać komunikat o błędzie
- **Urwana sesja**: Gdy użytkownik straci połączenie z API, formularz powinien zachować wprowadzone dane
- **Wiele użytkowników jednocześnie**: Gdy dwaj managerowie edytują tych samych pracowników, drugi powinien zobaczyć ostrzeżenie

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

**Zakładka "Wszyscy"**

- **FR-001**: System MUSI wyświetlać listę wszystkich pracowników w tabeli z kolumnami: Imię i nazwisko, Stanowisko, Status, Etat
- **FR-002**: System MUSI umożliwić dodanie nowego pracownika poprzez formularz zawierający: Imię (obowiązkowe), Nazwisko (obowiązkowe), Stanowisko (lista rozwijana), Status (lista rozwijana), Etat (lista rozwijana)
- **FR-003**: System MUSI umożliwić edycję danych pracownika
- **FR-004**: System MUSI umożliwić usunięcie pracownika z potwierdzeniem
- **FR-005**: System MUSI walidować pola obowiązkowe (Imię, Nazwisko) i uniemożliwić zapisanie bez nich
- **FR-006**: System MUSI wyświetlać spinner/skeleton screen podczas ładowania listy

**Zakładka "Urlopy"**

- **FR-007**: System MUSI wyświetlać formularz "Zaplanuj urlop" z polami: Pracownik (lista rozwijana), Okres urlopu (zakresy dat), przycisk "Zaplanuj urlop"
- **FR-008**: System MUSI wyświetlać tabelę zaplanowanych urlopów z kolumnami: Pracownik, Od, Do, Liczba dni, Akcje
- **FR-009**: System MUSI automatycznie obliczać liczbę dni urlopu
- **FR-010**: System MUSI umożliwić edycję i usunięcie urlopu
- **FR-011**: System MUSI filtrować urlopy po roku/miesiącu
- **FR-012**: System MUSI pobierać urlopy z API `/api/nieobecnosci?typ=urlop`

**Zakładka "Zwolnienia"**

- **FR-013**: System MUSI wyświetlać formularz do dodawania zwolnień lekarskich z polami: Pracownik, Okres zwolnienia (daty), Notatki/Numer L4 (opcjonalne)
- **FR-014**: System MUSI wyświetlać tabelę zwolnień z kolumnami: Pracownik, Od, Do, Typ zwolnienia, Notatki, Akcje
- **FR-015**: System MUSI umożliwić edycję i usunięcie zwolnienia
- **FR-016**: System MUSI pobierać zwolnienia z API `/api/nieobecnosci?typ=zwolnienie`
- **FR-017**: System MUSI filtrować zwolnienia po roku

**Zakładka "Parametry zmian"**

- **FR-018**: System MUSI wyświetlać siedem sekcji (jeden dla każdego dnia tygodnia)
- **FR-019**: Każda sekcja MUSI zawierać: "Domyślne ustawienia zmian" i "Prowadzący zmianę"
- **FR-020**: Każda podsekcja MUSI zawierać trzy części zmian (Rano, Środek, Popoludniu) z polami: od (czas), do (czas), liczba obsad
- **FR-021**: System MUSI umożliwić dodanie dodatkowej zmiany poprzez "+ dodaj kolejną"
- **FR-022**: System MUSI umożliwić edycję i zapisanie parametrów dla każdego dnia

**Zakładka "Święta"**

- **FR-023**: System MUSI wyświetlać tabelę dni świątecznych z kolumnami: Data, Nazwa, Opis, Akcje
- **FR-024**: System MUSI umożliwić dodanie nowego dnia świętego
- **FR-025**: System MUSI umożliwić edycję i usunięcie dnia świętego
- **FR-026**: System MUSI umożliwić sortowanie tabeli

**Zakładka "Reguły"**

- **FR-027**: System MUSI wyświetlać dwie sekcje: "Limity godzin według etatu" i "Krytyczne wytyczne i reguły"
- **FR-028**: Sekcja limitów MUSI zawierać tabelę z kolumnami: Etat, Max dziennie, Max tydzień, Max miesiąc, Max kwartał, Akcje
- **FR-029**: System MUSI umożliwić dodanie, edycję i usunięcie limitów etatu
- **FR-030**: System MUSI umożliwić dodanie, edycję i usunięcie reguł

**Nawigacja ogólna**

- **FR-031**: System MUSI wyświetlać sześć zakładek: "Wszyscy", "Urlopy", "Zwolnienia", "Parametry zmian", "Święta", "Reguły"
- **FR-032**: System MUSI umożliwić przełączanie między zakładkami bez przeładowania strony
- **FR-033**: System MUSI wyraźnie zaznaczać aktywną zakładkę
- **FR-034**: Domyślnie zakładka "Wszyscy" MUSI być aktywna
- **FR-035**: System MUSI obsługiwać query param `?tab=urlopy` dla deep linking
- **FR-036**: System MUSI walidować dane formularza przed wysłaniem
- **FR-037**: System MUSI wyświetlać komunikaty błędów użytkownikowi
- **FR-038**: System MUSI zastosować optymistyczne UI - aktualizować widok przed API
- **FR-039**: Brak błędów JavaScript w konsoli

### Key Entities

- **Employee (Pracownik)**: Reprezentuje pracownika z atrybutami: id, imię, nazwisko, stanowisko, status (Aktywny/Na urlopie/Chorobowe), etat (0.25/0.5/0.75/1.0)

- **Absence (Nieobecnosc)**: Reprezentuje urlop lub zwolnienie lekarskie z atrybutami: id, pracownik_id (klucz obcy), data_od, data_do, typ ("urlop" lub "zwolnienie"), powód/notatki

- **ShiftParameter (Parametr Zmiany)**: Reprezentuje konfigurację zmian dla dnia tygodnia z atrybutami: id, dzień_tygodnia, typ_zmiany (Rano/Środek/Popoludniu), godzina_od, godzina_do, liczba_obsad, czy_prowadzący

- **Holiday (Święto)**: Reprezentuje dzień święty z atrybutami: id, data, nazwa, opis

- **HourLimit (Limit Godzin)**: Reprezentuje limit godzin dla etatu z atrybutami: id, etat, max_dziennie, max_tygodniowo, max_miesięcznie, max_kwartalnie

- **Rule (Reguła)**: Reprezentuje regułę pracy z atrybutami: id, nazwa, opis

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Użytkownik może przełączać się między wszystkimi sześcioma zakładkami bez opóźnień (<200ms)
- **SC-002**: Dodanie nowego pracownika z formularza zajmuje mniej niż 30 sekund
- **SC-003**: Lista pracowników ładuje się w mniej niż 2 sekundy dla 500+ pracowników
- **SC-004**: Tabela urlopów filtruje się po roku/miesiącu w mniej niż 1 sekundzie
- **SC-005**: 95% formularzy jest walidowanych przed wysłaniem
- **SC-006**: System obsługuje jednocześnie 100+ użytkowników bez degradacji
- **SC-007**: Wszystkie elementy są responsywne (mobile, tablet, desktop)
- **SC-008**: Brak błędów JavaScript w konsoli podczas normalnego użytkowania
- **SC-009**: Ponad 90% użytkowników znajduje i dodaje nowy urlop bez problemu
- **SC-010**: Po usunięciu pracownika znika z listy w mniej niż 2 sekundy
- **SC-011**: Potwierdzenie przed usunięciem zmniejsza ryzyko usunięć o 99%
- **SC-012**: Aktywna zakładka jest wyraźnie rozpoznawana 100% użytkowników
- **SC-013**: Formularz "Zaplanuj urlop" zawiera wszystkie wymagane pola
- **SC-014**: System prawidłowo oblicza liczbę dni urlopu dla dowolnego zakresu
- **SC-015**: Wszystkie dane są type-safe (TypeScript bez `any`)
- **SC-016**: Integracja z Radix UI Tabs zapewnia dostępność WCAG

---

## Additional Implementation Context

### Frontend Implementation Details

**File Location**: `frontend/app/employees/page.tsx`

**UI Library**: Radix UI Tabs
```tsx
import * as Tabs from '@radix-ui/react-tabs'

<Tabs.Root defaultValue="all">
  <Tabs.List>
    <Tabs.Trigger value="all">Wszyscy</Tabs.Trigger>
    <Tabs.Trigger value="urlopy">Urlopy</Tabs.Trigger>
    <Tabs.Trigger value="zwolnienia">Zwolnienia</Tabs.Trigger>
    <Tabs.Trigger value="parametry">Parametry zmian</Tabs.Trigger>
    <Tabs.Trigger value="swieta">Święta</Tabs.Trigger>
    <Tabs.Trigger value="reguly">Reguły</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="all">{/* Lista pracowników */}</Tabs.Content>
  <Tabs.Content value="urlopy">{/* Lista urlopów */}</Tabs.Content>
  <Tabs.Content value="zwolnienia">{/* Lista zwolnień */}</Tabs.Content>
  <Tabs.Content value="parametry">{/* Parametry zmian */}</Tabs.Content>
  <Tabs.Content value="swieta">{/* Święta */}</Tabs.Content>
  <Tabs.Content value="reguly">{/* Reguły */}</Tabs.Content>
</Tabs.Root>
```

**Styling**: Tailwind CSS zgodnie z istniejącym stylem aplikacji
- Active tab: `bg-background text-foreground shadow-sm`
- Inactive tab: `text-muted-foreground`
- Layout: `rounded-sm px-3 py-1.5`

**Deep Linking**: Obsługa query param `?tab=urlopy` dla linków do konkretnych zakładek

### Backend Integration

**Istniejące API endpoints**: `/api/nieobecnosci` (Absences)

**Filtrowanie po typie** (pole `typ` w modelu `Nieobecnosc`):
- `"urlop"` - urlop
- `"zwolnienie"` - zwolnienie lekarskie

**Dostępne endpointy**:
- `GET /api/nieobecnosci` - lista wszystkich
- `GET /api/nieobecnosci?typ=urlop` - lista urlopów
- `GET /api/nieobecnosci?typ=zwolnienie` - lista zwolnień
- `POST /api/nieobecnosci` - dodanie
- `PUT /api/nieobecnosci/{id}` - edycja
- `DELETE /api/nieobecnosci/{id}` - usunięcie

**Istniejące API dla pracowników**: `/api/pracownicy`

### Assumptions

1. Stanowiska (Kierownik, Z-ca kierownika, SSK, Kasjer) są stałe w systemie
2. Statusy pracownika (Aktywny, Na urlopie, Chorobowe) są wystarczające
3. Etaty (1.0, 0.75, 0.5, 0.25) pokrywają wszystkie przypadki
4. API zwraca dane w formacie JSON
5. Walidacja po stronie klienta wystarczy (backend ma backup)
6. Liczba dni urlopu = liczba dni między datą od a datą do (włącznie)
7. Tabele są domyślnie sortowane po dacie dodania (malejąco)
8. Usunięcia są trwałe i nie mogą być przywrócone
9. Tylko managerowie/administratorzy mają dostęp do `/employees`
10. Wszystkie daty są w strefie czasowej serwera
11. Przeciętny czas odpowiedzi API < 500ms
12. W konkurencji: ostatnia edycja wygrywa (last-write-wins)

---

**Ostatnia aktualizacja**: 2025-11-10
**Status**: Specification Complete - Ready for Quality Validation Checklist
