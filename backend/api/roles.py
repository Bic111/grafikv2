from __future__ import annotations

from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..database import session_scope
from ..models import Rola
from .utils import response_message


bp = Blueprint("roles", __name__)


def serialize_role(role: Rola) -> Dict[str, Any]:
    return {
        "id": role.id,
        "nazwa_roli": role.nazwa_roli,
        "minimalna_obsada": role.minimalna_obsada,
        "maksymalna_obsada": role.maksymalna_obsada,
    }


@bp.get("/role")
def list_roles():
    with session_scope() as session:
        roles = session.query(Rola).order_by(Rola.nazwa_roli).all()
        return jsonify([serialize_role(role) for role in roles])


@bp.post("/role")
def create_role():
    payload = request.get_json(silent=True) or {}
    if not payload.get("nazwa_roli"):
        return jsonify(response_message("Field 'nazwa_roli' is required")), 400

    role = Rola(
        nazwa_roli=payload["nazwa_roli"],
        minimalna_obsada=payload.get("minimalna_obsada"),
        maksymalna_obsada=payload.get("maksymalna_obsada"),
    )

    try:
        with session_scope() as session:
            session.add(role)
            session.flush()
            data = serialize_role(role)
        return jsonify(data), 201
    except IntegrityError as exc:
        return (
            jsonify(response_message("Database constraint violated", error=str(exc))),
            400,
        )


def _find_role(session, role_id: int) -> Rola | None:
    return session.get(Rola, role_id)


@bp.put("/role/<int:role_id>")
def update_role(role_id: int):
    payload = request.get_json(silent=True) or {}

    with session_scope() as session:
        role = _find_role(session, role_id)
        if not role:
            return jsonify(response_message("Role not found")), 404

        for attr in ["nazwa_roli", "minimalna_obsada", "maksymalna_obsada"]:
            if attr in payload:
                setattr(role, attr, payload.get(attr))

        session.flush()
        return jsonify(serialize_role(role))


@bp.delete("/role/<int:role_id>")
def delete_role(role_id: int):
    with session_scope() as session:
        role = _find_role(session, role_id)
        if not role:
            return jsonify(response_message("Role not found")), 404

        session.delete(role)
        return "", 204
