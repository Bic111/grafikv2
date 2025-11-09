"""Holidays API endpoints."""

from __future__ import annotations

from datetime import date
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..database import session_scope
from ..models import Holiday
from ..services.configuration import ConfigurationLoader
from .utils import parse_date, response_message


bp = Blueprint("holidays", __name__)


def serialize_holiday(holiday: Holiday) -> Dict[str, Any]:
    """Serialize Holiday model to dict."""
    return {
        "id": holiday.id,
        "date": holiday.date.isoformat() if isinstance(holiday.date, date) else None,
        "name": holiday.name,
        "coverage_overrides": holiday.coverage_overrides,
        "store_closed": holiday.store_closed,
    }


@bp.get("/swieta")
def list_holidays():
    """Get all holidays."""
    with session_scope() as session:
        holidays = session.query(Holiday).order_by(Holiday.date).all()
        return jsonify([serialize_holiday(h) for h in holidays])


@bp.post("/swieta")
def create_holiday():
    """Create a new holiday."""
    payload = request.get_json(silent=True) or {}
    required = ["date", "name"]
    missing = [field for field in required if not payload.get(field)]
    if missing:
        return jsonify(response_message("Missing required fields", missing=missing)), 400

    try:
        with session_scope() as session:
            loader = ConfigurationLoader(session)
            holiday = loader.create_or_update_holiday_api(payload)
            session.flush()
            data = serialize_holiday(holiday)
        return jsonify(data), 201
    except IntegrityError as exc:
        return (
            jsonify(response_message("Database constraint violated", error=str(exc))),
            400,
        )
    except ValueError as exc:
        return jsonify(response_message("Invalid date format", error=str(exc))), 400


def _find_holiday(session, holiday_id: int) -> Holiday | None:
    """Find holiday by ID."""
    return session.get(Holiday, holiday_id)


@bp.get("/swieta/<int:holiday_id>")
def get_holiday(holiday_id: int):
    """Get a specific holiday by ID."""
    with session_scope() as session:
        holiday = _find_holiday(session, holiday_id)
        if not holiday:
            return jsonify(response_message("Holiday not found")), 404
        return jsonify(serialize_holiday(holiday))


@bp.put("/swieta/<int:holiday_id>")
def update_holiday(holiday_id: int):
    """Update an existing holiday."""
    payload = request.get_json(silent=True) or {}

    with session_scope() as session:
        holiday = _find_holiday(session, holiday_id)
        if not holiday:
            return jsonify(response_message("Holiday not found")), 404

        try:
            loader = ConfigurationLoader(session)
            # Update using the existing date if not provided
            if "date" not in payload:
                payload["date"] = holiday.date.isoformat()
            
            updated = loader.create_or_update_holiday_api(payload)
            session.flush()
            return jsonify(serialize_holiday(updated))
        except ValueError as exc:
            return jsonify(response_message("Invalid date format", error=str(exc))), 400


@bp.delete("/swieta/<int:holiday_id>")
def delete_holiday(holiday_id: int):
    """Delete a holiday."""
    with session_scope() as session:
        holiday = _find_holiday(session, holiday_id)
        if not holiday:
            return jsonify(response_message("Holiday not found")), 404

        session.delete(holiday)
        return "", 204
