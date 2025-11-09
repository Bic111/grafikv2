from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Dict

from sqlalchemy.orm import Session

from ..models import GrafikEntry, GrafikMiesieczny, Nieobecnosc, Pracownik


def build_report(session: Session, month: str) -> Dict[str, object]:
    schedule = (
        session.query(GrafikMiesieczny)
        .filter(GrafikMiesieczny.miesiac_rok == month)
        .one_or_none()
    )
    if not schedule:
        raise ValueError("Grafik o podanym miesiącu nie istnieje")

    entries = (
        session.query(GrafikEntry)
        .filter(GrafikEntry.grafik_miesieczny_id == schedule.id)
        .all()
    )

    minutes_per_employee = Counter[int]()
    minutes_per_role = Counter[str]()

    for entry in entries:
        shift = entry.zmiana
        employee = entry.pracownik
        if not shift or not employee:
            continue
        duration = (
            datetime.combine(entry.data, shift.godzina_zakonczenia)
            - datetime.combine(entry.data, shift.godzina_rozpoczecia)
        ).seconds // 60
        minutes_per_employee[employee.id] += duration
        if employee.rola:
            minutes_per_role[employee.rola.nazwa_roli] += duration

    employee_ids = list(minutes_per_employee.keys())
    employees = (
        session.query(Pracownik)
        .filter(Pracownik.id.in_(employee_ids))
        .all()
        if employee_ids
        else []
    )
    absences = session.query(Nieobecnosc).all()

    return {
        "schedule": schedule.miesiac_rok,
        "working_minutes": {
            emp.id: {
                "pracownik": f"{emp.imie} {emp.nazwisko}",
                "rola": emp.rola.nazwa_roli if emp.rola else None,
                "minuty": minutes_per_employee.get(emp.id, 0),
            }
            for emp in employees
        },
        "minutes_per_role": dict(minutes_per_role),
        "absences": [
            {
                "pracownik_id": absence.pracownik_id,
                "typ": absence.typ_nieobecnosci,
                "data_od": absence.data_od.isoformat(),
                "data_do": absence.data_do.isoformat(),
            }
            for absence in absences
        ],
    }
