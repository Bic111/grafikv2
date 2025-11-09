"""
OR-Tools CP-SAT based schedule generator.

This module implements constraint programming approach using Google OR-Tools
to generate work schedules with full legal compliance and optimization.
"""

from __future__ import annotations

from calendar import monthrange
from collections import defaultdict
from datetime import date, datetime, timedelta, time
from typing import Any, DefaultDict, Dict, List, Optional, Tuple, cast

from ortools.sat.python import cp_model
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from ..models import (
    GrafikEntry,
    GrafikMiesieczny,
    Pracownik,
    Zmiana,
    Nieobecnosc,
    Holiday,
    LaborLawRule,
    GeneratorParameter,
)
from ..services.walidacja import validate_schedule


class GenerationError(Exception):
    """Raised when schedule generation is not possible."""


class OrToolsGenerator:
    """
    Constraint Programming generator using Google OR-Tools CP-SAT solver.
    
    This generator respects labor law rules, holidays, staffing requirements,
    and employee preferences while optimizing for fair work distribution.
    """

    def __init__(
        self,
        session: Session,
        year: int,
        month: int,
        scenario_type: str = "DEFAULT",
    ):
        """
        Initialize OR-Tools generator.
        
        Args:
            session: Database session
            year: Year of the schedule
            month: Month of the schedule (1-12)
            scenario_type: Generator profile (DEFAULT, NIGHT_FOCUS, PEAK_SEASON, etc.)
        """
        self.session = session
        self.year = year
        self.month = month
        self.scenario_type = scenario_type
        
        # Calculate month boundaries
        self.last_day = monthrange(year, month)[1]
        self.month_start = date(year, month, 1)
        self.month_end = date(year, month, self.last_day)
        
        # Fetch data
        self._load_data()
        
        # OR-Tools model
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        
        # Decision variables
        self.assignments: Dict[Tuple[int, int, int], cp_model.IntVar] = {}
        
    def _load_data(self):
        """Load all necessary data from database."""
        # Employees
        self.employees = (
            self.session.query(Pracownik)
            .options(selectinload(Pracownik.rola))
            .order_by(Pracownik.id)
            .all()
        )
        
        # Shifts
        self.shifts = self.session.query(Zmiana).order_by(Zmiana.id).all()
        
        # Absences
        self.absences = self.session.query(Nieobecnosc).all()
        
        # Holidays
        self.holidays = (
            self.session.query(Holiday)
            .filter(
                Holiday.date >= self.month_start,
                Holiday.date <= self.month_end
            )
            .all()
        )
        
        # Labor law rules (active only)
        self.rules = (
            self.session.query(LaborLawRule)
            .filter(
                or_(
                    LaborLawRule.active_from.is_(None),
                    LaborLawRule.active_from <= self.month_end,
                ),
                or_(
                    LaborLawRule.active_to.is_(None),
                    LaborLawRule.active_to >= self.month_start,
                ),
            )
            .all()
        )
        
        # Generator parameters
        self.params = (
            self.session.query(GeneratorParameter)
            .filter(GeneratorParameter.scenario_type == self.scenario_type)
            .first()
        )
        
        if self.params is None:
            # Use default parameters if scenario not found
            self.params = (
                self.session.query(GeneratorParameter)
                .filter(GeneratorParameter.scenario_type == "DEFAULT")
                .first()
            )
        
        if not self.employees or not self.shifts:
            raise GenerationError("Brak danych wejściowych do wygenerowania grafiku")
            
        # Build absence map
        self._build_absence_map()
        
        # Build holiday map
        self._build_holiday_map()
        
    def _build_absence_map(self):
        """Build a map of dates to sets of absent employee IDs."""
        self.absence_map: Dict[date, set[int]] = defaultdict(set)
        for absence in self.absences:
            start_date = cast(Optional[date], getattr(absence, "data_od", None))
            end_date = cast(Optional[date], getattr(absence, "data_do", None))
            employee_id = cast(Optional[int], getattr(absence, "pracownik_id", None))
            if start_date is None or end_date is None or employee_id is None:
                continue

            start = max(start_date, self.month_start)
            end = min(end_date, self.month_end)
            current = start
            while current <= end:
                self.absence_map[current].add(employee_id)
                current += timedelta(days=1)
                
    def _build_holiday_map(self):
        """Build a map of holiday dates."""
        self.holiday_map: Dict[date, Holiday] = {}
        for holiday in self.holidays:
            holiday_date = cast(Optional[date], getattr(holiday, "date", None))
            if holiday_date is None:
                continue
            self.holiday_map[holiday_date] = holiday
    
    def _create_variables(self):
        """Create decision variables for the CP-SAT model."""
        # assignments[employee_id, day, shift_id] = 0/1
        for emp in self.employees:
            emp_id = cast(Optional[int], getattr(emp, "id", None))
            if emp_id is None:
                continue
            for day in range(1, self.last_day + 1):
                current_date = date(self.year, self.month, day)
                
                # Skip if employee is absent
                absent_today = self.absence_map.get(current_date)
                if absent_today is not None and emp_id in absent_today:
                    continue
                    
                for shift in self.shifts:
                    shift_id = cast(Optional[int], getattr(shift, "id", None))
                    if shift_id is None:
                        continue
                    var_name = f"e{emp_id}_d{day}_s{shift_id}"
                    var = self.model.NewBoolVar(var_name)
                    self.assignments[(emp_id, day, shift_id)] = var
    
    def _add_coverage_constraints(self):
        """Ensure each shift has required staff coverage."""
        for day in range(1, self.last_day + 1):
            current_date = date(self.year, self.month, day)
            
            # Check if store is closed on this holiday
            holiday = self.holiday_map.get(current_date)
            if holiday is not None:
                is_closed = bool(getattr(holiday, "store_closed", False))
                if is_closed:
                    # No assignments on closed days
                    for key, var in list(self.assignments.items()):
                        _, assignment_day, _ = key
                        if assignment_day == day:
                            self.model.Add(var == 0)
                    continue
            
            for shift in self.shifts:
                shift_id = cast(Optional[int], getattr(shift, "id", None))
                if shift_id is None:
                    continue

                raw_requirements = getattr(shift, "wymagana_obsada", None)
                if isinstance(raw_requirements, dict):
                    requirements = raw_requirements
                elif raw_requirements:
                    requirements = dict(raw_requirements)
                else:
                    requirements = {}
                
                for role_name, required_count in requirements.items():
                    required_int = int(required_count)
                    # Find employees with this role
                    role_employees = [
                        emp for emp in self.employees
                        if emp.rola and emp.rola.nazwa_roli == role_name
                    ]
                    
                    # Sum assignments for this role
                    role_assignments = []
                    for emp in role_employees:
                        emp_id = cast(Optional[int], getattr(emp, "id", None))
                        if emp_id is None:
                            continue
                        key = (emp_id, day, shift_id)
                        if key in self.assignments:
                            role_assignments.append(self.assignments[key])
                    
                    if len(role_assignments) > 0:
                        # Require exactly the needed count
                        self.model.Add(sum(role_assignments) == required_int)
    
    def _add_daily_rest_constraints(self):
        """Ensure minimum 11 hours rest between shifts."""
        # Get minimum rest hours from rules or use default
        min_rest_hours = 11
        for rule in self.rules:
            rule_code = getattr(rule, "code", "")
            if rule_code.lower() in {"odpoczynek_dobowy", "rest_daily"}:
                parameters = cast(Optional[Dict[str, Any]], getattr(rule, "parameters", None))
                if parameters is not None:
                    min_rest_hours = int(parameters.get("min_hours", min_rest_hours))
                break
        
        for emp in self.employees:
            emp_id = cast(Optional[int], getattr(emp, "id", None))
            if emp_id is None:
                continue
            for day in range(1, self.last_day):
                # Check all shift combinations between consecutive days
                for shift1 in self.shifts:
                    for shift2 in self.shifts:
                        shift1_id = cast(Optional[int], getattr(shift1, "id", None))
                        shift2_id = cast(Optional[int], getattr(shift2, "id", None))
                        if shift1_id is None or shift2_id is None:
                            continue
                        key1 = (emp_id, day, shift1_id)
                        key2 = (emp_id, day + 1, shift2_id)
                        
                        if key1 not in self.assignments or key2 not in self.assignments:
                            continue
                        
                        # Calculate time between shifts
                        end_time_raw = cast(Optional[time], getattr(shift1, "godzina_zakonczenia", None))
                        start_time_raw = cast(Optional[time], getattr(shift2, "godzina_rozpoczecia", None))
                        if end_time_raw is None or start_time_raw is None:
                            continue
                        end_time1 = datetime.combine(date.today(), end_time_raw)
                        start_time2 = datetime.combine(date.today(), start_time_raw)
                        
                        # Handle overnight shifts
                        if end_time_raw > start_time_raw:
                            start_time2 += timedelta(days=1)
                        
                        hours_between = (start_time2 - end_time1).total_seconds() / 3600
                        
                        # If rest period is too short, don't allow both shifts
                        if hours_between < min_rest_hours:
                            self.model.Add(
                                self.assignments[key1] + self.assignments[key2] <= 1
                            )
    
    def _add_weekly_rest_constraints(self):
        """Ensure at least one day off per week."""
        for emp in self.employees:
            emp_id = cast(Optional[int], getattr(emp, "id", None))
            if emp_id is None:
                continue
            # Check 7-day windows
            for start_day in range(1, self.last_day - 5):
                # For each 7-day window, employee must have at least one day with no shifts
                window_assignments = []
                
                for day in range(start_day, start_day + 7):
                    if day > self.last_day:
                        break
                    
                    # Check if employee works any shift this day
                    day_vars = []
                    for shift in self.shifts:
                        shift_id = cast(Optional[int], getattr(shift, "id", None))
                        if shift_id is None:
                            continue
                        key = (emp_id, day, shift_id)
                        if key in self.assignments:
                            day_vars.append(self.assignments[key])
                    
                    if day_vars:
                        # Create a variable for "works this day"
                        works_day = self.model.NewBoolVar(f"e{emp_id}_works_d{day}")
                        self.model.AddMaxEquality(works_day, day_vars)
                        window_assignments.append(works_day)
                
                # Ensure at least one day off (at most 6 working days)
                if window_assignments:
                    self.model.Add(sum(window_assignments) <= 6)
    
    def _add_monthly_hours_constraints(self):
        """Ensure monthly working hours don't exceed limits."""
        for emp in self.employees:
            emp_id = cast(Optional[int], getattr(emp, "id", None))
            if emp_id is None:
                continue
            limit_raw = cast(Optional[int], getattr(emp, "limit_godzin_miesieczny", None))
            limit = limit_raw if limit_raw is not None else 160  # Default 160h
            
            total_hours = []
            for day in range(1, self.last_day + 1):
                for shift in self.shifts:
                    shift_id = cast(Optional[int], getattr(shift, "id", None))
                    if shift_id is None:
                        continue
                    key = (emp_id, day, shift_id)
                    if key not in self.assignments:
                        continue
                    
                    # Calculate shift duration in hours
                    start_time = cast(Optional[time], getattr(shift, "godzina_rozpoczecia", None))
                    end_time = cast(Optional[time], getattr(shift, "godzina_zakonczenia", None))
                    if start_time is None or end_time is None:
                        continue
                    duration = (
                        datetime.combine(date.today(), end_time)
                        - datetime.combine(date.today(), start_time)
                    ).total_seconds() / 3600
                    
                    # Add weighted by assignment variable
                    total_hours.append(int(duration * 10) * self.assignments[key])
            
            if total_hours:
                self.model.Add(sum(total_hours) <= limit * 10)
    
    def _add_objective(self):
        """Add optimization objective to balance workload."""
        weights: Dict[str, Any] = {}
        if self.params is not None:
            raw_weights = getattr(self.params, "weights", None)
            if isinstance(raw_weights, dict):
                weights = raw_weights
        
        # Default weights
        fairness_weight = weights.get("fairness", 10)
        # preference_weight currently unused but reserved for future soft constraints

        objective_terms = []
        
        # Fairness: minimize difference in total shifts per employee
        shifts_per_emp = {}
        for emp in self.employees:
            emp_id = cast(Optional[int], getattr(emp, "id", None))
            if emp_id is None:
                continue
            emp_shifts = []
            for day in range(1, self.last_day + 1):
                for shift in self.shifts:
                    shift_id = cast(Optional[int], getattr(shift, "id", None))
                    if shift_id is None:
                        continue
                    key = (emp_id, day, shift_id)
                    if key in self.assignments:
                        emp_shifts.append(self.assignments[key])
            
            if emp_shifts:
                shifts_count = self.model.NewIntVar(0, len(emp_shifts), f"shifts_e{emp_id}")
                self.model.Add(shifts_count == sum(emp_shifts))
                shifts_per_emp[emp_id] = shifts_count
        
        # Add penalty for deviation from average
        if shifts_per_emp:
            assignment_slots: DefaultDict[int, int] = defaultdict(int)
            for emp_id_key, _, _ in self.assignments:
                assignment_slots[emp_id_key] += 1
            avg_shifts = sum(assignment_slots.values()) // max(1, len(assignment_slots))
            
            for emp_id, count in shifts_per_emp.items():
                deviation = self.model.NewIntVar(0, 100, f"dev_e{emp_id}")
                self.model.AddAbsEquality(deviation, count - avg_shifts)
                objective_terms.append(fairness_weight * deviation)
        
        # Minimize total objective
        if objective_terms:
            self.model.Minimize(sum(objective_terms))
    
    def generate(self) -> Tuple[GrafikMiesieczny, List[GrafikEntry], List]:
        """
        Generate schedule using OR-Tools CP-SAT solver.
        
        Returns:
            Tuple of (schedule, entries, validation_issues)
            
        Raises:
            GenerationError: If no solution found
        """
        # Create variables and constraints
        self._create_variables()
        self._add_coverage_constraints()
        self._add_daily_rest_constraints()
        self._add_weekly_rest_constraints()
        self._add_monthly_hours_constraints()
        self._add_objective()
        
        # Solve with timeout
        self.solver.parameters.max_time_in_seconds = 60.0
        status = self.solver.Solve(self.model)
        
        if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            # Provide detailed diagnostics
            status_name = "STATUS_UNKNOWN"
            if status == cp_model.UNKNOWN:
                status_name = "UNKNOWN"
            elif status == cp_model.MODEL_INVALID:
                status_name = "MODEL_INVALID"
            elif status == cp_model.INFEASIBLE:
                status_name = "INFEASIBLE"
            else:
                status_name = f"STATUS_{status}"
            
            raise GenerationError(
                f"OR-Tools nie znalazł rozwiązania (status: {status_name}). "
                f"Pracownicy: {len(self.employees)}, Zmiany: {len(self.shifts)}, "
                f"Zmienne: {len(self.assignments)}. "
                "Sprawdź ograniczenia i wymagania obsadowe."
            )
        
        # Create or update schedule
        schedule = (
            self.session.query(GrafikMiesieczny)
            .filter(GrafikMiesieczny.miesiac_rok == f"{self.year:04d}-{self.month:02d}")
            .one_or_none()
        )
        
        if schedule is None:
            schedule = GrafikMiesieczny(
                miesiac_rok=f"{self.year:04d}-{self.month:02d}",
                status="roboczy",
            )
            self.session.add(schedule)
            self.session.flush()
        else:
            # Clear existing entries
            self.session.query(GrafikEntry).filter(
                GrafikEntry.grafik_miesieczny_id == schedule.id
            ).delete()
            self.session.flush()
        
        # Extract solution
        created_entries: List[GrafikEntry] = []
        
        for (emp_id, day, shift_id), var in self.assignments.items():
            if self.solver.Value(var) == 1:
                current_date = date(self.year, self.month, day)
                
                entry = GrafikEntry(
                    grafik_miesieczny_id=schedule.id,
                    pracownik_id=emp_id,
                    data=current_date,
                    zmiana_id=shift_id,
                )
                
                # Load relationships for validation
                entry.pracownik = self.session.get(Pracownik, emp_id)
                entry.zmiana = self.session.get(Zmiana, shift_id)
                
                self.session.add(entry)
                created_entries.append(entry)
        
        # Validate solution
        issues = validate_schedule(created_entries, self.shifts, self.holidays)
        self.session.flush()
        
        return schedule, created_entries, issues
