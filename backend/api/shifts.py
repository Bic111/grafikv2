from __future__ import annotations

from datetime import time
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..database import session_scope
from ..models import Zmiana
from .utils import parse_time, response_message


bp = Blueprint("shifts", __name__)


def serialize_shift(shift: Zmiana) -> Dict[str, Any]:
    return {
        "id": shift.id,
        "nazwa_zmiany": shift.nazwa_zmiany,
        "godzina_rozpoczecia": shift.godzina_rozpoczecia.isoformat()
        if isinstance(shift.godzina_rozpoczecia, time)
        else None,
        "godzina_zakonczenia": shift.godzina_zakonczenia.isoformat()
        if isinstance(shift.godzina_zakonczenia, time)
        else None,
        "wymagana_obsada": shift.wymagana_obsada,
    }


@bp.get("/zmiany")
def list_shifts():
    with session_scope() as session:
        shifts = session.query(Zmiana).order_by(Zmiana.nazwa_zmiany).all()
        return jsonify([serialize_shift(shift) for shift in shifts])


@bp.post("/zmiany")
def create_shift():
    payload = request.get_json(silent=True) or {}
    if not payload.get("nazwa_zmiany"):
        return jsonify(response_message("Field 'nazwa_zmiany' is required")), 400

    shift = Zmiana(
        nazwa_zmiany=payload["nazwa_zmiany"],
        godzina_rozpoczecia=parse_time(payload.get("godzina_rozpoczecia")),
        godzina_zakonczenia=parse_time(payload.get("godzina_zakonczenia")),
        wymagana_obsada=payload.get("wymagana_obsada"),
    )

    try:
        with session_scope() as session:
            session.add(shift)
            session.flush()
            data = serialize_shift(shift)
        return jsonify(data), 201
    except IntegrityError as exc:
        return (
            jsonify(response_message("Database constraint violated", error=str(exc))),
            400,
        )


def _find_shift(session, shift_id: int) -> Zmiana | None:
    return session.get(Zmiana, shift_id)


@bp.put("/zmiany/<int:shift_id>")
def update_shift(shift_id: int):
    payload = request.get_json(silent=True) or {}

    with session_scope() as session:
        shift = _find_shift(session, shift_id)
        if not shift:
            return jsonify(response_message("Shift not found")), 404

        if "nazwa_zmiany" in payload:
            shift.nazwa_zmiany = payload.get("nazwa_zmiany")
        if "godzina_rozpoczecia" in payload:
            shift.godzina_rozpoczecia = parse_time(payload.get("godzina_rozpoczecia"))
        if "godzina_zakonczenia" in payload:
            shift.godzina_zakonczenia = parse_time(payload.get("godzina_zakonczenia"))
        if "wymagana_obsada" in payload:
            shift.wymagana_obsada = payload.get("wymagana_obsada")

        session.flush()
        return jsonify(serialize_shift(shift))


@bp.delete("/zmiany/<int:shift_id>")
def delete_shift(shift_id: int):
    with session_scope() as session:
        shift = _find_shift(session, shift_id)
        if not shift:
            return jsonify(response_message("Shift not found")), 404

        session.delete(shift)
        return "", 204
