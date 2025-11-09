"""
Heuristic-based schedule generator.

This module contains the original round-robin heuristic algorithm for generating
monthly work schedules. It distributes shifts based on role requirements and
employee availability, using a simple rotation strategy.

For constraint programming approach with legal compliance, see ortools_generator.py.
"""

from __future__ import annotations

from calendar import monthrange
from collections import deque, defaultdict
from datetime import date, timedelta
from typing import Any, Dict, Iterable, List, Optional, Tuple, cast

from sqlalchemy.orm import Session, selectinload

from ..models import GrafikEntry, GrafikMiesieczny, Pracownik, Zmiana, Nieobecnosc, Holiday
from ..services.walidacja import validate_schedule


class GenerationError(Exception):
    """Raised when schedule generation is not possible."""


def _fetch_context(session: Session, year: int, month: int) -> Tuple[List[Pracownik], List[Zmiana], List[Nieobecnosc], List[Holiday]]:
    """Fetch all necessary data for schedule generation."""
    employees = (
        session.query(Pracownik)
        .options(selectinload(Pracownik.rola))
        .order_by(Pracownik.id)
        .all()
    )
    shifts = session.query(Zmiana).order_by(Zmiana.id).all()
    absences = session.query(Nieobecnosc).all()
    
    # Fetch holidays for the given month
    month_start = date(year, month, 1)
    from calendar import monthrange
    last_day = monthrange(year, month)[1]
    month_end = date(year, month, last_day)
    holidays = (
        session.query(Holiday)
        .filter(Holiday.date >= month_start, Holiday.date <= month_end)
        .all()
    )
    
    if not employees or not shifts:
        raise GenerationError("Brak danych wejściowych do wygenerowania grafiku")
    return employees, shifts, absences, holidays


def _group_employees_by_role(employees: Iterable[Pracownik]):
    """Group employees into queues by their role."""
    grouped: Dict[str, deque[Pracownik]] = defaultdict(deque)
    for employee in employees:
        if employee.rola:
            grouped[employee.rola.nazwa_roli].append(employee)
    return grouped


def _build_absence_map(
    absences: Iterable[Nieobecnosc],
    year: int,
    month: int,
    last_day: int,
):
    """Build a map of dates to sets of absent employee IDs."""
    absence_map: Dict[date, set[int]] = defaultdict(set)
    month_start = date(year, month, 1)
    month_end = date(year, month, last_day)
    for absence in absences:
        start_date = cast(Optional[date], getattr(absence, "data_od", None))
        end_date = cast(Optional[date], getattr(absence, "data_do", None))
        if start_date is None or end_date is None:
            continue
        start = max(start_date, month_start)
        end = min(end_date, month_end)
        current = start
        employee_id = cast(Optional[int], getattr(absence, "pracownik_id", None))
        if employee_id is None:
            continue
        while current <= end:
            absence_map[current].add(employee_id)
            current += timedelta(days=1)
    return absence_map


def generate_monthly_schedule(session: Session, year: int, month: int):
    """
    Generate a monthly schedule using round-robin heuristic approach.
    
    Args:
        session: Database session
        year: Year of the schedule
        month: Month of the schedule (1-12)
        
    Returns:
        Tuple of (schedule, entries, validation_issues)
        
    Raises:
        GenerationError: If generation fails due to insufficient resources
    """
    employees, shifts, absences, holidays = _fetch_context(session, year, month)
    grouped = _group_employees_by_role(employees)

    if not grouped:
        raise GenerationError("Brak przypisanych ról do pracowników")

    last_day = monthrange(year, month)[1]
    absence_map = _build_absence_map(absences, year, month, last_day)
    schedule = (
        session.query(GrafikMiesieczny)
        .filter(GrafikMiesieczny.miesiac_rok == f"{year:04d}-{month:02d}")
        .one_or_none()
    )
    if schedule is None:
        schedule = GrafikMiesieczny(
            miesiac_rok=f"{year:04d}-{month:02d}",
            status="roboczy",
        )
        session.add(schedule)
        session.flush()
    else:
        session.query(GrafikEntry).filter(
            GrafikEntry.grafik_miesieczny_id == schedule.id
        ).delete()
        session.flush()

    created_entries: List[GrafikEntry] = []
    schedule_id = cast(Optional[int], getattr(schedule, "id", None))
    if schedule_id is None:
        raise GenerationError("Brak identyfikatora grafiku do zapisania wpisów")

    for day in range(1, last_day + 1):
        current_date = date(year, month, day)
        for shift in shifts:
            raw_requirements = getattr(shift, "wymagana_obsada", None)
            requirements: Dict[str, int]
            if isinstance(raw_requirements, dict):
                requirements = raw_requirements
            elif raw_requirements:
                requirements = dict(raw_requirements)
            else:
                requirements = {}

            if len(requirements) == 0:
                continue

            absent_today = absence_map.get(current_date)
            if absent_today is None:
                absent_today = set()

            for role_name, required_count in requirements.items():
                available = grouped.get(role_name)
                if not available:
                    raise GenerationError(f"Brak pracowników dla roli {role_name}")

                for _ in range(required_count):
                    if not available:
                        raise GenerationError(
                            f"Niewystarczająca liczba pracowników dla roli {role_name}"
                        )

                    assigned = False
                    for _ in range(len(available)):
                        employee = available.popleft()
                        employee_id = cast(Optional[int], getattr(employee, "id", None))
                        if employee_id is None:
                            continue
                        if employee_id in absent_today:
                            available.append(employee)
                            continue

                        shift_id = cast(Optional[int], getattr(shift, "id", None))
                        if shift_id is None:
                            available.append(employee)
                            continue

                        entry = GrafikEntry(
                            grafik_miesieczny_id=schedule_id,
                            pracownik_id=employee_id,
                            data=current_date,
                            zmiana_id=shift_id,
                        )
                        entry.pracownik = employee
                        entry.zmiana = shift
                        session.add(entry)
                        created_entries.append(entry)
                        available.append(employee)
                        assigned = True
                        break

                    if not assigned:
                        raise GenerationError(
                            f"Wszyscy pracownicy w roli {role_name} są niedostępni {current_date.isoformat()}"
                        )

    issues = validate_schedule(created_entries, shifts, holidays)
    session.flush()

    return schedule, created_entries, issues
