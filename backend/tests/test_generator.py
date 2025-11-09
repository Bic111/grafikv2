from datetime import date, time

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.core.generator import GenerationError, generate_monthly_schedule
from backend.models import Base, GrafikEntry, Pracownik, Rola, Zmiana, Nieobecnosc


@pytest.fixture()
def session():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    with Session() as session:
        yield session


def setup_basic_data(session):
    role = Rola(id=1, nazwa_roli="Kasjer")
    session.add(role)
    employee = Pracownik(id=1, imie="Anna", nazwisko="Test", rola=role)
    session.add(employee)
    shift = Zmiana(
        id=1,
        nazwa_zmiany="Poranna",
        godzina_rozpoczecia=time(8),
        godzina_zakonczenia=time(16),
        wymagana_obsada={"Kasjer": 1},
    )
    session.add(shift)
    session.commit()


def test_generate_schedule_success(session):
    setup_basic_data(session)
    schedule, entries, issues = generate_monthly_schedule(session, 2024, 1)
    assert schedule.miesiac_rok == "2024-01"
    assert entries
    assert not issues


def test_generate_respects_absences(session):
    setup_basic_data(session)
    absence = Nieobecnosc(pracownik_id=1, typ_nieobecnosci="urlop", data_od=date(2024, 1, 1), data_do=date(2024, 1, 1))
    session.add(absence)
    session.commit()

    with pytest.raises(GenerationError):
        generate_monthly_schedule(session, 2024, 1)
