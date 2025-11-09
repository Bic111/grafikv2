from __future__ import annotations

import csv
import io
from collections import Counter, defaultdict
from datetime import date, datetime, time, timedelta
from typing import Any, Dict, Iterable, List, Optional, Tuple, cast

from sqlalchemy.orm import Session

from ..models import (
    GrafikEntry,
    GrafikMiesieczny,
    Nieobecnosc,
    Pracownik,
    Zmiana,
    Rola,
    StaffingRequirementTemplate,
)


def _extract_date(value: Any) -> Optional[date]:
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    if value is None:
        return None
    try:
        return datetime.strptime(str(value), "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def _extract_time(value: Any) -> Optional[time]:
    if isinstance(value, time):
        return value
    if isinstance(value, datetime):
        return value.time()
    if value is None:
        return None
    text = str(value)
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.strptime(text, fmt).time()
        except ValueError:
            continue
    return None


def _combine_datetime(value_date: Any, value_time: Any) -> Optional[datetime]:
    date_part = _extract_date(value_date)
    time_part = _extract_time(value_time)
    if date_part is None or time_part is None:
        return None
    return datetime.combine(date_part, time_part)


def _to_int(value: Any) -> Optional[int]:
    if isinstance(value, int):
        return value
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def build_report(session: Session, month: str) -> Dict[str, object]:
    """
    Build comprehensive report for a given month.
    
    Legacy function - kept for compatibility. Use build_enhanced_report for new features.
    """
    schedule = (
        session.query(GrafikMiesieczny)
        .filter(GrafikMiesieczny.miesiac_rok == month)
        .one_or_none()
    )
    if not schedule:
        raise ValueError("Grafik o podanym miesiącu nie istnieje")

    schedule_month = cast(Optional[str], getattr(schedule, "miesiac_rok", None)) or month

    schedule_id = _to_int(getattr(schedule, "id", None))
    if schedule_id is None:
        raise ValueError("Grafik ma nieprawidłowe ID")

    entries = (
        session.query(GrafikEntry)
        .filter(GrafikEntry.grafik_miesieczny_id == schedule_id)
        .all()
    )

    minutes_per_employee: Counter[int] = Counter()
    minutes_per_role: Counter[str] = Counter()

    for entry in entries:
        shift = entry.zmiana
        employee = entry.pracownik
        if not shift or not employee:
            continue
        combined_start = _combine_datetime(entry.data, shift.godzina_rozpoczecia)
        combined_end = _combine_datetime(entry.data, shift.godzina_zakonczenia)
        if combined_start is None or combined_end is None:
            continue
        duration = int((combined_end - combined_start).total_seconds() // 60)
        emp_id = _to_int(getattr(employee, "id", None))
        if emp_id is None:
            continue
        minutes_per_employee[emp_id] += duration
        if employee.rola:
            role_name = cast(Optional[str], getattr(employee.rola, "nazwa_roli", None))
            if role_name:
                minutes_per_role[role_name] += duration

    employee_ids = list(minutes_per_employee.keys())
    employees = (
        session.query(Pracownik)
        .filter(Pracownik.id.in_(employee_ids))
        .all()
        if employee_ids
        else []
    )
    absences = session.query(Nieobecnosc).all()

    return {
        "schedule": schedule_month,
        "working_minutes": {
            emp_id: {
                "pracownik": f"{emp.imie} {emp.nazwisko}",
                "rola": cast(Optional[str], getattr(emp.rola, "nazwa_roli", None)) if emp.rola else None,
                "minuty": minutes_per_employee.get(emp_id, 0),
            }
            for emp in employees
            if (emp_id := _to_int(getattr(emp, "id", None))) is not None
        },
        "minutes_per_role": dict(minutes_per_role),
        "absences": [
            {
                "pracownik_id": _to_int(getattr(absence, "pracownik_id", None)),
                "typ": getattr(absence, "typ_nieobecnosci", None),
                "data_od": date_from.isoformat() if (date_from := _extract_date(getattr(absence, "data_od", None))) else None,
                "data_do": date_to.isoformat() if (date_to := _extract_date(getattr(absence, "data_do", None))) else None,
            }
            for absence in absences
        ],
    }


def build_enhanced_report(
    session: Session,
    month: str,
    include_coverage: bool = True,
    include_overtime: bool = True,
    include_alerts: bool = True,
) -> Dict[str, Any]:
    """
    Build enhanced report with coverage metrics, overtime tracking, and alerts.
    
    Args:
        session: Database session
        month: Month in format YYYY-MM
        include_coverage: Include shift coverage metrics
        include_overtime: Include overtime calculations
        include_alerts: Include validation alerts
    Returns:
        Comprehensive report dictionary
    """
    # Get base report data
    base_report = build_report(session, month)
    
    enhanced = {
        **base_report,
        "metadata": {
            "generated_at": datetime.utcnow().isoformat(),
            "month": month,
        }
    }
    
    # Get schedule for additional analysis
    schedule = (
        session.query(GrafikMiesieczny)
        .filter(GrafikMiesieczny.miesiac_rok == month)
        .one_or_none()
    )
    
    if not schedule:
        return enhanced
    
    schedule_id = _to_int(getattr(schedule, "id", None))
    if schedule_id is None:
        return enhanced

    entries = (
        session.query(GrafikEntry)
        .filter(GrafikEntry.grafik_miesieczny_id == schedule_id)
        .all()
    )
    
    # Coverage analysis
    if include_coverage:
        enhanced["coverage"] = _calculate_coverage_metrics(session, entries)
    
    # Overtime analysis
    if include_overtime:
        enhanced["overtime"] = _calculate_overtime(session, entries, month)
    
    # Alerts and issues
    if include_alerts:
        enhanced["alerts"] = _generate_alerts(session, entries, month)
    
    return enhanced


def _calculate_coverage_metrics(
    session: Session,
    entries: List[GrafikEntry],
) -> Dict[str, Any]:
    """Calculate shift coverage metrics."""
    coverage_by_date_shift: Dict[Tuple[date, int], Dict[int, int]] = defaultdict(lambda: defaultdict(int))

    for entry in entries:
        entry_date = _extract_date(getattr(entry, "data", None))
        shift_id = _to_int(getattr(entry, "zmiana_id", None))
        if entry_date is None or shift_id is None:
            continue
        if entry.pracownik:
            role_id = _to_int(getattr(entry.pracownik, "rola_id", None))
            if role_id is not None:
                coverage_by_date_shift[(entry_date, shift_id)][role_id] += 1
    
    # Get staffing requirements for comparison
    templates = session.query(StaffingRequirementTemplate).all()
    
    coverage_issues = []
    for (entry_date, shift_id), role_counts in coverage_by_date_shift.items():
        # Determine day type (simplified - in production, check holidays)
        day_type = "WEEKEND" if entry_date.weekday() >= 5 else "WEEKDAY"
        
        for template in templates:
            template_shift_id = _to_int(getattr(template, "shift_id", None))
            template_role_id = _to_int(getattr(template, "role_id", None))
            template_day_type = cast(Optional[str], getattr(template, "day_type", None))
            if template_shift_id != shift_id or template_day_type != day_type or template_role_id is None:
                continue

            min_staff = _to_int(getattr(template, "min_staff", None)) or 0
            target_staff = _to_int(getattr(template, "target_staff", None)) or min_staff

            actual_count = role_counts.get(template_role_id, 0)

            if actual_count < min_staff:
                    coverage_issues.append({
                        "date": entry_date.isoformat(),
                        "shift_id": shift_id,
                        "role_id": template_role_id,
                        "required": min_staff,
                        "actual": actual_count,
                        "severity": "critical",
                    })
            elif actual_count < target_staff:
                    coverage_issues.append({
                        "date": entry_date.isoformat(),
                        "shift_id": shift_id,
                        "role_id": template_role_id,
                        "required": target_staff,
                        "actual": actual_count,
                        "severity": "warning",
                    })
    
    return {
        "total_shifts": len(coverage_by_date_shift),
        "coverage_issues": coverage_issues,
        "coverage_rate": 1.0 - (len(coverage_issues) / max(len(coverage_by_date_shift), 1)),
    }


def _calculate_overtime(
    session: Session,
    entries: List[GrafikEntry],
    month: str,
) -> Dict[str, Any]:
    """Calculate overtime hours per employee."""
    hours_by_employee: Dict[int, float] = defaultdict(float)
    
    for entry in entries:
        if not entry.pracownik or not entry.zmiana:
            continue

        combined_start = _combine_datetime(entry.data, entry.zmiana.godzina_rozpoczecia)
        combined_end = _combine_datetime(entry.data, entry.zmiana.godzina_zakonczenia)
        if combined_start is None or combined_end is None:
            continue

        duration_hours = (combined_end - combined_start).total_seconds() / 3600.0

        emp_id = _to_int(getattr(entry.pracownik, "id", None))
        if emp_id is None:
            continue
        hours_by_employee[emp_id] += duration_hours
    
    # Get employee limits
    employees = session.query(Pracownik).filter(
        Pracownik.id.in_(list(hours_by_employee.keys()))
    ).all()
    
    overtime_summary = []
    for emp in employees:
        emp_id = _to_int(getattr(emp, "id", None))
        if emp_id is None:
            continue
        total_hours = hours_by_employee.get(emp_id, 0.0)
        limit = _to_int(getattr(emp, "limit_godzin_miesieczny", None)) or 160  # Default 160h/month
        
        if total_hours > limit:
            overtime_summary.append({
                "employee_id": emp_id,
                "employee_name": f"{emp.imie} {emp.nazwisko}",
                "total_hours": round(total_hours, 2),
                "limit_hours": limit,
                "overtime_hours": round(total_hours - limit, 2),
            })
    
    return {
        "employees_with_overtime": len(overtime_summary),
        "details": overtime_summary,
    }


def _generate_alerts(
    session: Session,
    entries: List[GrafikEntry],
    month: str,
) -> List[Dict[str, Any]]:
    """Generate alerts for schedule issues."""
    alerts = []
    
    # Check for employees with no assignments
    all_employees = session.query(Pracownik).all()
    assigned_employee_ids = {
        emp_id
        for entry in entries
        if (emp_id := _to_int(getattr(entry, "pracownik_id", None))) is not None
    }

    for emp in all_employees:
        emp_id = _to_int(getattr(emp, "id", None))
        if emp_id is None or emp_id in assigned_employee_ids:
            continue
            alerts.append({
                "type": "no_assignments",
                "severity": "warning",
                "message": f"Pracownik {emp.imie} {emp.nazwisko} nie ma przypisanych zmian",
            "employee_id": emp_id,
            })
    
    # Check for upcoming absences
    month_start = datetime.strptime(month, "%Y-%m").date()
    month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    
    upcoming_absences = session.query(Nieobecnosc).filter(
        Nieobecnosc.data_od <= month_end,
        Nieobecnosc.data_do >= month_start,
    ).all()
    
    for absence in upcoming_absences:
        emp = absence.pracownik
        if not emp:
            continue
        emp_id = _to_int(getattr(emp, "id", None))
        if emp_id is None:
            continue
        date_from = _extract_date(getattr(absence, "data_od", None))
        date_to = _extract_date(getattr(absence, "data_do", None))
        date_from_text = date_from.isoformat() if date_from else "-"
        date_to_text = date_to.isoformat() if date_to else "-"
        alerts.append({
            "type": "upcoming_absence",
            "severity": "info",
            "message": f"{emp.imie} {emp.nazwisko}: {getattr(absence, 'typ_nieobecnosci', None)} ({date_from_text} - {date_to_text})",
            "employee_id": emp_id,
            "absence_type": getattr(absence, "typ_nieobecnosci", None),
            "date_from": date_from.isoformat() if date_from else None,
            "date_to": date_to.isoformat() if date_to else None,
        })
    
    return alerts


def export_report_csv(report_data: Dict[str, Any]) -> str:
    """
    Export report data to CSV format.
    
    Args:
        report_data: Report dictionary from build_enhanced_report
        
    Returns:
        CSV string
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["WorkSchedule PL - Raport miesięczny"])
    writer.writerow(["Miesiąc:", report_data.get("schedule", "N/A")])
    writer.writerow(["Wygenerowano:", report_data.get("metadata", {}).get("generated_at", "N/A")])
    writer.writerow([])
    
    # Working minutes section
    if "working_minutes" in report_data:
        writer.writerow(["Przepracowane godziny"])
        writer.writerow(["ID", "Pracownik", "Rola", "Minuty", "Godziny"])
        
        for emp_id, data in report_data["working_minutes"].items():
            writer.writerow([
                emp_id,
                data.get("pracownik", ""),
                data.get("rola", ""),
                data.get("minuty", 0),
                round(data.get("minuty", 0) / 60.0, 2),
            ])
        writer.writerow([])
    
    # Overtime section
    if "overtime" in report_data:
        writer.writerow(["Nadgodziny"])
        writer.writerow(["Pracownik", "Suma godzin", "Limit", "Nadgodziny"])
        
        for overtime in report_data["overtime"].get("details", []):
            writer.writerow([
                overtime.get("employee_name", ""),
                overtime.get("total_hours", 0),
                overtime.get("limit_hours", 0),
                overtime.get("overtime_hours", 0),
            ])
        writer.writerow([])
    
    # Coverage issues
    if "coverage" in report_data:
        writer.writerow(["Problemy z obsadą"])
        writer.writerow(["Data", "Zmiana ID", "Rola ID", "Wymagane", "Rzeczywiste", "Priorytet"])
        
        for issue in report_data["coverage"].get("coverage_issues", []):
            writer.writerow([
                issue.get("date", ""),
                issue.get("shift_id", ""),
                issue.get("role_id", ""),
                issue.get("required", 0),
                issue.get("actual", 0),
                issue.get("severity", ""),
            ])
        writer.writerow([])
    
    # Alerts
    if "alerts" in report_data:
        writer.writerow(["Alerty"])
        writer.writerow(["Typ", "Priorytet", "Wiadomość"])
        
        for alert in report_data.get("alerts", []):
            writer.writerow([
                alert.get("type", ""),
                alert.get("severity", ""),
                alert.get("message", ""),
            ])
    
    return output.getvalue()


def export_report_json(report_data: Dict[str, Any]) -> str:
    """
    Export report data to JSON format.
    
    Args:
        report_data: Report dictionary from build_enhanced_report
        
    Returns:
        JSON string
    """
    import json
    return json.dumps(report_data, indent=2, ensure_ascii=False, default=str)
