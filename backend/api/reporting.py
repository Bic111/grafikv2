from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..database import session_scope
from ..services.reporter import build_report
from .utils import response_message


bp = Blueprint("reporting", __name__)


@bp.get("/raporty")
def get_report():
    month = request.args.get("month")
    if not month:
        return jsonify(response_message("Parametr 'month' jest wymagany")), 400

    with session_scope() as session:
        try:
            report = build_report(session, month)
        except ValueError as exc:
            return jsonify(response_message("Nie udało się wygenerować raportu", error=str(exc))), 404

        return jsonify(report)
