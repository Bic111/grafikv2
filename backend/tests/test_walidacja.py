from datetime import date, time, timedelta

from backend.models import GrafikEntry, Pracownik, Rola, Zmiana, Holiday
from backend.services.walidacja import (
    check_daily_rest,
    check_shift_coverage,
    check_weekly_rest,
    check_working_hours_limit,
    check_holidays,
)


def make_entry(day: int, role_name: str = "Kasjer", hour_start=8, hour_end=16, employee_id=1):
    role = Rola(id=1, nazwa_roli=role_name)
    employee = Pracownik(id=employee_id, imie="Jan", nazwisko="Nowak", rola=role)
    shift = Zmiana(
        id=1,
        nazwa_zmiany="Poranna",
        godzina_rozpoczecia=time(hour_start),
        godzina_zakonczenia=time(hour_end),
    )
    entry = GrafikEntry(
        id=day,
        grafik_miesieczny_id=1,
        pracownik_id=employee.id,
        zmiana_id=shift.id,
        data=date(2024, 1, day),
    )
    entry.pracownik = employee
    entry.zmiana = shift
    return entry


def test_daily_rest_violation():
    entries = [make_entry(1, hour_end=22), make_entry(2, hour_start=6)]
    issues = check_daily_rest(entries)
    assert issues
    assert issues[0].level == "warning"


def test_shift_coverage_reports_missing_roles():
    shift = Zmiana(
        id=1,
        nazwa_zmiany="Poranna",
        godzina_rozpoczecia=time(8),
        godzina_zakonczenia=time(16),
        wymagana_obsada={"Kasjer": 2},
    )
    entry = make_entry(1)
    issues = check_shift_coverage([entry], [shift])
    assert issues
    assert "brakuje" in issues[0].message


def test_weekly_rest_violation():
    entries = [make_entry(i) for i in range(1, 8)]
    issues = check_weekly_rest(entries)
    assert issues
    assert issues[0].level == "warning"


def test_working_hours_limit_exceeded():
    entries = [make_entry(i) for i in range(1, 6)]
    issues = check_working_hours_limit(entries, 40)
    assert not issues

    entries.append(make_entry(6))
    issues = check_working_hours_limit(entries, 40)
    assert issues
    assert issues[0].level == "warning"


def test_holiday_scheduling_violation():
    holiday = Holiday(date=date(2024, 1, 1), name="Nowy Rok")
    entries = [make_entry(1)]
    issues = check_holidays(entries, [holiday])
    assert issues
    assert issues[0].level == "error"
