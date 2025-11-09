from __future__ import annotations

from datetime import date

from flask import Blueprint, jsonify, request

from ..database import session_scope
from ..models import Nieobecnosc, Pracownik
from .utils import parse_date, response_message


bp = Blueprint("absences", __name__)


def _serialize_absence(absence: Nieobecnosc):
    return {
        "id": absence.id,
        "pracownik_id": absence.pracownik_id,
        "pracownik": {
            "imie": absence.pracownik.imie if absence.pracownik else None,
            "nazwisko": absence.pracownik.nazwisko if absence.pracownik else None,
        },
        "typ_nieobecnosci": absence.typ_nieobecnosci,
        "data_od": absence.data_od.isoformat() if isinstance(absence.data_od, date) else None,
        "data_do": absence.data_do.isoformat() if isinstance(absence.data_do, date) else None,
    }


@bp.get("/nieobecnosci")
def list_absences():
    with session_scope() as session:
        absences = (
            session.query(Nieobecnosc)
            .order_by(Nieobecnosc.data_od.desc())
            .all()
        )
        return jsonify([_serialize_absence(absence) for absence in absences])


@bp.post("/nieobecnosci")
def create_absence():
    payload = request.get_json(silent=True) or {}
    required = ["pracownik_id", "typ_nieobecnosci", "data_od", "data_do"]
    missing = [field for field in required if not payload.get(field)]
    if missing:
        return jsonify(response_message("Missing fields", missing=missing)), 400

    data_od = parse_date(payload.get("data_od"))
    data_do = parse_date(payload.get("data_do"))
    if not data_od or not data_do or data_do < data_od:
        return jsonify(response_message("Invalid date range")), 400

    with session_scope() as session:
        employee = session.get(Pracownik, payload["pracownik_id"])
        if not employee:
            return jsonify(response_message("Employee not found")), 404

        absence = Nieobecnosc(
            pracownik_id=employee.id,
            typ_nieobecnosci=payload["typ_nieobecnosci"],
            data_od=data_od,
            data_do=data_do,
        )
        session.add(absence)
        session.flush()
        return jsonify(_serialize_absence(absence)), 201


@bp.put("/nieobecnosci/<int:absence_id>")
def update_absence(absence_id: int):
    payload = request.get_json(silent=True) or {}

    with session_scope() as session:
        absence = session.get(Nieobecnosc, absence_id)
        if not absence:
            return jsonify(response_message("Absence not found")), 404

        if "typ_nieobecnosci" in payload:
            absence.typ_nieobecnosci = payload["typ_nieobecnosci"]
        if "data_od" in payload:
            absence.data_od = parse_date(payload.get("data_od")) or absence.data_od
        if "data_do" in payload:
            absence.data_do = parse_date(payload.get("data_do")) or absence.data_do
        if absence.data_do < absence.data_od:
            return jsonify(response_message("Invalid date range")), 400

        session.flush()
        return jsonify(_serialize_absence(absence))


@bp.delete("/nieobecnosci/<int:absence_id>")
def delete_absence(absence_id: int):
    with session_scope() as session:
        absence = session.get(Nieobecnosc, absence_id)
        if not absence:
            return jsonify(response_message("Absence not found")), 404

        session.delete(absence)
        return "", 204
