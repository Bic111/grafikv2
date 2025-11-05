#!/usr/bin/env python3
"""
Solver grafiků pracowniczych używający Google OR-Tools.
Skrypt przyjmuje dane w formacie JSON przez stdin i zwraca rozwiązanie przez stdout.
"""

import sys
import json
from typing import Dict, List, Any
from ortools.sat.python import cp_model


def solve_schedule(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Rozwiązuje problem harmonogramowania zmian przy użyciu CP-SAT solver.

    Args:
        data: Słownik zawierający:
            - employees: Lista pracowników z id, employment_type
            - shifts: Lista zmian z id, day_of_week, start_time, end_time, required_staff
            - absences: Lista nieobecności z employee_id, start_date, end_date
            - date_range: Zakres dat do zaplanowania (start_date, end_date)

    Returns:
        Słownik z rozwiązaniem zawierający:
            - status: 'OPTIMAL', 'FEASIBLE', 'INFEASIBLE', lub 'ERROR'
            - assignments: Lista przypisań {employee_id, date, shift_id}
            - warnings: Lista ostrzeżeń
            - errors: Lista błędów krytycznych
    """

    employees = data.get('employees', [])
    shifts = data.get('shifts', [])
    absences = data.get('absences', [])
    date_range = data.get('date_range', {})

    # Walidacja wejścia
    if not employees:
        return {
            'status': 'ERROR',
            'assignments': [],
            'warnings': [],
            'errors': ['Brak pracowników do zaplanowania']
        }

    if not shifts:
        return {
            'status': 'ERROR',
            'assignments': [],
            'warnings': [],
            'errors': ['Brak zmian do zaplanowania']
        }

    # Przygotowanie danych
    from datetime import datetime, timedelta

    start_date = datetime.strptime(date_range.get('start_date', ''), '%Y-%m-%d')
    end_date = datetime.strptime(date_range.get('end_date', ''), '%Y-%m-%d')

    # Lista dni do zaplanowania
    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=1)

    if not dates:
        return {
            'status': 'ERROR',
            'assignments': [],
            'warnings': [],
            'errors': ['Brak dat do zaplanowania']
        }

    # Utworzenie modelu CP-SAT
    model = cp_model.CpModel()

    # Zmienne decyzyjne: shifts_assigned[(employee_id, date, shift_id)]
    shifts_assigned = {}

    for employee in employees:
        emp_id = employee.get('id')
        for date_str in dates:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            day_of_week = date_obj.weekday()  # 0=Monday, 6=Sunday
            # Convert to 0=Sunday, 1=Monday format used in shifts
            shift_day = (day_of_week + 1) % 7

            for shift in shifts:
                if shift.get('day_of_week') == shift_day:
                    shift_id = shift.get('id')
                    shifts_assigned[(emp_id, date_str, shift_id)] = model.NewBoolVar(
                        f'shift_e{emp_id}_d{date_str}_s{shift_id}'
                    )

    # Ograniczenie 1: Każda zmiana musi mieć wymaganą liczbę pracowników
    for date_str in dates:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        day_of_week = date_obj.weekday()
        shift_day = (day_of_week + 1) % 7

        for shift in shifts:
            if shift.get('day_of_week') == shift_day:
                shift_id = shift.get('id')
                required_staff = shift.get('required_staff', 1)

                # Suma pracowników przypisanych do tej zmiany
                assigned = []
                for employee in employees:
                    emp_id = employee.get('id')
                    if (emp_id, date_str, shift_id) in shifts_assigned:
                        assigned.append(shifts_assigned[(emp_id, date_str, shift_id)])

                if assigned:
                    model.Add(sum(assigned) >= required_staff)

    # Ograniczenie 2: Pracownik nie może pracować podczas nieobecności
    for absence in absences:
        emp_id = absence.get('employee_id')
        abs_start = datetime.strptime(absence.get('start_date', ''), '%Y-%m-%d')
        abs_end = datetime.strptime(absence.get('end_date', ''), '%Y-%m-%d')

        for date_str in dates:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            if abs_start <= date_obj <= abs_end:
                # Nie przypisuj żadnej zmiany w tym dniu
                for key in shifts_assigned:
                    if key[0] == emp_id and key[1] == date_str:
                        model.Add(shifts_assigned[key] == 0)

    # Ograniczenie 3: Pracownik może mieć maksymalnie jedną zmianę dziennie
    for employee in employees:
        emp_id = employee.get('id')
        for date_str in dates:
            shifts_on_day = [
                shifts_assigned[key]
                for key in shifts_assigned
                if key[0] == emp_id and key[1] == date_str
            ]
            if shifts_on_day:
                model.Add(sum(shifts_on_day) <= 1)

    # Cel: Zrównoważenie obciążenia - minimalizuj różnicę w liczbie zmian
    # To jest uproszczona wersja - można dodać więcej kryteriów

    # Rozwiązanie modelu
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0  # Limit czasu

    status = solver.Solve(model)

    assignments = []
    warnings = []
    errors = []

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        # Wyciągnij przypisania
        for (emp_id, date_str, shift_id), var in shifts_assigned.items():
            if solver.Value(var) == 1:
                assignments.append({
                    'employee_id': emp_id,
                    'date': date_str,
                    'shift_id': shift_id
                })

        result_status = 'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE'

        if status == cp_model.FEASIBLE:
            warnings.append('Znaleziono rozwiązanie dopuszczalne, ale nie optymalne')

        return {
            'status': result_status,
            'assignments': assignments,
            'warnings': warnings,
            'errors': errors
        }

    elif status == cp_model.INFEASIBLE:
        return {
            'status': 'INFEASIBLE',
            'assignments': [],
            'warnings': [],
            'errors': ['Nie znaleziono rozwiązania - zbyt mało pracowników lub zbyt wiele ograniczeń']
        }

    else:
        return {
            'status': 'ERROR',
            'assignments': [],
            'warnings': [],
            'errors': ['Solver nie znalazł rozwiązania w określonym czasie']
        }


def main():
    """Główna funkcja - czyta JSON ze stdin, rozwiązuje problem, wypisuje wynik do stdout."""
    try:
        # Wczytaj dane wejściowe z stdin
        input_data = json.load(sys.stdin)

        # Rozwiąż problem
        result = solve_schedule(input_data)

        # Wypisz wynik do stdout
        print(json.dumps(result, ensure_ascii=False, indent=2))

    except json.JSONDecodeError as e:
        error_result = {
            'status': 'ERROR',
            'assignments': [],
            'warnings': [],
            'errors': [f'Błąd parsowania JSON: {str(e)}']
        }
        print(json.dumps(error_result, ensure_ascii=False, indent=2))
        sys.exit(1)

    except Exception as e:
        error_result = {
            'status': 'ERROR',
            'assignments': [],
            'warnings': [],
            'errors': [f'Nieoczekiwany błąd: {str(e)}']
        }
        print(json.dumps(error_result, ensure_ascii=False, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()
