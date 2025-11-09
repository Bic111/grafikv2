from __future__ import annotations

from datetime import datetime, date

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import selectinload

from ..core.generator import GenerationError, generate_monthly_schedule
from ..database import session_scope
from ..models import GrafikEntry, GrafikMiesieczny, Nieobecnosc, Zmiana, Pracownik
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
            schedule, entries, issues = generate_monthly_schedule(session, year, month)
        except GenerationError as exc:
            return jsonify(response_message("Nie można wygenerować grafiku", error=str(exc))), 400
        shifts = session.query(Zmiana).all()
        absences = session.query(Nieobecnosc).all()

        serialized = _serialize_schedule(schedule, entries)
        serialized["issues"] = [issue.__dict__ for issue in issues]
        serialized["shifts"] = _serialize_shifts(shifts)
        serialized["absences"] = _serialize_absences(absences)
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
        issues = validate_schedule(entries, shifts)

        serialized = _serialize_schedule(schedule, entries)
        serialized["issues"] = [issue.__dict__ for issue in issues]
        serialized["shifts"] = _serialize_shifts(shifts)
        serialized["absences"] = _serialize_absences(absences)
        return jsonify(serialized)
