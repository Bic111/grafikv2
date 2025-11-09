from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..services import excel_importer
from .utils import response_message


bp = Blueprint("imports", __name__)


@bp.post("/import/excel")
def import_excel():
    if "file" not in request.files:
        return jsonify(response_message("Brak pliku w żądaniu")), 400
    file = request.files["file"]
    month = request.form.get("month")
    if not month:
        return jsonify(response_message("Parametr 'month' jest wymagany")), 400

    try:
        schedule, entries = excel_importer.import_schedule(month, file.stream)
    except excel_importer.ImportError as exc:
        return jsonify(response_message("Nie udało się zaimportować pliku", error=str(exc))), 400

    return jsonify(
        {
            "schedule_id": schedule.id,
            "miesiac_rok": schedule.miesiac_rok,
            "entries": len(entries),
        }
    ), 201
