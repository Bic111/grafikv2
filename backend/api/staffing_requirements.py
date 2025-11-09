"""Staffing requirements API endpoints."""

from __future__ import annotations

from datetime import date
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..database import session_scope
from ..models import StaffingRequirementTemplate
from ..services.configuration import ConfigurationLoader
from .utils import parse_date, response_message


bp = Blueprint("staffing_requirements", __name__)


def serialize_staffing_template(template: StaffingRequirementTemplate) -> Dict[str, Any]:
    """Serialize StaffingRequirementTemplate model to dict."""
    return {
        "id": template.id,
        "day_type": template.day_type,
        "shift_id": template.shift_id,
        "role_id": template.role_id,
        "min_staff": template.min_staff,
        "target_staff": template.target_staff,
        "max_staff": template.max_staff,
        "effective_from": template.effective_from.isoformat()
        if isinstance(template.effective_from, date)
        else None,
        "effective_to": template.effective_to.isoformat()
        if isinstance(template.effective_to, date)
        else None,
    }


@bp.get("/szablony-obsady")
def list_staffing_templates():
    """Get all staffing requirement templates."""
    with session_scope() as session:
        templates = session.query(StaffingRequirementTemplate).all()
        return jsonify([serialize_staffing_template(t) for t in templates])


@bp.post("/szablony-obsady")
def create_staffing_template():
    """Create a new staffing requirement template."""
    payload = request.get_json(silent=True) or {}
    required = ["day_type", "shift_id", "role_id", "min_staff", "target_staff"]
    missing = [field for field in required if field not in payload]
    if missing:
        return jsonify(response_message("Missing required fields", missing=missing)), 400

    # Validate staff counts
    min_staff = payload.get("min_staff", 0)
    target_staff = payload.get("target_staff", 0)
    max_staff = payload.get("max_staff")

    if min_staff < 0:
        return jsonify(response_message("min_staff must be >= 0")), 400
    if target_staff < min_staff:
        return jsonify(response_message("target_staff must be >= min_staff")), 400
    if max_staff is not None and max_staff < target_staff:
        return jsonify(response_message("max_staff must be >= target_staff")), 400

    try:
        with session_scope() as session:
            loader = ConfigurationLoader(session)
            template = loader.create_or_update_staffing_template_api(payload)
            session.flush()
            data = serialize_staffing_template(template)
        return jsonify(data), 201
    except IntegrityError as exc:
        return (
            jsonify(response_message("Database constraint violated", error=str(exc))),
            400,
        )
    except ValueError as exc:
        return jsonify(response_message("Invalid data", error=str(exc))), 400


def _find_staffing_template(session, template_id: int) -> StaffingRequirementTemplate | None:
    """Find staffing template by ID."""
    return session.get(StaffingRequirementTemplate, template_id)


@bp.get("/szablony-obsady/<int:template_id>")
def get_staffing_template(template_id: int):
    """Get a specific staffing template by ID."""
    with session_scope() as session:
        template = _find_staffing_template(session, template_id)
        if not template:
            return jsonify(response_message("Staffing template not found")), 404
        return jsonify(serialize_staffing_template(template))


@bp.put("/szablony-obsady/<int:template_id>")
def update_staffing_template(template_id: int):
    """Update an existing staffing template."""
    payload = request.get_json(silent=True) or {}

    with session_scope() as session:
        template = _find_staffing_template(session, template_id)
        if not template:
            return jsonify(response_message("Staffing template not found")), 404

        try:
            loader = ConfigurationLoader(session)
            
            # Preserve existing values if not provided
            if "day_type" not in payload:
                payload["day_type"] = template.day_type
            if "shift_id" not in payload:
                payload["shift_id"] = template.shift_id
            if "role_id" not in payload:
                payload["role_id"] = template.role_id
            if "min_staff" not in payload:
                payload["min_staff"] = template.min_staff
            if "target_staff" not in payload:
                payload["target_staff"] = template.target_staff

            # Validate staff counts
            min_staff = payload.get("min_staff", 0)
            target_staff = payload.get("target_staff", 0)
            max_staff = payload.get("max_staff")

            if min_staff < 0:
                return jsonify(response_message("min_staff must be >= 0")), 400
            if target_staff < min_staff:
                return jsonify(response_message("target_staff must be >= min_staff")), 400
            if max_staff is not None and max_staff < target_staff:
                return jsonify(response_message("max_staff must be >= target_staff")), 400

            updated = loader.create_or_update_staffing_template_api(payload)
            session.flush()
            return jsonify(serialize_staffing_template(updated))
        except ValueError as exc:
            return jsonify(response_message("Invalid data", error=str(exc))), 400


@bp.delete("/szablony-obsady/<int:template_id>")
def delete_staffing_template(template_id: int):
    """Delete a staffing template."""
    with session_scope() as session:
        template = _find_staffing_template(session, template_id)
        if not template:
            return jsonify(response_message("Staffing template not found")), 404

        session.delete(template)
        return "", 204
