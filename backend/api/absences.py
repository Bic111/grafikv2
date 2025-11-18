from __future__ import annotations

from datetime import date

from flask import Blueprint, jsonify, request
from sqlalchemy import and_, or_

from ..database import session_scope
from ..models import Nieobecnosc, Pracownik
from .utils import parse_date, response_message


bp = Blueprint("absences", __name__)


def _check_overlapping_absence(session, pracownik_id: int, data_od: date, data_do: date, typ_nieobecnosci: str, exclude_id: int | None = None):
    """Check if there's an overlapping absence of a different type for the same employee.
    
    Args:
        session: Database session
        pracownik_id: Employee ID
        data_od: Start date of the absence
        data_do: End date of the absence
        typ_nieobecnosci: Type of absence (urlop/zwolnienie)
        exclude_id: ID of absence to exclude from check (for updates)
    
    Returns:
        Nieobecnosc object if overlap found, None otherwise
    """
    query = session.query(Nieobecnosc).filter(
        Nieobecnosc.pracownik_id == pracownik_id,
        Nieobecnosc.typ_nieobecnosci != typ_nieobecnosci,
        or_(
            # New absence starts during existing absence
            and_(Nieobecnosc.data_od <= data_od, Nieobecnosc.data_do >= data_od),
            # New absence ends during existing absence
            and_(Nieobecnosc.data_od <= data_do, Nieobecnosc.data_do >= data_do),
            # New absence completely contains existing absence
            and_(Nieobecnosc.data_od >= data_od, Nieobecnosc.data_do <= data_do)
        )
    )
    
    if exclude_id:
        query = query.filter(Nieobecnosc.id != exclude_id)
    
    return query.first()


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
    typ_nieobecnosci = request.args.get("typ_nieobecnosci")
    
    with session_scope() as session:
        query = session.query(Nieobecnosc)
        
        # Filter by type if provided
        if typ_nieobecnosci:
            query = query.filter(Nieobecnosc.typ_nieobecnosci == typ_nieobecnosci)
        
        absences = query.order_by(Nieobecnosc.data_od.desc()).all()
        return jsonify([_serialize_absence(absence) for absence in absences])


@bp.post("/nieobecnosci")
def create_absence():
    payload = request.get_json(silent=True) or {}
    print(f"[ABSENCE API] POST /nieobecnosci - payload: {payload}")
    print(f"[ABSENCE API] typ_nieobecnosci = {payload.get('typ_nieobecnosci')}")
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

        # Check for overlapping absences of different type
        overlapping = _check_overlapping_absence(
            session,
            employee.id,
            data_od,
            data_do,
            payload["typ_nieobecnosci"]
        )
        
        if overlapping:
            other_type = "urlop" if overlapping.typ_nieobecnosci == "urlop" else "zwolnienie"
            message = f"Nie można dodać {payload['typ_nieobecnosci']} - nakłada się z istniejącym {other_type} ({overlapping.data_od.isoformat()} do {overlapping.data_do.isoformat()})"
            return jsonify(response_message(message)), 400

        print(f"[ABSENCE API] Creating Nieobecnosc with typ_nieobecnosci={payload['typ_nieobecnosci']}")
        absence = Nieobecnosc(
            pracownik_id=employee.id,
            typ_nieobecnosci=payload["typ_nieobecnosci"],
            data_od=data_od,
            data_do=data_do,
        )
        session.add(absence)
        session.flush()
        print(f"[ABSENCE API] Created absence id={absence.id}, typ={absence.typ_nieobecnosci}")
        return jsonify(_serialize_absence(absence)), 201


@bp.put("/nieobecnosci/<int:absence_id>")
def update_absence(absence_id: int):
    payload = request.get_json(silent=True) or {}

    with session_scope() as session:
        absence = session.get(Nieobecnosc, absence_id)
        if not absence:
            return jsonify(response_message("Absence not found")), 404

        # Get the new values (or keep current ones)
        new_typ = payload.get("typ_nieobecnosci", absence.typ_nieobecnosci)
        new_data_od = parse_date(payload.get("data_od")) if "data_od" in payload else absence.data_od
        new_data_do = parse_date(payload.get("data_do")) if "data_do" in payload else absence.data_do
        
        if new_data_do < new_data_od:
            return jsonify(response_message("Invalid date range")), 400

        # Check for overlapping absences of different type (excluding current absence)
        overlapping = _check_overlapping_absence(
            session,
            absence.pracownik_id,
            new_data_od,
            new_data_do,
            new_typ,
            exclude_id=absence_id
        )
        
        if overlapping:
            other_type = "urlop" if overlapping.typ_nieobecnosci == "urlop" else "zwolnienie"
            message = f"Nie można zaktualizować {new_typ} - nakłada się z istniejącym {other_type} ({overlapping.data_od.isoformat()} do {overlapping.data_do.isoformat()})"
            return jsonify(response_message(message)), 400

        # Apply updates
        absence.typ_nieobecnosci = new_typ
        absence.data_od = new_data_od
        absence.data_do = new_data_do

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
