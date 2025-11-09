"""
Proof of Concept (PoC) dla silnika generującego grafiki pracy.

Ten skrypt wykorzystuje bibliotekę Google OR-Tools do stworzenia prostego grafiku
na 7 dni dla 5 pracowników i 3 zmian (+ dzień wolny), uwzględniając kluczowe
ograniczenia prawne i biznesowe.

Główne cele:
- Weryfikacja modelowania problemu.
- Implementacja 11-godzinnego odpoczynku dobowego.
- Sprawdzenie, czy solver jest w stanie znaleźć rozwiązanie.
"""
import json
from ortools.sat.python import cp_model

# --- Parametry Konfiguracyjne PoC ---
NUM_DAYS = 7
MIN_STAFFING_PER_SHIFT = 1

# --- Ładowanie Danych Wejściowych ---
with open("poc/data/pracownicy.json", "r", encoding="utf-8") as f:
    employees_data = json.load(f)

with open("poc/data/zmiany.json", "r", encoding="utf-8") as f:
    shifts_data = json.load(f)

# --- Przygotowanie Danych do Modelu ---
all_employees = [e["id"] for e in employees_data]
all_shifts = [s["id"] for s in shifts_data]
# Zakładamy, że zmiana o ID 0 to "Wolne"
work_shifts = [s["id"] for s in shifts_data if s["id"] != 0]

employee_map = {e["id"]: e["nazwisko"] for e in employees_data}
shift_map = {s["id"]: s for s in shifts_data}


def solve_schedule():
    """Główna funkcja budująca model, ograniczenia i uruchamiająca solver."""
    # 1. Inicjalizacja modelu
    model = cp_model.CpModel()

    # 2. Definicja zmiennych decyzyjnych
    # schedule[(e, d, s)] jest prawdą, jeśli pracownik 'e' w dniu 'd' ma zmianę 's'
    schedule = {}
    for e in all_employees:
        for d in range(NUM_DAYS):
            for s in all_shifts:
                schedule[(e, d, s)] = model.NewBoolVar(f"schedule_e{e}_d{d}_s{s}")

    # --- 3. Definicja Ograniczeń (Constraints) ---

    # Ograniczenie 1: Każdy pracownik ma dokładnie jedną zmianę (lub wolne) dziennie.
    for e in all_employees:
        for d in range(NUM_DAYS):
            model.AddExactlyOne(schedule[(e, d, s)] for s in all_shifts)

    # Ograniczenie 2: Zapewnienie minimalnej obsady na każdej zmianie roboczej.
    for d in range(NUM_DAYS):
        for s in work_shifts:
            model.Add(
                sum(schedule[(e, d, s)] for e in all_employees)
                >= MIN_STAFFING_PER_SHIFT
            )

    # Ograniczenie 3: Zapewnienie 11-godzinnego odpoczynku dobowego.
    # To jest kluczowe i najbardziej złożone ograniczenie.
    # Sprawdzamy każdą parę kolejnych dni (d, d+1) dla każdego pracownika.
    # Jeśli pracownik kończy zmianę s1 w dniu d, nie może zacząć zmiany s2
    # w dniu d+1, jeśli przerwa między nimi jest krótsza niż 11 godzin.
    for e in all_employees:
        for d in range(NUM_DAYS - 1):
            for s1_id in work_shifts:
                for s2_id in work_shifts:
                    s1 = shift_map[s1_id]
                    s2 = shift_map[s2_id]

                    # Czas zakończenia s1 + czas do północy + czas od północy do rozpoczęcia s2
                    # Przykład: s1 kończy się o 22:00, s2 zaczyna o 6:00.
                    # Przerwa = (24 - 22) + 6 = 8 godzin.
                    # Jeśli s1 jest zmianą nocną (np. 22-6), jej end_h to 6.
                    # Wtedy przerwa do kolejnej zmiany o 14:00 to (24-6) + 14 = 32h - błąd.
                    # Prawidłowa logika: przerwa to start_time_s2 - end_time_s1.
                    # Aby to ułatwić, liczymy czas od początku doby.
                    # Czas zakończenia s1: s1['end_h']
                    # Czas rozpoczęcia s2 następnego dnia: 24 + s2['start_h']
                    # Różnica: (24 + s2['start_h']) - s1['end_h']
                    # Ta formuła działa również dla zmian nocnych, np. 22-06 (end_h=6).
                    # Jeśli kolejna zmiana jest o 14:00 (start_h=14), to (24+14)-6 = 32h. OK.
                    # Jeśli kolejna zmiana jest o 06:00 (start_h=6), to (24+6)-22 = 8h. NIE OK.
                    rest_hours = (24 + s2["start_h"]) - s1["end_h"]

                    if rest_hours < 11:
                        # Jeśli przerwa jest za krótka, pracownik nie może mieć
                        # przypisanych obu tych zmian dzień po dniu.
                        # Używamy AddBoolOr, co oznacza, że co najmniej jeden
                        # z warunków w nawiasie musi być prawdziwy.
                        # Czyli: ALBO nie pracuje na s1 w dniu d, ALBO nie pracuje na s2 w dniu d+1.
                        model.AddBoolOr(
                            [
                                schedule[(e, d, s1_id)].Not(),
                                schedule[(e, d + 1, s2_id)].Not(),
                            ]
                        )

    # --- 4. Uruchomienie Solvera ---
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    # --- 5. Przetwarzanie i Wyświetlanie Wyników ---
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print("Znaleziono rozwiązanie grafiku:")
        header = f"{'Pracownik':<15}"
        for d in range(NUM_DAYS):
            header += f"| Dzień {d+1:<5}"
        print(header)
        print("-" * len(header))

        for e in all_employees:
            row = f"{employee_map[e]:<15}"
            for d in range(NUM_DAYS):
                for s in all_shifts:
                    if solver.Value(schedule[(e, d, s)]):
                        shift_name = shift_map[s]["nazwa"]
                        row += f"| {shift_name:<8}"
                        break
            print(row)
    else:
        print("Nie znaleziono rozwiązania dla podanych ograniczeń.")


if __name__ == "__main__":
    solve_schedule()
