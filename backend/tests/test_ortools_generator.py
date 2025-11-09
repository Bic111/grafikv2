from datetime import date, time

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.core.ortools_generator import OrToolsGenerator
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
    
    # Add multiple employees to make schedule feasible
    employee1 = Pracownik(id=1, imie="Anna", nazwisko="Test", rola=role)
    employee2 = Pracownik(id=2, imie="Jan", nazwisko="Kowalski", rola=role)
    employee3 = Pracownik(id=3, imie="Maria", nazwisko="Nowak", rola=role)
    session.add_all([employee1, employee2, employee3])
    
    shift = Zmiana(
        id=1,
        nazwa_zmiany="Poranna",
        godzina_rozpoczecia=time(8),
        godzina_zakonczenia=time(16),
        wymagana_obsada={"Kasjer": 1},
    )
    session.add(shift)
    session.commit()


def test_ortools_generator_success(session):
    setup_basic_data(session)
    generator = OrToolsGenerator(session, 2024, 1)
    schedule, entries, issues = generator.generate()
    assert str(schedule.miesiac_rok) == "2024-01"
    assert entries
    # OR-Tools should generate a valid schedule (warnings are acceptable, errors are not)
    blocking_issues = [issue for issue in issues if issue.level == 'error']
    assert not blocking_issues, f"Found blocking issues: {blocking_issues}"
