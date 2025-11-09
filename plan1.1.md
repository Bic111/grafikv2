Zakładamy, że pracujemy w module `core/generator.py` w backendzie Pythona. Będziemy korzystać z solvera **CP-SAT** z OR-Tools, który jest doskonały do problemów z planowaniem i harmonogramowaniem.

---

### **Szczegółowy Plan Implementacji Silnika Generującego OR-Tools (CP-SAT)**

#### **Moduł:** `core/generator.py`
#### **Zależności:** `ortools.sat.python.cp_model`, `pandas` (do przetwarzania danych)

**Krok 1: Definicja Klas i Struktur Danych Dla OR-Tools (Model Domena)**

Zanim zaczniesz budować model CP-SAT, musisz mieć jasno zdefiniowane obiekty, które będą reprezentować Twoje dane wejściowe i wyjściowe w sposób zrozumiały dla generatora.

*   **`Pracownik`:** (id, rola_id, etat, preferencje_dni_wolnych, preferencje_zmian).
*   **`Zmiana`:** (id, nazwa, godzina_start, godzina_end).
*   **`Rola`:** (id, nazwa_roli).
*   **`Dzień`:** (data, dzień_tygodnia, czy_swieto).
*   **`WymaganiaObsadowe`:** Struktura danych przechowująca ile minimalnie i maksymalnie pracowników danej roli jest potrzebnych na danej zmianie w konkretnym dniu tygodnia (np. słownik `wymagania[dzien_tygodnia][zmiana_id][rola_id] = {'min': X, 'max': Y}`).
*   **`Nieobecność`:** (pracownik_id, data_od, data_do, typ).
*   **`WzorzecHistoryczny`:** (pracownik_id, data, zmiana_id) – zaimportowane dane z Excela, służące jako "miękkie" sugestie lub źródło wiedzy o preferowanych rotacjach.

**Krok 2: Klasa `GrafikGenerator`**

Stwórz klasę, która będzie enkapsulować całą logikę generowania.

```python
from ortools.sat.python import cp_model
import datetime
import pandas as pd # Do potencjalnego przetwarzania danych i obsługi dat

class GrafikGenerator:
    def __init__(self, pracownicy, zmiany, role, wymagania_obsadowe, nieobecnosci, swieta, parametry_generatora, wzorce_historyczne):
        self.pracownicy = pracownicy # Lista obiektów Pracownik
        self.zmiany = zmiany         # Lista obiektów Zmiana
        self.role = role             # Lista obiektów Rola
        self.wymagania_obsadowe = wymagania_obsadowe # Słownik/DataFrame z obsadą
        self.nieobecnosci = nieobecnosci # Lista obiektów Nieobecność
        self.swieta = swieta         # Lista obiektów Święto
        self.parametry = parametry_generatora # Słownik parametrów (max nocne, min wolne)
        self.wzorce_historyczne = wzorce_historyczne # Słownik/DataFrame z wzorcami

        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.solver.parameters.log_search_progress = True # Przydatne do debugowania
        self.solver.parameters.max_time_in_seconds = 60 # Limit czasu na generowanie
        # Dodatkowe parametry solvera dla lepszej wydajności/równomierności

        self.start_date = None
        self.end_date = None
        self.days = []
        self.vars = {} # Przechowa zmienne decyzyjne

    def generate_schedule(self, year, month):
        self.start_date = datetime.date(year, month, 1)
        self.end_date = (datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)) if month < 12 else datetime.date(year + 1, 1, 1) - datetime.timedelta(days=1)
        self.days = [self.start_date + datetime.timedelta(days=i) for i in range((self.end_date - self.start_date).days + 1)]

        self._create_decision_variables()
        self._add_hard_constraints()
        self._add_soft_constraints()
        self._set_objective()

        status = self.solver.Solve(self.model)

        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            return self._extract_solution()
        else:
            print("Nie znaleziono optymalnego ani dopuszczalnego rozwiązania.")
            return None

    # Pozostałe metody implementowane poniżej
```

**Krok 3: Tworzenie Zmiennych Decyzyjnych (`_create_decision_variables`)**

Zmienną decyzyjną będzie `work[p][d][s]`, która będzie `1` jeśli pracownik `p` pracuje w dniu `d` na zmianie `s`, i `0` w przeciwnym razie.

```python
    def _create_decision_variables(self):
        for p in self.pracownicy:
            for d_obj in self.days:
                for s in self.zmiany:
                    # Zmienna decyzyjna: czy pracownik p pracuje w dniu d na zmianie s
                    self.vars[(p.id, d_obj, s.id)] = self.model.NewBoolVar(f'work_{p.id}_{d_obj.isoformat()}_{s.id}')

        # Dodatkowe zmienne pomocnicze mogą być potrzebne (np. 'czy pracownik p pracuje w dniu d', 'ile godzin pracuje p w dniu d')
        # Zmienna: czy pracownik p pracuje w danym dniu (na dowolnej zmianie)
        self.daily_work_vars = {}
        for p in self.pracownicy:
            for d_obj in self.days:
                self.daily_work_vars[(p.id, d_obj)] = self.model.NewBoolVar(f'daily_work_{p.id}_{d_obj.isoformat()}')
                self.model.AddBoolOr([self.vars[(p.id, d_obj, s.id)] for s in self.zmiany]) == self.daily_work_vars[(p.id, d_obj)]

        # Zmienna: ile godzin pracuje pracownik w danym dniu (do walidacji odpoczynków itp.)
        # Może wymagać bardziej złożonego modelowania lub być obliczana po rozwiązaniu
```

**Krok 4: Dodawanie Twardych Ograniczeń (`_add_hard_constraints`)**

To są bezwzględne reguły, które MUSZĄ być spełnione. Jeśli nie da się ich spełnić, solver nie znajdzie rozwiązania.

*   **Jeden pracownik, jedna zmiana dziennie:**
    ```python
    for p in self.pracownicy:
        for d_obj in self.days:
            # Suma wszystkich zmian dla pracownika p w dniu d musi być <= 1
            self.model.Add(sum(self.vars[(p.id, d_obj, s.id)] for s in self.zmiany) <= 1)
    ```
*   **Wymagana obsada zmian:**
    ```python
    for d_obj in self.days:
        day_of_week_str = d_obj.strftime('%A') # np. 'Monday'
        for s in self.zmiany:
            for r in self.role:
                req = self.wymagania_obsadowe.get(day_of_week_str, {}).get(s.id, {}).get(r.id, {'min': 0, 'max': len(self.pracownicy)})
                # Suma pracowników z rolą r na zmianie s w dniu d
                employees_on_shift_role = [
                    self.vars[(p.id, d_obj, s.id)]
                    for p in self.pracownicy if p.rola_id == r.id
                ]
                self.model.Add(sum(employees_on_shift_role) >= req['min'])
                self.model.Add(sum(employees_on_shift_role) <= req['max'])
    ```
*   **Nieobecności (Urlopy, L4):**
    ```python
    for n in self.nieobecnosci:
        for d_obj in self.days:
            if n.data_od <= d_obj <= n.data_do:
                for s in self.zmiany:
                    self.model.Add(self.vars[(n.pracownik_id, d_obj, s.id)] == 0) # Pracownik nie może pracować
    ```
*   **Odpoczynek dobowy (11 godzin):** Bardzo złożone, wymaga iterowania po dniach i analizy godzin zmian.
    ```python
    # Zmienne pomocnicze do określania, kiedy pracownik zakończył i rozpoczął pracę
    # finish_time[p][d] = czas zakończenia ostatniej zmiany pracownika p w dniu d
    # start_time[p][d] = czas rozpoczęcia pierwszej zmiany pracownika p w dniu d
    # (Te zmienne musiałyby być zdefiniowane w _create_decision_variables za pomocą NewIntVar i AddAbs/AddMin/AddMax)

    for p in self.pracownicy:
        for i in range(len(self.days) - 1):
            d_current = self.days[i]
            d_next = self.days[i+1]

            # Jeśli pracownik pracuje w d_current
            # finish_current_shift_time = suma(self.vars[(p.id, d_current, s.id)] * s.godzina_zakonczenia dla s w self.zmiany)
            # Jeśli pracownik pracuje w d_next
            # start_next_shift_time = suma(self.vars[(p.id, d_next, s.id)] * s.godzina_rozpoczecia dla s w self.zmiany)

            # Ograniczenie: (24h - finish_current_shift_time) + start_next_shift_time >= 11h
            # Trzeba ostrożnie modelować zmiany przechodzące przez północ (godziny > 24 lub -24)
            # ... to jest najtrudniejsza część modelowania czasu w CP-SAT
            # Często rozwiązuje się to tworząc zmienne boolowskie dla "pracownik pracuje na nocnej zmianie"
            # i dodając AddImplication dla "jeśli pracownik pracuje na nocnej, to następnego dnia nie może pracować przed X godziną"
    ```
*   **Odpoczynek tygodniowy (35 godzin):** Podobnie jak dobowy, wymaga sumowania odpoczynków w cyklach tygodniowych.
*   **Limit godzin per etat (miesięczny):**
    ```python
    for p in self.pracownicy:
        total_hours = self.model.NewIntVar(0, p.limit_godzin_miesieczny * 2, f'total_hours_{p.id}') # Max, żeby nie przekroczyć
        self.model.Add(total_hours == sum(self.vars[(p.id, d_obj, s.id)] * s.czas_trwania_godz for d_obj in self.days for s in self.zmiany))
        self.model.Add(total_hours <= p.limit_godzin_miesieczny)
        # Dodatkowo można liczyć dolny limit, aby zapewnić minimalną liczbę godzin dla etatu
    ```
*   **Praca w niedziele/święta:** Ograniczenia na liczbę pracujących weekendów, wymagane dni wolne po pracy w niedzielę.
*   **Zasada po nocnej zmianie:** Konkretne wymagania co do odpoczynku po zmianie nocnej.

**Krok 5: Dodawanie Miękkich Ograniczeń (`_add_soft_constraints`)**

Te reguły nie muszą być spełnione, ale ich złamanie dodaje "karę" do funkcji celu.

*   **Preferencje dni wolnych:**
    ```python
    # Penalizacja za przydzielenie pracy w preferowany dzień wolny
    for p in self.pracownicy:
        for d_obj in p.preferencje_dni_wolnych: # Lista dat
            if (p.id, d_obj, s.id) in self.vars:
                # Jeśli pracownik p pracuje w preferowany dzień wolny d_obj (na dowolnej zmianie)
                # Doday karę do funkcji celu (patrz niżej)
                pass # Użyj AddBoolOr dla sumy zmian
    ```
*   **Preferencje zmian:** Penalizacja za przydzielenie niepreferowanej zmiany.
*   **Rotacja zmian:** Penalizacja za zbyt wiele zmian nocnych pod rząd, brak odpowiedniej rotacji.
*   **Równomierne obciążenie:** Stara się, aby wszyscy pracownicy mieli zbliżoną liczbę godzin.
*   **Wykorzystanie Wzorców Historycznych:** Zbliżanie się do wzorców z Excela.

**Krok 6: Definiowanie Funkcji Celu (`_set_objective`)**

Funkcja celu jest tym, co solver próbuje minimalizować (najczęściej sumę kar za naruszenie miękkich ograniczeń) lub maksymalizować (np. sumę spełnionych preferencji).

```python
    def _set_objective(self):
        # Stwórz listę zmiennych, które będą reprezentować "kary"
        soft_constraints_penalties = []

        # Przykład: Kara za pracę w preferowany dzień wolny
        for p in self.pracownicy:
            for d_obj in p.preferencje_dni_wolnych:
                if d_obj in self.days: # Upewnij się, że dzień należy do bieżącego miesiąca
                    # Jeśli pracownik p pracuje w d_obj
                    is_working_on_pref_day_var = self.model.NewBoolVar(f'penalty_pref_day_{p.id}_{d_obj.isoformat()}')
                    # Jeśli self.daily_work_vars[(p.id, d_obj)] jest True, to is_working_on_pref_day_var jest True
                    self.model.Add(is_working_on_pref_day_var == 1).OnlyEnforceIf(self.daily_work_vars[(p.id, d_obj)])
                    self.model.Add(is_working_on_pref_day_var == 0).OnlyEnforceIf(self.daily_work_vars[(p.id, d_obj)].Not())

                    # Dodaj zmienną kary do listy, z wagą
                    soft_constraints_penalties.append(is_working_on_pref_day_var * self.parametry['waga_pref_dni_wolnych'])

        # Przykład: Kara za nierównomierne obciążenie (bardziej złożone, wymaga zmiennych pomocniczych)
        # Np. minimalizuj różnicę między max_total_hours i min_total_hours wśród pracowników

        # Ustaw funkcję celu: minimalizuj sumę kar
        self.model.Minimize(sum(soft_constraints_penalties))
```

**Krok 7: Ekstrakcja Rozwiązania (`_extract_solution`)**

Po tym, jak solver znajdzie rozwiązanie, musisz odczytać wartości zmiennych decyzyjnych i przekształcić je z powrotem w czytelny format grafiku.

```python
    def _extract_solution(self):
        solution = []
        for p in self.pracownicy:
            for d_obj in self.days:
                for s in self.zmiany:
                    if self.solver.Value(self.vars[(p.id, d_obj, s.id)]) == 1:
                        solution.append({
                            'pracownik_id': p.id,
                            'data': d_obj.isoformat(),
                            'zmiana_id': s.id
                        })
        return solution
```

**Krok 8: Dodatkowe Metody Pomocnicze i Integracja**

*   **`run_validation(schedule)`:** Metoda, która po wygenerowaniu grafiku uruchamia moduł walidacji (`services/walidacja.py`) i zwraca listę naruszeń.
*   **Logowanie postępu:** Wykorzystanie `self.solver.parameters.log_search_progress = True` do wyświetlania informacji z OR-Tools w konsoli (lub w logach aplikacji).
*   **Timeout:** Ustawienie `self.solver.parameters.max_time_in_seconds` jest bardzo ważne, aby generator nie działał w nieskończoność.

---

### **Wyzwania i Wskazówki Przy Implementacji OR-Tools:**

1.  **Modelowanie Czasu:** Ograniczenia czasowe (odpoczynek dobowy/tygodniowy, zmiany przechodzące przez północ) są najbardziej złożone. Często wymaga to tworzenia wielu zmiennych pomocniczych i starannego użycia `AddBoolAnd`, `AddBoolOr`, `AddImplication`.
2.  **Skalowalność:** Dla 15-20 pracowników solver CP-SAT powinien działać szybko. Dla większych zespołów może być potrzebna optymalizacja modelu lub inne strategie (np. podział problemu).
3.  **Debugowanie:** Gdy solver nie znajduje rozwiązania (UNSATISFIABLE), często trudno jest ustalić, które ograniczenie jest problemem. Stopniowe dodawanie ograniczeń i testowanie jest kluczowe.
4.  **Zmienne Pomocnicze:** Do liczenia sum godzin, oznaczania dni wolnych, czy wykrywania zmian nocnych, często potrzebne są zmienne pośrednie typu `NewIntVar` lub `NewBoolVar`, które są powiązane z głównymi zmiennymi `work[p][d][s]`.
5.  **Wagi Ograniczeń:** Przy miękkich ograniczeniach, wartości wag (`self.parametry['waga_xyz']`) są kluczowe dla sterowania zachowaniem generatora. Wagi te powinny być konfigurowalne przez użytkownika (np. suwakami w UI).
6.  **Użycie Wzorców Historycznych:** Możesz je włączyć jako "miękkie" ograniczenia (np. "jeśli pracownik X w przeszłości często pracował na zmianie Y w poniedziałki, spróbuj to powtórzyć") lub jako heurystyki (np. "zacznij od grafiku bazującego na tym wzorcu, a potem go optymalizuj").

