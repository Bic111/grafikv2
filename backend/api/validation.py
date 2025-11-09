"""
Validation API endpoints.

Provides endpoints for validating schedules against labor law rules.
"""

from __future__ import annotations

from datetime import date
from calendar import monthrange

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import selectinload

from ..database import session_scope
from ..models import GrafikEntry, GrafikMiesieczny, Zmiana, Holiday, Pracownik
from ..services.walidacja import validate_schedule, validate_schedule_with_rules
from .utils import response_message


bp = Blueprint("validation", __name__)


@bp.post("/walidacja/grafik/<int:schedule_id>")
def validate_schedule_endpoint(schedule_id: int):
    """
    Validate an existing schedule.
    
    Request body (optional):
    {
        "use_rules": true,  // Use database rules (default: true)
    }
    
    Returns:
    {
        "schedule_id": 1,
        "validation_summary": {
            "total_issues": 5,
            "blocking_issues": 1,
            "warnings": 4,
            "passed": false
        },
        "issues": [
            {
                "level": "error",
                "message": "...",
                "rule_code": "odpoczynek_dobowy"
            }
        ]
    }
    """
    payload = request.get_json(silent=True) or {}
    use_rules = payload.get("use_rules", True)
    
    with session_scope() as session:
        # Get schedule
        schedule = session.get(GrafikMiesieczny, schedule_id)
        if not schedule:
            return jsonify(response_message("Grafik nie istnieje")), 404
        
        # Get entries with relationships
        entries = (
            session.query(GrafikEntry)
            .filter(GrafikEntry.grafik_miesieczny_id == schedule_id)
            .options(
                selectinload(GrafikEntry.pracownik).selectinload(Pracownik.rola),
                selectinload(GrafikEntry.zmiana),
            )
            .all()
        )
        
        if not entries:
            return jsonify({
                "schedule_id": schedule_id,
                "validation_summary": {
                    "total_issues": 0,
                    "blocking_issues": 0,
                    "warnings": 0,
                    "passed": True
                },
                "issues": [],
                "message": "Brak wpisów do walidacji"
            }), 200
        
        # Get shifts and holidays
        shifts = session.query(Zmiana).all()
        
        # Parse month from schedule
        try:
            year, month = map(int, schedule.miesiac_rok.split('-'))
            last_day = monthrange(year, month)[1]
            month_start = date(year, month, 1)
            month_end = date(year, month, last_day)
            
            holidays = (
                session.query(Holiday)
                .filter(Holiday.date >= month_start, Holiday.date <= month_end)
                .all()
            )
        except (ValueError, AttributeError):
            holidays = []
            month_start = None
            month_end = None
        
        # Validate
        if use_rules and month_start and month_end:
            issues = validate_schedule_with_rules(
                session, entries, shifts, holidays, month_start, month_end
            )
        else:
            issues = validate_schedule(entries, shifts, holidays)
        
        # Calculate summary
        blocking_count = len([i for i in issues if i.level == "error"])
        warning_count = len([i for i in issues if i.level == "warning"])
        
        return jsonify({
            "schedule_id": schedule_id,
            "validation_summary": {
                "total_issues": len(issues),
                "blocking_issues": blocking_count,
                "warnings": warning_count,
                "passed": blocking_count == 0
            },
            "issues": [issue.__dict__ for issue in issues],
            "validation_type": "rules-based" if use_rules else "basic"
        }), 200


@bp.post("/walidacja/wpisy")
def validate_entries_endpoint():
    """
    Validate a list of schedule entries without saving them.
    
    Useful for preview validation before creating/updating a schedule.
    
    Request body:
    {
        "entries": [
            {
                "pracownik_id": 1,
                "zmiana_id": 1,
                "data": "2024-01-15"
            },
            ...
        ],
        "year": 2024,
        "month": 1,
        "use_rules": true
    }
    
    Returns same format as validate_schedule_endpoint
    """
    payload = request.get_json(silent=True) or {}
    entries_data = payload.get("entries", [])
    year = payload.get("year")
    month = payload.get("month")
    use_rules = payload.get("use_rules", True)
    
    if not entries_data:
        return jsonify(response_message("Brak wpisów do walidacji")), 400
    
    if not year or not month:
        return jsonify(response_message("Wymagane parametry: year, month")), 400
    
    try:
        year = int(year)
        month = int(month)
        last_day = monthrange(year, month)[1]
        month_start = date(year, month, 1)
        month_end = date(year, month, last_day)
    except (ValueError, TypeError):
        return jsonify(response_message("Nieprawidłowe year lub month")), 400
    
    with session_scope() as session:
        # Build temporary entries for validation
        entries = []
        for entry_data in entries_data:
            try:
                entry = GrafikEntry(
                    pracownik_id=int(entry_data["pracownik_id"]),
                    zmiana_id=int(entry_data["zmiana_id"]),
                    data=date.fromisoformat(entry_data["data"]),
                )
                
                # Load relationships
                entry.pracownik = session.get(Pracownik, entry.pracownik_id)
                entry.zmiana = session.get(Zmiana, entry.zmiana_id)
                
                if not entry.pracownik or not entry.zmiana:
                    return jsonify(response_message(
                        f"Nieprawidłowy pracownik_id lub zmiana_id w wpisie"
                    )), 400
                
                entries.append(entry)
                
            except (KeyError, ValueError, TypeError) as e:
                return jsonify(response_message(
                    f"Nieprawidłowe dane wpisu: {str(e)}"
                )), 400
        
        # Get shifts and holidays
        shifts = session.query(Zmiana).all()
        holidays = (
            session.query(Holiday)
            .filter(Holiday.date >= month_start, Holiday.date <= month_end)
            .all()
        )
        
        # Validate
        if use_rules:
            issues = validate_schedule_with_rules(
                session, entries, shifts, holidays, month_start, month_end
            )
        else:
            issues = validate_schedule(entries, shifts, holidays)
        
        # Calculate summary
        blocking_count = len([i for i in issues if i.level == "error"])
        warning_count = len([i for i in issues if i.level == "warning"])
        
        return jsonify({
            "validation_summary": {
                "total_issues": len(issues),
                "blocking_issues": blocking_count,
                "warnings": warning_count,
                "passed": blocking_count == 0
            },
            "issues": [issue.__dict__ for issue in issues],
            "validation_type": "rules-based" if use_rules else "basic",
            "entry_count": len(entries)
        }), 200
