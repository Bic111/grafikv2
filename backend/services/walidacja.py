from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from typing import Any, DefaultDict, Dict, Iterable, List, Optional, Sequence, cast

from sqlalchemy.orm import Session

from ..models import GrafikEntry, Zmiana, Holiday, LaborLawRule, Pracownik


def _extract_date(value: Any) -> Optional[date]:
    return value if isinstance(value, date) else None


def _extract_time(value: Any) -> Optional[time]:
    return value if isinstance(value, time) else None


def _extract_int(value: Any) -> Optional[int]:
    return int(value) if isinstance(value, (int,)) else None


@dataclass
class ValidationIssue:
    level: str  # 'error' for HARD rules, 'warning' for SOFT rules
    message: str
    rule_code: Optional[str] = None  # Link to LaborLawRule code


def _group_entries(entries: Sequence[GrafikEntry]):
    per_day: DefaultDict[date, List[GrafikEntry]] = defaultdict(list)
    for entry in entries:
        entry_date = _extract_date(getattr(entry, "data", None))
        if entry_date is None:
            continue
        per_day[entry_date].append(entry)
    return per_day


def check_daily_rest(entries: Sequence[GrafikEntry]) -> List[ValidationIssue]:
    issues: List[ValidationIssue] = []
    per_employee: DefaultDict[int, List[GrafikEntry]] = defaultdict(list)

    for entry in entries:
        employee_id = _extract_int(getattr(entry, "pracownik_id", None))
        if employee_id is None:
            continue
        per_employee[employee_id].append(entry)

    for employee_id, emp_entries in per_employee.items():
        emp_entries.sort(key=lambda item: _extract_date(getattr(item, "data", None)) or date.min)
        for idx in range(1, len(emp_entries)):
            prev = emp_entries[idx - 1]
            current = emp_entries[idx]
            prev_date = _extract_date(getattr(prev, "data", None))
            current_date = _extract_date(getattr(current, "data", None))
            prev_shift = getattr(prev, "zmiana", None)
            current_shift = getattr(current, "zmiana", None)
            prev_end = _extract_time(getattr(prev_shift, "godzina_zakonczenia", None)) if prev_shift else None
            current_start = _extract_time(getattr(current_shift, "godzina_rozpoczecia", None)) if current_shift else None
            if prev_date is None or current_date is None or prev_end is None or current_start is None:
                continue
            time_between = (
                datetime.combine(current_date, current_start)
                - datetime.combine(prev_date, prev_end)
            )
            if time_between < timedelta(hours=11):
                issues.append(
                    ValidationIssue(
                        level="warning",
                        message=(
                            f"Pracownik ID {employee_id} ma mniej niż 11 godzin odpoczynku "
                            f"między zmianami {prev_date} i {current_date}"
                        ),
                    )
                )
    return issues


def check_weekly_rest(entries: Sequence[GrafikEntry]) -> List[ValidationIssue]:
    issues: List[ValidationIssue] = []
    per_employee: DefaultDict[int, List[date]] = defaultdict(list)
    for entry in entries:
        employee_id = _extract_int(getattr(entry, "pracownik_id", None))
        entry_date = _extract_date(getattr(entry, "data", None))
        if employee_id is None or entry_date is None:
            continue
        per_employee[employee_id].append(entry_date)

    for employee_id, work_days in per_employee.items():
        work_days.sort()
        for i in range(len(work_days) - 6):
            if all((work_days[i+j+1] - work_days[i+j]).days == 1 for j in range(6)):
                issues.append(
                    ValidationIssue(
                        level="warning",
                        message=f"Pracownik ID {employee_id} pracuje 7 dni z rzędu, zaczynając od {work_days[i]}",
                    )
                )
    return issues


def check_working_hours_limit(entries: Sequence[GrafikEntry], limit_hours: int) -> List[ValidationIssue]:
    issues: List[ValidationIssue] = []
    per_employee: DefaultDict[int, float] = defaultdict(float)
    for entry in entries:
        employee_id = _extract_int(getattr(entry, "pracownik_id", None))
        shift = getattr(entry, "zmiana", None)
        start_time = _extract_time(getattr(shift, "godzina_rozpoczecia", None)) if shift else None
        end_time = _extract_time(getattr(shift, "godzina_zakonczenia", None)) if shift else None
        if employee_id is None or start_time is None or end_time is None:
            continue
        duration = (
            datetime.combine(date.today(), end_time)
            - datetime.combine(date.today(), start_time)
        ).total_seconds() / 3600
        per_employee[employee_id] += duration

    for employee_id, total_hours in per_employee.items():
        if total_hours > limit_hours:
            issues.append(
                ValidationIssue(
                    level="warning",
                    message=(
                        f"Pracownik ID {employee_id} przekroczył limit godzin pracy "
                        f"({total_hours:.2f}/{limit_hours})"
                    ),
                )
            )
    return issues


def check_holidays(entries: Sequence[GrafikEntry], holidays: List[Holiday]) -> List[ValidationIssue]:
    issues: List[ValidationIssue] = []
    holiday_dates = {
        cast(date, h_date)
        for h_date in (getattr(h, "date", None) for h in holidays)
        if isinstance(h_date, date)
    }
    for entry in entries:
        entry_date = _extract_date(getattr(entry, "data", None))
        employee_id = _extract_int(getattr(entry, "pracownik_id", None))
        if entry_date is None or employee_id is None:
            continue
        if entry_date in holiday_dates:
            issues.append(
                ValidationIssue(
                    level="error",
                    message=f"Pracownik ID {employee_id} jest przypisany do pracy w święto ({entry_date})",
                )
            )
    return issues


def check_shift_coverage(
    entries: Sequence[GrafikEntry],
    shifts: Iterable[Zmiana],
) -> List[ValidationIssue]:
    shift_requirements: Dict[int, Dict[str, int]] = {}
    for shift in shifts:
        shift_id = _extract_int(getattr(shift, "id", None))
        if shift_id is None:
            continue
        raw_requirements = getattr(shift, "wymagana_obsada", None)
        if isinstance(raw_requirements, dict):
            typed_requirements = {str(k): int(v) for k, v in raw_requirements.items()}
        elif raw_requirements:
            typed_requirements = {str(k): int(v) for k, v in dict(raw_requirements).items()}
        else:
            typed_requirements = {}
        shift_requirements[shift_id] = typed_requirements
    issues: List[ValidationIssue] = []

    grouped = _group_entries(entries)
    for day, day_entries in grouped.items():
        per_shift: Dict[int, List[GrafikEntry]] = defaultdict(list)
        for entry in day_entries:
            shift_id = _extract_int(getattr(entry, "zmiana_id", None))
            if shift_id is None:
                continue
            per_shift[shift_id].append(entry)

        for shift_id, shift_entries in per_shift.items():
            requirements = shift_requirements.get(shift_id, {})
            if not requirements:
                continue

            per_role: Dict[str, int] = defaultdict(int)
            for entry in shift_entries:
                employee = getattr(entry, "pracownik", None)
                role = getattr(employee, "rola", None) if employee else None
                role_name = getattr(role, "nazwa_roli", "") if role else ""
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


def validate_schedule(entries: Sequence[GrafikEntry], shifts: Iterable[Zmiana], holidays: List[Holiday]):
    """
    Validate schedule using hardcoded validation rules.
    
    For database-driven validation with LaborLawRule, use validate_schedule_with_rules().
    """
    issues = []
    issues.extend(check_daily_rest(entries))
    issues.extend(check_weekly_rest(entries))
    issues.extend(check_working_hours_limit(entries, 40))  # Przykładowy limit
    issues.extend(check_holidays(entries, holidays))
    issues.extend(check_shift_coverage(entries, shifts))
    return issues


def validate_schedule_with_rules(
    session: Session,
    entries: Sequence[GrafikEntry],
    shifts: Iterable[Zmiana],
    holidays: List[Holiday],
    month_start: date,
    month_end: date,
) -> List[ValidationIssue]:
    """
    Validate schedule using LaborLawRule from database.
    
    This function loads active rules and applies them with proper severity levels.
    
    Args:
        session: Database session
        entries: Schedule entries to validate
        shifts: Available shifts
        holidays: Holidays in the period
        month_start: Start of validation period
        month_end: End of validation period
        
    Returns:
        List of validation issues
    """
    from .configuration import ConfigurationLoader
    
    config = ConfigurationLoader(session)
    rules = config.get_active_rules(month_start, month_end)
    
    issues = []
    
    # Build rule lookup
    rules_by_code: Dict[str, LaborLawRule] = {}
    for rule in rules:
        code = getattr(rule, "code", None)
        if isinstance(code, str):
            rules_by_code[code] = rule
    
    # Validate daily rest using rule parameters
    daily_rest_rule = rules_by_code.get("odpoczynek_dobowy")
    if daily_rest_rule:
        parameters = getattr(daily_rest_rule, "parameters", None)
        min_hours = int(parameters.get("min_hours", 11)) if isinstance(parameters, dict) else 11
        severity_value = getattr(daily_rest_rule, "severity", "warning")
        severity_level = "error" if severity_value == "HARD" else "warning"
        
        per_employee_entries: DefaultDict[int, List[GrafikEntry]] = defaultdict(list)
        for entry in entries:
            employee_id = _extract_int(getattr(entry, "pracownik_id", None))
            if employee_id is None:
                continue
            per_employee_entries[employee_id].append(entry)
        
        for employee_id, emp_entries in per_employee_entries.items():
            emp_entries.sort(key=lambda item: _extract_date(getattr(item, "data", None)) or date.min)
            for idx in range(1, len(emp_entries)):
                prev = emp_entries[idx - 1]
                current = emp_entries[idx]
                prev_date = _extract_date(getattr(prev, "data", None))
                current_date = _extract_date(getattr(current, "data", None))
                prev_shift = getattr(prev, "zmiana", None)
                current_shift = getattr(current, "zmiana", None)
                prev_end = _extract_time(getattr(prev_shift, "godzina_zakonczenia", None)) if prev_shift else None
                current_start = _extract_time(getattr(current_shift, "godzina_rozpoczecia", None)) if current_shift else None
                if prev_date is None or current_date is None or prev_end is None or current_start is None:
                    continue
                time_between = (
                    datetime.combine(current_date, current_start)
                    - datetime.combine(prev_date, prev_end)
                )
                if time_between < timedelta(hours=min_hours):
                    issues.append(
                        ValidationIssue(
                            level=severity_level,
                            message=(
                                f"Pracownik ID {employee_id} ma mniej niż {min_hours} godzin odpoczynku "
                                f"między zmianami {prev_date} i {current_date}"
                            ),
                            rule_code=cast(str, getattr(daily_rest_rule, "code", None)),
                        )
                    )
    
    # Validate weekly rest using rule parameters
    weekly_rest_rule = rules_by_code.get("odpoczynek_tygodniowy")
    if weekly_rest_rule:
        parameters = getattr(weekly_rest_rule, "parameters", None)
        max_consecutive = int(parameters.get("max_consecutive_days", 6)) if isinstance(parameters, dict) else 6
        severity_value = getattr(weekly_rest_rule, "severity", "warning")
        severity_level = "error" if severity_value == "HARD" else "warning"
        
        per_employee_days: DefaultDict[int, List[date]] = defaultdict(list)
        for entry in entries:
            employee_id = _extract_int(getattr(entry, "pracownik_id", None))
            entry_date = _extract_date(getattr(entry, "data", None))
            if employee_id is None or entry_date is None:
                continue
            per_employee_days[employee_id].append(entry_date)
        
        for employee_id, work_days in per_employee_days.items():
            work_days.sort()
            for i in range(len(work_days) - max_consecutive):
                if all((work_days[i+j+1] - work_days[i+j]).days == 1 for j in range(max_consecutive)):
                    issues.append(
                        ValidationIssue(
                            level=severity_level,
                            message=f"Pracownik ID {employee_id} pracuje {max_consecutive + 1} dni z rzędu, zaczynając od {work_days[i]}",
                            rule_code=cast(str, getattr(weekly_rest_rule, "code", None)),
                        )
                    )
    
    # Validate monthly working hours using rule parameters
    hours_limit_rule = rules_by_code.get("limit_godzin_miesieczny")
    if hours_limit_rule:
        parameters = getattr(hours_limit_rule, "parameters", None)
        default_limit = int(parameters.get("default_limit", 160)) if isinstance(parameters, dict) else 160
        severity_value = getattr(hours_limit_rule, "severity", "warning")
        severity_level = "error" if severity_value == "HARD" else "warning"
        
        per_employee_hours: DefaultDict[int, float] = defaultdict(float)
        for entry in entries:
            employee_id = _extract_int(getattr(entry, "pracownik_id", None))
            shift = getattr(entry, "zmiana", None)
            start_time = _extract_time(getattr(shift, "godzina_rozpoczecia", None)) if shift else None
            end_time = _extract_time(getattr(shift, "godzina_zakonczenia", None)) if shift else None
            if employee_id is None or start_time is None or end_time is None:
                continue
            duration = (
                datetime.combine(date.today(), end_time)
                - datetime.combine(date.today(), start_time)
            ).total_seconds() / 3600
            per_employee_hours[employee_id] += duration
        
        for employee_id, total_hours in per_employee_hours.items():
            # Check employee-specific limit or use default
            employee = session.get(Pracownik, employee_id)
            limit_attr = getattr(employee, "limit_godzin_miesieczny", None) if employee else None
            limit = limit_attr if isinstance(limit_attr, int) else default_limit
            
            if total_hours > limit:
                issues.append(
                    ValidationIssue(
                        level=severity_level,
                        message=(
                            f"Pracownik ID {employee_id} przekroczył limit godzin pracy "
                            f"({total_hours:.2f}/{limit})"
                        ),
                        rule_code=cast(str, getattr(hours_limit_rule, "code", None)),
                    )
                )
    
    # Validate holidays
    holiday_rule = rules_by_code.get("praca_w_swieto")
    if holiday_rule:
        severity_value = getattr(holiday_rule, "severity", "warning")
        severity_level = "error" if severity_value == "HARD" else "warning"
        holiday_dates = {
            h_date
            for h in holidays
            if isinstance(h, Holiday)
            for h_date in [ _extract_date(getattr(h, "date", None)) ]
            if h_date is not None and not bool(getattr(h, "store_closed", False))
        }
        
        for entry in entries:
            entry_date = _extract_date(getattr(entry, "data", None))
            employee_id = _extract_int(getattr(entry, "pracownik_id", None))
            if entry_date is None or employee_id is None:
                continue
            if entry_date in holiday_dates:
                issues.append(
                    ValidationIssue(
                        level=severity_level,
                        message=f"Pracownik ID {employee_id} jest przypisany do pracy w święto ({entry_date})",
                        rule_code=cast(str, getattr(holiday_rule, "code", None)),
                    )
                )
    
    # Validate shift coverage (always an error)
    issues.extend(check_shift_coverage(entries, shifts))
    
    return issues
