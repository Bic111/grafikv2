from __future__ import annotations

from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..database import session_scope
from ..models import ParametryZmiany
from .utils import response_message


bp = Blueprint("shift_parameters", __name__)


def serialize_shift_parameter(param: ParametryZmiany) -> Dict[str, Any]:
    return {
        "id": param.id,
        "dzien_tygodnia": param.dzien_tygodnia,
        "typ_zmiany": param.typ_zmiany,
        "godzina_od": param.godzina_od,
        "godzina_do": param.godzina_do,
        "liczba_obsad": param.liczba_obsad,
        "czy_prowadzacy": param.czy_prowadzacy,
    }


@bp.get("/shift-parameters")
def list_shift_parameters():
    """Get all shift parameters or filter by day/shift type"""
    day = request.args.get("day", type=int)
    shift_type = request.args.get("typ_zmiany", type=str)

    with session_scope() as session:
        query = session.query(ParametryZmiany)

        if day is not None:
            query = query.filter(ParametryZmiany.dzien_tygodnia == day)
        if shift_type is not None:
            query = query.filter(ParametryZmiany.typ_zmiany == shift_type)

        params = query.order_by(ParametryZmiany.dzien_tygodnia, ParametryZmiany.typ_zmiany).all()
        return jsonify([serialize_shift_parameter(p) for p in params])


@bp.get("/shift-parameters/<int:param_id>")
def get_shift_parameter(param_id: int):
    """Get a specific shift parameter by ID"""
    with session_scope() as session:
        param = session.get(ParametryZmiany, param_id)
        if not param:
            return jsonify(response_message("Shift parameter not found")), 404
        return jsonify(serialize_shift_parameter(param))


@bp.post("/shift-parameters")
def create_shift_parameter():
    """Create a new shift parameter"""
    payload = request.get_json(silent=True) or {}

    # Validate required fields
    required_fields = ["dzien_tygodnia", "typ_zmiany", "godzina_od", "godzina_do"]
    for field in required_fields:
        if field not in payload:
            return jsonify(response_message(f"Field '{field}' is required")), 400

    param = ParametryZmiany(
        dzien_tygodnia=payload["dzien_tygodnia"],
        typ_zmiany=payload["typ_zmiany"],
        godzina_od=payload["godzina_od"],
        godzina_do=payload["godzina_do"],
        liczba_obsad=payload.get("liczba_obsad"),
        czy_prowadzacy=payload.get("czy_prowadzacy", False),
    )

    try:
        with session_scope() as session:
            session.add(param)
            session.flush()
            data = serialize_shift_parameter(param)
        return jsonify(data), 201
    except IntegrityError as exc:
        return (
            jsonify(response_message("Database constraint violated", error=str(exc))),
            400,
        )


def _find_shift_parameter(session, param_id: int) -> ParametryZmiany | None:
    return session.get(ParametryZmiany, param_id)


@bp.put("/shift-parameters/<int:param_id>")
def update_shift_parameter(param_id: int):
    """Update a shift parameter"""
    payload = request.get_json(silent=True) or {}

    with session_scope() as session:
        param = _find_shift_parameter(session, param_id)
        if not param:
            return jsonify(response_message("Shift parameter not found")), 404

        if "dzien_tygodnia" in payload:
            param.dzien_tygodnia = payload["dzien_tygodnia"]
        if "typ_zmiany" in payload:
            param.typ_zmiany = payload["typ_zmiany"]
        if "godzina_od" in payload:
            param.godzina_od = payload["godzina_od"]
        if "godzina_do" in payload:
            param.godzina_do = payload["godzina_do"]
        if "liczba_obsad" in payload:
            param.liczba_obsad = payload["liczba_obsad"]
        if "czy_prowadzacy" in payload:
            param.czy_prowadzacy = payload["czy_prowadzacy"]

        session.flush()
        return jsonify(serialize_shift_parameter(param))


@bp.delete("/shift-parameters/<int:param_id>")
def delete_shift_parameter(param_id: int):
    """Delete a shift parameter"""
    with session_scope() as session:
        param = _find_shift_parameter(session, param_id)
        if not param:
            return jsonify(response_message("Shift parameter not found")), 404

        session.delete(param)
        return "", 204
