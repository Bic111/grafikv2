from __future__ import annotations

from datetime import date, time
from typing import Dict, List

from .database import session_scope
from .models import (
    GeneratorParameter,
    Holiday,
    LaborLawRule,
    Pracownik,
    Rola,
    StaffingRequirementTemplate,
    Zmiana,
)



def seed_initial_data() -> None:
    default_roles: List[Dict] = [
        {
            "nazwa_roli": "Kierownik",
            "minimalna_obsada": 1,
            "maksymalna_obsada": 1,
        },
        {
            "nazwa_roli": "Z-ca kierownika",
            "minimalna_obsada": 1,
            "maksymalna_obsada": 1,
        },
        {
            "nazwa_roli": "SSK",
            "minimalna_obsada": 2,
            "maksymalna_obsada": 3,
        },
        {
            "nazwa_roli": "Kasjer",
            "minimalna_obsada": 3,
            "maksymalna_obsada": 6,
        },
    ]

    default_employees: List[Dict] = [
        {"imie": "Beata", "nazwisko": "Gibas", "rola": "Kierownik", "etat": "Pełen etat"},
        {"imie": "Angelika", "nazwisko": "Chabowska", "rola": "Kasjer", "etat": "3/4 etatu"},
        {"imie": "Martyna", "nazwisko": "Ziemińska", "rola": "SSK", "etat": "Pełen etat"},
        {"imie": "Dorota", "nazwisko": "Zawadzka", "rola": "Kasjer", "etat": "Pełen etat"},
        {"imie": "Karolina", "nazwisko": "Koseda", "rola": "Kasjer", "etat": "3/4 etatu"},
        {"imie": "Magdalena", "nazwisko": "Talaska", "rola": "Kasjer", "etat": "3/4 etatu"},
        {"imie": "Agnieszka", "nazwisko": "Karczewska", "rola": "Kasjer", "etat": "Pełen etat"},
        {"imie": "Sylwia", "nazwisko": "Panejko", "rola": "Kasjer", "etat": "3/4 etatu"},
        {"imie": "Agnieszka", "nazwisko": "Merszałek", "rola": "Z-ca kierownika", "etat": "Pełen etat"},
        {"imie": "Anna", "nazwisko": "Przybysz", "rola": "SSK", "etat": "Pełen etat"},
        {"imie": "Małgorzata", "nazwisko": "Korus", "rola": "SSK", "etat": "Pełen etat"},
        {"imie": "Klaudia", "nazwisko": "Borecka", "rola": "Kasjer", "etat": "3/4 etatu"},
        {"imie": "Paulina", "nazwisko": "Jakusz-Gostomska", "rola": "Kasjer", "etat": "Pełen etat"},
        {"imie": "Bożena", "nazwisko": "Stosik", "rola": "Kasjer", "etat": "Pełen etat"},
        {"imie": "Anna", "nazwisko": "Frąckowska", "rola": "Kasjer", "etat": "Pełen etat"},
    ]

    default_shifts: List[Dict] = [
        {
            "nazwa_zmiany": "Poranna",
            "start": time(hour=6, minute=0),
            "end": time(hour=14, minute=0),
            "wymagana_obsada": {"Kierownik": 1, "Kasjer": 2},
        },
        {
            "nazwa_zmiany": "Popołudniowa",
            "start": time(hour=14, minute=0),
            "end": time(hour=22, minute=0),
            "wymagana_obsada": {"Z-ca kierownika": 1, "Kasjer": 1},
        },
        {
            "nazwa_zmiany": "Weekend",
            "start": time(hour=8, minute=0),
            "end": time(hour=18, minute=0),
            "wymagana_obsada": {"SSK": 1, "Kasjer": 2},
        },
    ]

    default_holidays: List[Dict] = [
        {"date": date(2025, 1, 1), "name": "Nowy Rok", "store_closed": True},
        {"date": date(2025, 5, 1), "name": "Święto Pracy", "store_closed": True},
        {"date": date(2025, 12, 25), "name": "Boże Narodzenie", "store_closed": True},
    ]

    default_rules: List[Dict] = [
        {"code": "REST_DAILY", "name": "Odpoczynek dobowy", "category": "REST", "severity": "BLOCKING", "parameters": {"min_hours": 11}},
        {"code": "REST_WEEKLY", "name": "Odpoczynek tygodniowy", "category": "REST", "severity": "BLOCKING", "parameters": {"min_hours": 35}},
        {"code": "HOURS_WEEKLY_MAX", "name": "Maksymalny tygodniowy czas pracy", "category": "HOURS_LIMIT", "severity": "BLOCKING", "parameters": {"max_hours": 48}},
    ]

    default_generator_params: List[Dict] = [
        {
            "scenario_type": "DEFAULT",
            "weights": {"preferencje": 5, "rotacja": 3},
            "last_updated_by": "system",
        },
    ]

    with session_scope() as session:
        # (existing role and shift seeding)
        
        existing_roles = {
            role.nazwa_roli: role for role in session.query(Rola).all()
        }

        for role_data in default_roles:
            if role_data["nazwa_roli"] not in existing_roles:
                role = Rola(
                    nazwa_roli=role_data["nazwa_roli"],
                    minimalna_obsada=role_data["minimalna_obsada"],
                    maksymalna_obsada=role_data["maksymalna_obsada"],
                )
                session.add(role)
                session.flush()
                existing_roles[role.nazwa_roli] = role

        existing_shifts_map = {
            shift.nazwa_zmiany: shift for shift in session.query(Zmiana).all()
        }
        for shift_data in default_shifts:
            if shift_data["nazwa_zmiany"] not in existing_shifts_map:
                shift = Zmiana(
                    nazwa_zmiany=shift_data["nazwa_zmiany"],
                    godzina_rozpoczecia=shift_data["start"],
                    godzina_zakonczenia=shift_data["end"],
                    wymagana_obsada=shift_data["wymagana_obsada"],
                )
                session.add(shift)
                session.flush()
                existing_shifts_map[shift.nazwa_zmiany] = shift
        
        default_staffing_templates: List[Dict] = [
            {"day_type": "WEEKDAY", "shift_name": "Poranna", "role_name": "Kasjer", "min_staff": 1, "target_staff": 2},
            {"day_type": "WEEKEND", "shift_name": "Weekend", "role_name": "SSK", "min_staff": 1, "target_staff": 1},
        ]

        # Seeding logic for new entities
        for holiday_data in default_holidays:
            if not session.query(Holiday).filter_by(date=holiday_data["date"]).first():
                session.add(Holiday(**holiday_data))

        for rule_data in default_rules:
            if not session.query(LaborLawRule).filter_by(code=rule_data["code"]).first():
                session.add(LaborLawRule(**rule_data))

        for params_data in default_generator_params:
            if not session.query(GeneratorParameter).filter_by(
                scenario_type=params_data["scenario_type"]
            ).first():
                session.add(GeneratorParameter(**params_data))

        for template_data in default_staffing_templates:
            role = existing_roles.get(template_data["role_name"])
            shift = existing_shifts_map.get(template_data["shift_name"])
            if role and shift:
                if not session.query(StaffingRequirementTemplate).filter_by(day_type=template_data["day_type"], shift_id=shift.id, role_id=role.id).first():
                    session.add(StaffingRequirementTemplate(
                        day_type=template_data["day_type"],
                        shift_id=shift.id,
                        role_id=role.id,
                        min_staff=template_data["min_staff"],
                        target_staff=template_data["target_staff"],
                    ))
        
        existing_employees = {
            (employee.imie, employee.nazwisko)
            for employee in session.query(Pracownik).all()
        }


        todays_date = date.today()
        limit_map = {"Pełen etat": 168, "3/4 etatu": 126}
        for employee_data in default_employees:
            key = (employee_data["imie"], employee_data["nazwisko"])
            if key in existing_employees:
                continue

            role = existing_roles.get(employee_data["rola"])
            pracownik = Pracownik(
                imie=employee_data["imie"],
                nazwisko=employee_data["nazwisko"],
                rola_id=role.id if role else None,
                etat=employee_data["etat"],
                limit_godzin_miesieczny=limit_map.get(employee_data["etat"], 160),
                data_zatrudnienia=todays_date,
            )
            session.add(pracownik)
