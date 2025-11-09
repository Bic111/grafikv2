from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from typing import Dict, Iterable, List, Sequence

from ..models import GrafikEntry, Zmiana


@dataclass
class ValidationIssue:
    level: str
    message: str


def _group_entries(entries: Sequence[GrafikEntry]):
    per_day: Dict[date, List[GrafikEntry]] = defaultdict(list)
    for entry in entries:
        per_day[entry.data].append(entry)
    return per_day


def check_daily_rest(entries: Sequence[GrafikEntry]) -> List[ValidationIssue]:
    issues: List[ValidationIssue] = []
    per_employee: Dict[int, List[GrafikEntry]] = defaultdict(list)

    for entry in entries:
        per_employee[entry.pracownik_id].append(entry)

    for employee_id, emp_entries in per_employee.items():
        emp_entries.sort(key=lambda item: item.data)
        for idx in range(1, len(emp_entries)):
            prev = emp_entries[idx - 1]
            current = emp_entries[idx]
            if (current.data - prev.data).days < 1:
                issues.append(
                    ValidationIssue(
                        level="warning",
                        message=(
                            "Pracownik ID %s ma przypisane dwie zmiany bez jednodniowego odpoczynku"
                            % employee_id
                        ),
                    )
                )
    return issues


def check_shift_coverage(
    entries: Sequence[GrafikEntry],
    shifts: Iterable[Zmiana],
) -> List[ValidationIssue]:
    shift_requirements = {shift.id: shift.wymagana_obsada or {} for shift in shifts}
    issues: List[ValidationIssue] = []

    grouped = _group_entries(entries)
    for day, day_entries in grouped.items():
        per_shift: Dict[int, List[GrafikEntry]] = defaultdict(list)
        for entry in day_entries:
            per_shift[entry.zmiana_id].append(entry)

        for shift_id, shift_entries in per_shift.items():
            requirements = shift_requirements.get(shift_id, {})
            if not requirements:
                continue

            per_role: Dict[str, int] = defaultdict(int)
            for entry in shift_entries:
                role_name = entry.pracownik.rola.nazwa_roli if entry.pracownik and entry.pracownik.rola else ""
                if role_name:
                    per_role[role_name] += 1

            for role_name, required_count in requirements.items():
                actual = per_role.get(role_name, 0)
                if actual < required_count:
                    issues.append(
                        ValidationIssue(
                            level="error",
                            message=(
                                f"{day.isoformat()} zmiana {shift_id}: brakuje {required_count - actual} "
                                f"pracowników w roli {role_name}"
                            ),
                        )
                    )
    return issues


def validate_schedule(entries: Sequence[GrafikEntry], shifts: Iterable[Zmiana]):
    issues = []
    issues.extend(check_daily_rest(entries))
    issues.extend(check_shift_coverage(entries, shifts))
    return issues
