# Plan 3 – Przebudowa zakładki Pracownicy

**Data**: 2025-11-10  
**Branch**: `002-edycja-zakladek`  
**Status**: 🔵 Planowanie

---

## 🎯 Cel

Przebudowa UI zakładki "Pracownicy" z dodaniem systemu tabs (zakładek) wzorowanego na nowoczesnym interfejsie:
- Tab "Wszyscy" - lista pracowników
- Tab "Urlopy" - zarządzanie urlopami
- Tab "Zwolnienia" - zarządzanie zwolnieniami lekarskimi

Docelowo: usunięcie osobnej zakładki "Nieobecności" z sidebar (na końcu procesu).

---

## 📋 Struktura zakładek

```
Pracownicy (/employees)
├─ Tab: "Wszyscy" 
│  └─ Lista wszystkich pracowników (jak obecnie)
│     - Tabela z danymi: imię, nazwisko, rola, etat
│     - Możliwość edycji pracownika
│     - Sekcja preferencji (rozwijana)
│     - Przycisk "Dodaj pracownika"
│
├─ Tab: "Urlopy"
│  └─ Zarządzanie urlopami
│     - Lista urlopów wszystkich pracowników
│     - Kolumny: pracownik, data od-do, status, liczba dni
│     - Przycisk "Dodaj urlop"
│     - Formularz: wybór pracownika, daty, typ urlopu
│
└─ Tab: "Zwolnienia"
   └─ Zarządzanie zwolnieniami lekarskimi
      - Lista zwolnień wszystkich pracowników
      - Kolumny: pracownik, data od-do, typ zwolnienia
      - Przycisk "Dodaj zwolnienie"
      - Formularz: wybór pracownika, daty, kod zwolnienia
```

---

## 🔧 Plan techniczny

### Frontend

**Plik główny**: `frontend/app/employees/page.tsx`

**Biblioteka UI**: Radix UI Tabs
```tsx
import * as Tabs from '@radix-ui/react-tabs'

<Tabs.Root defaultValue="all">
  <Tabs.List>
    <Tabs.Trigger value="all">Wszyscy</Tabs.Trigger>
    <Tabs.Trigger value="urlopy">Urlopy</Tabs.Trigger>
    <Tabs.Trigger value="zwolnienia">Zwolnienia</Tabs.Trigger>
  </Tabs.List>
  
  <Tabs.Content value="all">{/* Lista pracowników */}</Tabs.Content>
  <Tabs.Content value="urlopy">{/* Lista urlopów */}</Tabs.Content>
  <Tabs.Content value="zwolnienia">{/* Lista zwolnień */}</Tabs.Content>
</Tabs.Root>
```

**Style**: Tailwind CSS (zgodnie z obecnym stylem aplikacji)
- Active tab: `bg-background text-foreground shadow-sm`
- Inactive tab: `text-muted-foreground`
- Layout: `rounded-sm px-3 py-1.5`

### Backend

**Wykorzystanie obecnego API**: `/api/nieobecnosci`

**Rozróżnienie typów** (pole `typ` w modelu `Nieobecnosc`):
- `"urlop"` - urlop
- `"zwolnienie"` - zwolnienie lekarskie
- `"inne"` - pozostałe (legacy)

**Endpointy** (już istniejące):
- `GET /api/nieobecnosci` - lista wszystkich nieobecności
- `POST /api/nieobecnosci` - dodanie nieobecności
- `PUT /api/nieobecnosci/{id}` - edycja nieobecności
- `DELETE /api/nieobecnosci/{id}` - usunięcie nieobecności

**Query params** (do dodania w frontend):
- `?typ=urlop` - filtrowanie urlopów
- `?typ=zwolnienie` - filtrowanie zwolnień

### Routing

**Obecny**: `/employees` - jedna strona bez zakładek

**Docelowy**: `/employees` - jedna strona z tabs (bez zmiany URL)
- State zarządzany przez Radix UI Tabs
- Opcjonalnie: query params `?tab=urlopy` dla deep linking

---

## 🚀 Etapy implementacji

### Faza 1: Przygotowanie komponentów ✅ (planowanie)
- [x] Utworzenie `plan3.md`
- [ ] Instalacja zależności: `@radix-ui/react-tabs`
- [ ] Struktura komponentów:
  - `EmployeesTab` - obecna lista pracowników
  - `UrlopyTab` - nowy komponent dla urlopów
  - `ZwolnieniaTab` - nowy komponent dla zwolnień

### Faza 2: Implementacja zakładki "Wszyscy"
- [ ] Refaktor obecnego kodu do komponentu `EmployeesTab`
- [ ] Zachowanie wszystkich funkcji (dodawanie, edycja, preferencje)
- [ ] Integracja z Radix UI Tabs
- [ ] Testy manualne

### Faza 3: Implementacja zakładki "Urlopy"
- [ ] Komponent `UrlopyTab` z listą urlopów
- [ ] Fetch `/api/nieobecnosci?typ=urlop`
- [ ] Formularz dodawania urlopu
- [ ] Tabela z danymi: pracownik, data od-do, liczba dni, status
- [ ] Przyciski: Dodaj, Edytuj, Usuń

### Faza 4: Implementacja zakładki "Zwolnienia"
- [ ] Komponent `ZwolnieniaTab` z listą zwolnień
- [ ] Fetch `/api/nieobecnosci?typ=zwolnienie`
- [ ] Formularz dodawania zwolnienia
- [ ] Tabela z danymi: pracownik, data od-do, typ zwolnienia
- [ ] Przyciski: Dodaj, Edytuj, Usuń

### Faza 5: Cleanup (na końcu projektu)
- [ ] Usunięcie zakładki "Nieobecności" z sidebar (`frontend/components/Sidebar.tsx`)
- [ ] Usunięcie pliku `frontend/app/absences/page.tsx`
- [ ] Aktualizacja dokumentacji
- [ ] Testy e2e Playwright

---

## 📊 Model danych

### Nieobecnosc (backend/models.py)

```python
class Nieobecnosc(Base):
    __tablename__ = "nieobecnosci"
    
    id = Column(Integer, primary_key=True)
    pracownik_id = Column(Integer, ForeignKey("pracownicy.id"))
    data_od = Column(Date, nullable=False)
    data_do = Column(Date, nullable=False)
    typ = Column(String(50), nullable=False)  # "urlop", "zwolnienie", "inne"
    powod = Column(String(500))
    utworzono = Column(DateTime, default=datetime.utcnow)
```

### Frontend types

```typescript
type Nieobecnosc = {
  id: number;
  pracownik_id: number;
  data_od: string; // ISO date
  data_do: string; // ISO date
  typ: "urlop" | "zwolnienie" | "inne";
  powod?: string;
  utworzono: string;
};

type Employee = {
  id: number;
  imie: string;
  nazwisko: string;
  rola_id: number | null;
};
```

---

## 🎨 UI/UX Mockup

### Tab Navigation
```
┌─────────────────────────────────────────────────────────┐
│  Pracownicy                                              │
├─────────────────────────────────────────────────────────┤
│  [Wszyscy] [Urlopy] [Zwolnienia]                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  (zawartość wybranego taba)                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Tab "Wszyscy"
```
┌─────────────────────────────────────────────────────────┐
│  [+ Dodaj pracownika]                           [Filtr] │
├─────────────────────────────────────────────────────────┤
│  Imię      Nazwisko    Rola         Etat      Akcje    │
│  Jan       Kowalski    Kierownik    1.0       [Edytuj]  │
│  Anna      Nowak       Sprzedawca   0.5       [Edytuj]  │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

### Tab "Urlopy"
```
┌─────────────────────────────────────────────────────────┐
│  [+ Dodaj urlop]                      [Filtruj: 2025]  │
├─────────────────────────────────────────────────────────┤
│  Pracownik    Od          Do          Dni    Akcje     │
│  Jan Kowalski 2025-06-01  2025-06-14  14    [Usuń]     │
│  Anna Nowak   2025-07-10  2025-07-24  14    [Usuń]     │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

### Tab "Zwolnienia"
```
┌─────────────────────────────────────────────────────────┐
│  [+ Dodaj zwolnienie]                [Filtruj: 2025]   │
├─────────────────────────────────────────────────────────┤
│  Pracownik    Od          Do          Typ      Akcje   │
│  Jan Kowalski 2025-03-01  2025-03-07  L4       [Usuń]  │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Kryteria akceptacji

### Funkcjonalne
- [ ] Użytkownik widzi 3 zakładki na stronie `/employees`
- [ ] Przełączanie między zakładkami działa płynnie
- [ ] Tab "Wszyscy" zachowuje wszystkie obecne funkcje
- [ ] Tab "Urlopy" pokazuje tylko urlopy (typ="urlop")
- [ ] Tab "Zwolnienia" pokazuje tylko zwolnienia (typ="zwolnienie")
- [ ] Możliwość dodawania urlopów z formularza
- [ ] Możliwość dodawania zwolnień z formularza
- [ ] Możliwość usuwania urlopów i zwolnień
- [ ] Filtrowanie po roku/miesiącu

### Techniczne
- [ ] Brak błędów w konsoli
- [ ] Responsywny layout (mobile, tablet, desktop)
- [ ] Zgodność z istniejącym stylem aplikacji (Tailwind CSS)
- [ ] Wykorzystanie Radix UI Tabs
- [ ] Type-safe TypeScript (brak `any`)
- [ ] Optymistyczne UI (aktualizacja przed odpowiedzią API)

### UX
- [ ] Active tab wyraźnie zaznaczony
- [ ] Ładowanie danych pokazuje spinner/skeleton
- [ ] Komunikaty błędów są czytelne
- [ ] Formularz waliduje dane przed wysłaniem
- [ ] Potwierdzenie przed usunięciem

---

## � Ustalenia szczegółowe

### 1.1. Wygląd listy pracowników

Ustalono, że lista pracowników w zakładce "Wszyscy" będzie miała wygląd zgodny z dostarczonym zrzutem ekranu. Główne kolumny to "Imię i nazwisko", "Stanowisko", "Status" (z zieloną etykietą "Aktywny") oraz "Etat".

### 1.2. Formularz dodawania nowego pracownika

Obecny formularz zawiera pola:
- Imię* (obowiązkowe)
- Nazwisko* (obowiązkowe)
- Rola
- Etat
- Limit godzin / miesiąc
- Data zatrudnienia

Nowy formularz będzie zawierać następujące pola (przebudowany wygląd):

- **Imię** - pole tekstowe (obowiązkowe)
- **Nazwisko** - pole tekstowe (obowiązkowe)
- **Stanowisko** - lista rozwijana z opcjami (obowiązkowe):
  - Kierownik
  - Z-ca kierownika
  - SSK
  - Kasjer
- **Status** - lista rozwijana z opcjami (obowiązkowe):
  - Aktywny
  - Na urlopie
  - Chorobowe
- **Etat** - lista rozwijana z opcjami (obowiązkowe):
  - Pełen etat (1.0)
  - 3/4 etatu (0.75)
  - 1/2 etatu (0.5)
  - 1/4 etatu (0.25)

Pola opcjonalne (jeśli potrzebne):
- Limit godzin / miesiąc
- Data zatrudnienia

Przycisk "Zapisz zmiany" zapisze nowego pracownika, przycisk "Anuluj" zamknie formularz.

**TODO**: Sprawdzić z jakimi plikami "nowy pracownik" był skorelowany - identyfikacja zależności i wpływ na backend.

### 1.3. Stanowiska (Role)

Obecnie stanowiska zarządzane są w Settings > Role. Po przebudowie strona ustawień "Role" będzie usunięta, a zarządzanie stanowiskami zostanie przeniesione do zakładki "Pracownicy" (implementacja szczegółów do ustalenia).

Dostępne stanowiska:
- Kierownik
- Z-ca kierownika
- SSK
- Kasjer

### 1.4. Menu akcji w liście pracowników

Pod trzema kropkami (...) w ostatniej kolumnie tabeli pracowników znajduje się menu rozwijane z opcjami:
- **Edytuj** - otwiera formularz edycji pracownika
- **Usuń** - usuwa pracownika z listy

### 1.4. Zakładka "Urlopy"

- **Formularz "Zaplanuj urlop"** po lewej stronie z polami:
  - Pracownik (lista rozwijana "Wybierz pracownika")
  - Okres urlopu - pole "Wybierz zakres dat" z ikoną kalendarza
  - Przycisk "Zaplanuj urlop"

- **Tabelę "Zaplanowane urlopy"** po prawej stronie z kolumnami:
  - Pracownik
  - Od (data)
  - Do (data)
  - Akcje

### 1.5. Zakładka "Zwolnienia lekarskie"

Podobnie jak zakładka "Urlopy", zawiera:
- Formularz dodawania zwolnienia lekarskiego z polami: Pracownik, Okres zwolnienia (data od-do), Notatki/Numer L4
- Tabelę zarejestrowanych zwolnień z kolumnami: Pracownik, Od, Do, Notatki, Akcje
- Przycisk "Dodaj zwolnienie" w górnej części

### 1.6. Dodatkowe zakładki na stronie Pracownicy

Poza zakładkami "Wszyscy", "Urlopy", "Zwolnienia lekarskie" będą jeszcze:
- **Parametry zmian**
- **Święta**
- **Reguły**

#### 1.6.1. Zakładka "Parametry zmian"

Łączy obecne ustawienia z dwóch sekcji:
- Settings > Wymagania obsadowe
- Settings > Zmiany

Struktura dla każdego dnia tygodnia (np. Poniedziałek):

**Sekcja "Domyślne ustawienia zmian":**
- Rano: od (czas), do (czas), liczba obsad (liczba)
- Środek: od (czas), do (czas), liczba obsad (liczba)
- Popoludniu: od (czas), do (czas), liczba obsad (liczba)

**Sekcja "Prowadzący zmianę":**
- Rano: od (czas), do (czas), liczba obsad (liczba)
- Środek: od (czas), do (czas), liczba obsad (liczba)
- Popoludniu: od (czas), do (czas), liczba obsad (liczba)

Przycisk "+ dodaj kolejną" poniżej każdej sekcji do dodawania dodatkowych zmian.

Analogiczne sekcje dla wszystkich dni tygodnia:
- Poniedziałek
- Wtorek
- Środa
- Czwartek
- Piątek
- Sobota
- Niedziela

**WAŻNE**: Pole "Prowadzący zmianę" jest kluczowe i musi być uwzględnione (szczegółowe wyjaśnienie w zakładce "Reguły").

#### 1.6.2. Zakładka "Święta"

Funkcjonalność pozostaje jak dotychczas (brak zmian w logice), należy tylko dostosować wygląd/UI do reszty interfejsu aplikacji (Radix UI, Tailwind CSS, spójny design z pozostałymi zakładkami).

#### 1.6.3. Zakładka "Reguły"

Zawiera dwie sekcje:

**Sekcja 1: Limity godzin według etatu**

Tabela "Limity godzin według etatu" z kolumnami:
- Etat (0.75, 1.0, itd.)
- Max dziennie (liczba godzin)
- Max tydzień (liczba godzin)
- Max miesiąc (liczba godzin)
- Max kwartał (liczba godzin)
- Akcje (Edytuj, Usuń)

Ta sekcja będzie przeniesiona z obecnej lokalizacji w Settings (obecnie "Limity godzin według etatu").

Przycisk "+ Dodaj limit" do dodawania nowych limitów etatu.

**Sekcja 2: Krytyczne wytyczne i reguły**

Umożliwia dodawanie i zarządzanie regułami i wytycznymi, takimi jak:
- Reguły z prawa pracy
- Minimalna liczba godzin między zmianami
- Inne reguły

Interfejs do dodawania nowych reguł (szczegóły implementacji do ustalenia - może być formularz, lista, czy inny format).

**TODO**: Sprawdzić gdzie w bazie danych przechowywane są te reguły i jak są obecnie wykorzystywane w aplikacji.

## 📌 Dodatkowe ustalenia

### Sidebar

- **Logo** (`frontend/logo.png`) - umieszczone w górnej części sidebar (logo "Ladybird" z biedronką)
- **Menu główne** (chowane/collapsible):
  - Pulpit (ikona domu)
  - Grafiki (ikona kalendarza)
  - Pracownicy (ikona użytkowników)
  - Raporty (ikona dokumentu)
- **Sekcja ustawień** na dole:
  - Ustawienia (ikona engielki z tekstem "Ustawienia")

---

## 🔄 Status zmian

**Aktualny stan**:
- Gałąź: `002-edycja-zakladek`
- Ostatni commit: `Fix: remove duplicate header in start_app.ps1`
- Pliki zmodyfikowane: `start_app.ps1`, `start_backend.ps1`, `start_frontend.ps1`

**Następne kroki**:
1. Zainstalować `@radix-ui/react-tabs`
2. Utworzyć strukturę komponentów
3. Zaimplementować Tab "Wszyscy" (refaktor)
4. Zaimplementować Tab "Urlopy"
5. Zaimplementować Tab "Zwolnienia"

---

## 📝 Notatki

## 📝 Notatki

- **Radix UI Tabs**: Accessible, unstyled, composable - idealny do projektu
- **Filtrowanie**: Backend już wspiera query params, frontend musi dodać `?typ=urlop`
- **Backwards compatibility**: Stara strona `/absences` działa do momentu usunięcia
- **Deep linking**: Opcjonalnie dodać `?tab=urlopy` w URL dla sharable links

---

## 🔄 Uwagi do strony "Generator Grafików AI" (/schedule)

### Funkcjonalności do pominięcia na razie:
- ❌ Sugestie Optymalizacji (będą później)
- ❌ Walidacja grafiku pracy (będzie później)
- ❌ Optymalizuj Balans (będzie później)
- ❌ Pokaż payload AI (będzie później)

### Funkcjonalności do realizacji w przyszłości (nie teraz):
- 📊 **PDF Export** - Zapis grafiku jako PDF (przyciski "PDF" i "CSV" w górnej sekcji)
- 📊 **CSV Export** - Zapis grafiku jako CSV

### Obecny fokus:
- ✅ **Kalendarz** - główna funkcja na razie
- ✅ Generowanie grafiku (heurystyka, OR-Tools)
- ✅ Nawigacja po miesiącach
- ✅ Diagnostyka (czas, wpisów, błędy, ostrzeżenia)

**Status**: Skupienie na **Kalendarzu** - reszta funkcjonalności dojdzie później

---

**Ostatnia aktualizacja**: 2025-11-10  
**Autor**: Plan 3 - Przebudowa UI Pracownicy
