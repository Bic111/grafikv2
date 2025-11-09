from datetime import date, time

from backend.models import GrafikEntry, Pracownik, Rola, Zmiana
from backend.services.walidacja import check_daily_rest, check_shift_coverage


def make_entry(day: int, role_name: str = "Kasjer"):
    role = Rola(id=1, nazwa_roli=role_name)
    employee = Pracownik(id=day, imie="Jan", nazwisko="Nowak", rola=role)
    shift = Zmiana(id=1, nazwa_zmiany="Poranna", godzina_rozpoczecia=time(8), godzina_zakonczenia=time(16))
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
    entries = [make_entry(1), make_entry(1)]
    issues = check_daily_rest(entries)
    assert issues
    assert issues[0].level == "warning"


def test_shift_coverage_reports_missing_roles():
    shift = Zmiana(id=1, nazwa_zmiany="Poranna", godzina_rozpoczecia=time(8), godzina_zakonczenia=time(16), wymagana_obsada={"Kasjer": 2})
    entry = make_entry(1)
    issues = check_shift_coverage([entry], [shift])
    assert issues
    assert "brakuje" in issues[0].message
