from __future__ import annotations

from datetime import datetime, date
from time import time

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import selectinload

from ..core.generator import GenerationError
from ..core.heuristic_generator import generate_monthly_schedule as heuristic_generate
from ..core.ortools_generator import OrToolsGenerator
from ..database import session_scope
from ..models import GrafikEntry, GrafikMiesieczny, Nieobecnosc, Zmiana, Pracownik, Holiday
from ..services.walidacja import validate_schedule
from .utils import response_message


bp = Blueprint("schedules", __name__)


def _serialize_entry(entry: GrafikEntry):
    return {
        "id": entry.id,
        "data": entry.data.isoformat(),
        "pracownik_id": entry.pracownik_id,
        "pracownik": {
            "imie": entry.pracownik.imie if entry.pracownik else None,
            "nazwisko": entry.pracownik.nazwisko if entry.pracownik else None,
            "rola": entry.pracownik.rola.nazwa_roli if entry.pracownik and entry.pracownik.rola else None,
        },
        "zmiana_id": entry.zmiana_id,
        "zmiana": entry.zmiana.nazwa_zmiany if entry.zmiana else None,
    }


def _serialize_schedule(schedule: GrafikMiesieczny, entries):
    return {
        "id": schedule.id,
        "miesiac_rok": schedule.miesiac_rok,
        "status": schedule.status,
        "data_utworzenia": schedule.data_utworzenia.isoformat(),
        "entries": [_serialize_entry(entry) for entry in entries],
    }


def _serialize_shifts(shifts):
    return [
        {
            "id": shift.id,
            "nazwa_zmiany": shift.nazwa_zmiany,
            "godzina_rozpoczecia": shift.godzina_rozpoczecia.isoformat() if shift.godzina_rozpoczecia else None,
            "godzina_zakonczenia": shift.godzina_zakonczenia.isoformat() if shift.godzina_zakonczenia else None,
        }
        for shift in shifts
    ]


def _serialize_absences(absences):
    return [
        {
            "id": absence.id,
            "pracownik_id": absence.pracownik_id,
            "typ_nieobecnosci": absence.typ_nieobecnosci,
            "data_od": absence.data_od.isoformat(),
            "data_do": absence.data_do.isoformat(),
        }
        for absence in absences
    ]


@bp.post("/grafiki/generuj")
def generate_schedule():
    payload = request.get_json(silent=True) or {}
    month = payload.get("month")
    year = payload.get("year")
    generator_type = payload.get("generator_type", "heuristic")  # "heuristic" or "ortools"
    scenario_type = payload.get("scenario_type", "DEFAULT")  # For OR-Tools: DEFAULT, NIGHT_FOCUS, etc.

    # Validate generator_type
    if generator_type not in ["heuristic", "ortools"]:
        return jsonify(response_message(
            "Parametr 'generator_type' musi być 'heuristic' lub 'ortools'"
        )), 400

    try:
        if not month or not year:
            today = datetime.utcnow().date()
            month = month or today.month
            year = year or today.year
        month = int(month)
        year = int(year)
    except (TypeError, ValueError):
        return jsonify(response_message("Parametry 'month' i 'year' muszą być liczbami")), 400

    with session_scope() as session:
        try:
            # Measure generation time
            start_time = time()
            
            if generator_type == "ortools":
                # Use OR-Tools generator
                generator = OrToolsGenerator(session, year, month, scenario_type)
                schedule, entries, issues = generator.generate()
                runtime_ms = int((time() - start_time) * 1000)
            else:
                # Use heuristic generator
                schedule, entries, issues = heuristic_generate(session, year, month)
                runtime_ms = int((time() - start_time) * 1000)
                
        except GenerationError as exc:
            return jsonify(response_message("Nie można wygenerować grafiku", error=str(exc))), 400
            
        shifts = session.query(Zmiana).all()
        absences = session.query(Nieobecnosc).all()

        serialized = _serialize_schedule(schedule, entries)
        serialized["issues"] = [issue.__dict__ for issue in issues]
        serialized["shifts"] = _serialize_shifts(shifts)
        serialized["absences"] = _serialize_absences(absences)
        
        # Add diagnostics
        serialized["diagnostics"] = {
            "generator_type": generator_type,
            "scenario_type": scenario_type if generator_type == "ortools" else None,
            "runtime_ms": runtime_ms,
            "entry_count": len(entries),
            "issue_count": len(issues),
            "blocking_issues": len([i for i in issues if i.level == "error"]),
            "warning_issues": len([i for i in issues if i.level == "warning"]),
        }
        
        return jsonify(serialized), 200


@bp.get("/grafiki/ostatni")
def latest_schedule():
    with session_scope() as session:
        schedule = (
            session.query(GrafikMiesieczny)
            .order_by(GrafikMiesieczny.data_utworzenia.desc())
            .first()
        )
        if not schedule:
            return jsonify(response_message("Brak wygenerowanych grafików")), 404

        entries = (
            session.query(GrafikEntry)
            .filter(GrafikEntry.grafik_miesieczny_id == schedule.id)
            .order_by(GrafikEntry.data, GrafikEntry.zmiana_id)
            .all()
        )
        shifts = session.query(Zmiana).all()

        data = _serialize_schedule(schedule, entries)
        data["shifts"] = _serialize_shifts(shifts)
        data["absences"] = _serialize_absences(session.query(Nieobecnosc).all())
        return jsonify(data)


@bp.put("/grafiki/<int:schedule_id>")
def update_schedule(schedule_id: int):
    payload = request.get_json(silent=True) or {}
    entries_payload = payload.get("entries")
    if not isinstance(entries_payload, list):
        return jsonify(response_message("Pole 'entries' musi być listą")), 400

    with session_scope() as session:
        schedule = session.get(GrafikMiesieczny, schedule_id)
        if not schedule:
            return jsonify(response_message("Grafik nie istnieje")), 404

        session.query(GrafikEntry).filter(
            GrafikEntry.grafik_miesieczny_id == schedule_id
        ).delete()

        for row in entries_payload:
            try:
                entry = GrafikEntry(
                    grafik_miesieczny_id=schedule_id,
                    pracownik_id=int(row["pracownik_id"]),
                    zmiana_id=int(row["zmiana_id"]),
                    data=date.fromisoformat(row["data"]),
                )
            except (KeyError, ValueError):
                return jsonify(response_message("Nieprawidłowe dane wpisu grafiku")), 400
            session.add(entry)

        schedule.status = payload.get("status", schedule.status)
        session.flush()

        entries = (
            session.query(GrafikEntry)
            .filter(GrafikEntry.grafik_miesieczny_id == schedule_id)
            .options(
                selectinload(GrafikEntry.pracownik).selectinload(Pracownik.rola),
                selectinload(GrafikEntry.zmiana),
            )
            .order_by(GrafikEntry.data, GrafikEntry.zmiana_id)
            .all()
        )
        shifts = session.query(Zmiana).all()
        absences = session.query(Nieobecnosc).all()
        
        # Fetch holidays for the schedule month
        try:
            year, month = map(int, schedule.miesiac_rok.split('-'))
            from calendar import monthrange
            month_start = date(year, month, 1)
            last_day = monthrange(year, month)[1]
            month_end = date(year, month, last_day)
            holidays = (
                session.query(Holiday)
                .filter(Holiday.date >= month_start, Holiday.date <= month_end)
                .all()
            )
        except (ValueError, AttributeError):
            holidays = []
        
        issues = validate_schedule(entries, shifts, holidays)

        serialized = _serialize_schedule(schedule, entries)
        serialized["issues"] = [issue.__dict__ for issue in issues]
        serialized["shifts"] = _serialize_shifts(shifts)
        serialized["absences"] = _serialize_absences(absences)
        return jsonify(serialized)
