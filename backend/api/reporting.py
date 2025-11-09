from __future__ import annotations

from typing import cast

from flask import Blueprint, jsonify, request, Response

from ..database import session_scope
from ..services.reporter import (
    build_report,
    build_enhanced_report,
    export_report_csv,
    export_report_json,
)
from .utils import response_message


bp = Blueprint("reporting", __name__)


@bp.get("/raporty")
def get_report():
    """
    Get monthly report with optional enhanced metrics.
    
    Query parameters:
    - month (required): Month in format YYYY-MM
    - enhanced (optional): Set to 'true' for enhanced metrics
    - format (optional): Response format (json, csv) - default json
    - include_coverage (optional): Include coverage metrics (default true)
    - include_overtime (optional): Include overtime calculations (default true)
    - include_alerts (optional): Include alerts (default true)
    """
    month = request.args.get("month")
    if not month:
        return jsonify(response_message("Parametr 'month' jest wymagany")), 400

    enhanced = request.args.get("enhanced", "false").lower() == "true"
    export_format = request.args.get("format", "json").lower()
    
    include_coverage = request.args.get("include_coverage", "true").lower() == "true"
    include_overtime = request.args.get("include_overtime", "true").lower() == "true"
    include_alerts = request.args.get("include_alerts", "true").lower() == "true"

    with session_scope() as session:
        try:
            if enhanced:
                report = build_enhanced_report(
                    session,
                    month,
                    include_coverage=include_coverage,
                    include_overtime=include_overtime,
                    include_alerts=include_alerts,
                )
            else:
                report = build_report(session, month)
        except ValueError as exc:
            return jsonify(response_message("Nie udało się wygenerować raportu", error=str(exc))), 404

        # Export to requested format
        if export_format == "csv":
            csv_data = export_report_csv(report)
            return Response(
                csv_data,
                mimetype="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=raport_{month}.csv"
                },
            )
        elif export_format == "json":
            json_data = export_report_json(report)
            return Response(
                json_data,
                mimetype="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename=raport_{month}.json"
                },
            )
        else:
            # Default: return JSON inline
            return jsonify(report)


@bp.get("/dashboard/metrics")
def get_dashboard_metrics():
    """
    Get dashboard KPI metrics for the current/latest schedule.
    
    Query parameters:
    - month (optional): Month in format YYYY-MM, defaults to latest
    """
    month = request.args.get("month")
    
    with session_scope() as session:
        # If no month specified, get the latest schedule
        if not month:
            from ..models import GrafikMiesieczny
            latest_schedule = (
                session.query(GrafikMiesieczny)
                .order_by(GrafikMiesieczny.data_utworzenia.desc())
                .first()
            )
            if not latest_schedule:
                return jsonify({
                    "metrics": {},
                    "alerts": [],
                    "message": "Brak dostępnych grafików",
                }), 200
            month_value = latest_schedule.miesiac_rok
            if month_value is None:
                return jsonify({
                    "metrics": {},
                    "alerts": [],
                    "message": "Brak dostępnych grafików",
                }), 200
            month = cast(str, month_value)
        
        try:
            report = build_enhanced_report(
                session,
                month,
                include_coverage=True,
                include_overtime=True,
                include_alerts=True,
            )
            
            # Extract key metrics for dashboard
            dashboard_data = {
                "month": month,
                "total_employees": len(report.get("working_minutes", {})),
                "total_shifts": report.get("coverage", {}).get("total_shifts", 0),
                "coverage_rate": report.get("coverage", {}).get("coverage_rate", 0),
                "employees_with_overtime": report.get("overtime", {}).get("employees_with_overtime", 0),
                "critical_alerts": len([a for a in report.get("alerts", []) if a.get("severity") == "critical"]),
                "warning_alerts": len([a for a in report.get("alerts", []) if a.get("severity") == "warning"]),
                "alerts": report.get("alerts", []),
            }
            
            return jsonify(dashboard_data)
            
        except ValueError as exc:
            return jsonify(response_message("Nie udało się pobrać metryk", error=str(exc))), 404


@bp.get("/dashboard/absences")
def get_upcoming_absences():
    """
    Get upcoming absences for dashboard display.
    
    Query parameters:
    - days_ahead (optional): Number of days to look ahead (default 30)
    """
    from datetime import datetime, timedelta
    from ..models import Nieobecnosc
    
    days_ahead = int(request.args.get("days_ahead", 30))
    today = datetime.now().date()
    future_date = today + timedelta(days=days_ahead)
    
    with session_scope() as session:
        absences = (
            session.query(Nieobecnosc)
            .filter(
                Nieobecnosc.data_od <= future_date,
                Nieobecnosc.data_do >= today,
            )
            .order_by(Nieobecnosc.data_od)
            .all()
        )
        
        absence_list = []
        for absence in absences:
            emp = absence.pracownik
            if emp:
                absence_list.append({
                    "id": absence.id,
                    "employee_id": emp.id,
                    "employee_name": f"{emp.imie} {emp.nazwisko}",
                    "type": absence.typ_nieobecnosci,
                    "date_from": absence.data_od.isoformat(),
                    "date_to": absence.data_do.isoformat(),
                    "days_until": (absence.data_od - today).days,
                })
        
        return jsonify({
            "absences": absence_list,
            "total": len(absence_list),
        })
