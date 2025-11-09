from __future__ import annotations

from calendar import monthrange
from collections import deque, defaultdict
from datetime import date, timedelta
from typing import Dict, Iterable, List, Tuple

from sqlalchemy.orm import Session, selectinload

from ..models import GrafikEntry, GrafikMiesieczny, Pracownik, Zmiana, Nieobecnosc
from ..services.walidacja import validate_schedule


class GenerationError(Exception):
    """Raised when schedule generation is not possible."""


def _fetch_context(session: Session) -> Tuple[List[Pracownik], List[Zmiana], List[Nieobecnosc]]:
    employees = (
        session.query(Pracownik)
        .options(selectinload(Pracownik.rola))
        .order_by(Pracownik.id)
        .all()
    )
    shifts = session.query(Zmiana).order_by(Zmiana.id).all()
    absences = session.query(Nieobecnosc).all()
    if not employees or not shifts:
        raise GenerationError("Brak danych wejściowych do wygenerowania grafiku")
    return employees, shifts, absences


def _group_employees_by_role(employees: Iterable[Pracownik]):
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
    absence_map: Dict[date, set[int]] = defaultdict(set)
    month_start = date(year, month, 1)
    month_end = date(year, month, last_day)
    for absence in absences:
        start = max(absence.data_od, month_start)
        end = min(absence.data_do, month_end)
        current = start
        while current <= end:
            absence_map[current].add(absence.pracownik_id)
            current += timedelta(days=1)
    return absence_map


def generate_monthly_schedule(session: Session, year: int, month: int):
    employees, shifts, absences = _fetch_context(session)
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

    for day in range(1, last_day + 1):
        current_date = date(year, month, day)
        for shift in shifts:
            requirements = shift.wymagana_obsada or {}
            if not requirements:
                continue

            absent_today = absence_map.get(current_date, set())

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
                        if employee.id in absent_today:
                            available.append(employee)
                            continue

                        entry = GrafikEntry(
                            grafik_miesieczny_id=schedule.id,
                            pracownik_id=employee.id,
                            data=current_date,
                            zmiana_id=shift.id,
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

    issues = validate_schedule(created_entries, shifts)
    session.flush()

    return schedule, created_entries, issues
