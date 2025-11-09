from __future__ import annotations

from datetime import date
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..database import session_scope
from ..models import Pracownik
from .utils import parse_date, response_message


bp = Blueprint("employees", __name__)


def serialize_employee(employee: Pracownik) -> Dict[str, Any]:
    return {
        "id": employee.id,
        "imie": employee.imie,
        "nazwisko": employee.nazwisko,
        "rola_id": employee.rola_id,
        "etat": employee.etat,
        "limit_godzin_miesieczny": employee.limit_godzin_miesieczny,
        "preferencje": employee.preferencje,
        "data_zatrudnienia": employee.data_zatrudnienia.isoformat()
        if isinstance(employee.data_zatrudnienia, date)
        else None,
    }


@bp.get("/pracownicy")
def list_employees():
    with session_scope() as session:
        employees = session.query(Pracownik).order_by(Pracownik.nazwisko).all()
        return jsonify([serialize_employee(emp) for emp in employees])


@bp.post("/pracownicy")
def create_employee():
    payload = request.get_json(silent=True) or {}
    required = ["imie", "nazwisko"]
    missing = [field for field in required if not payload.get(field)]
    if missing:
        return jsonify(response_message("Missing required fields", missing=missing)), 400

    employee = Pracownik(
        imie=payload["imie"],
        nazwisko=payload["nazwisko"],
        rola_id=payload.get("rola_id"),
        etat=payload.get("etat"),
        limit_godzin_miesieczny=payload.get("limit_godzin_miesieczny"),
        preferencje=payload.get("preferencje"),
        data_zatrudnienia=parse_date(payload.get("data_zatrudnienia")),
    )

    try:
        with session_scope() as session:
            session.add(employee)
            session.flush()
            data = serialize_employee(employee)
        return jsonify(data), 201
    except IntegrityError as exc:
        return (
            jsonify(response_message("Database constraint violated", error=str(exc))),
            400,
        )


def _find_employee(session, employee_id: int) -> Pracownik | None:
    return session.get(Pracownik, employee_id)


@bp.get("/pracownicy/<int:employee_id>")
def get_employee(employee_id: int):
    with session_scope() as session:
        employee = _find_employee(session, employee_id)
        if not employee:
            return jsonify(response_message("Employee not found")), 404
        return jsonify(serialize_employee(employee))


@bp.put("/pracownicy/<int:employee_id>")
def update_employee(employee_id: int):
    payload = request.get_json(silent=True) or {}

    with session_scope() as session:
        employee = _find_employee(session, employee_id)
        if not employee:
            return jsonify(response_message("Employee not found")), 404

        for attr in [
            "imie",
            "nazwisko",
            "rola_id",
            "etat",
            "limit_godzin_miesieczny",
            "preferencje",
        ]:
            if attr in payload:
                setattr(employee, attr, payload.get(attr))

        if "data_zatrudnienia" in payload:
            employee.data_zatrudnienia = parse_date(payload.get("data_zatrudnienia"))

        session.flush()
        return jsonify(serialize_employee(employee))


@bp.delete("/pracownicy/<int:employee_id>")
def delete_employee(employee_id: int):
    with session_scope() as session:
        employee = _find_employee(session, employee_id)
        if not employee:
            return jsonify(response_message("Employee not found")), 404

        session.delete(employee)
        return "", 204
