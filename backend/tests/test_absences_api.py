"""
Tests for absences API endpoint
Tests validation of overlapping vacations and sick leaves
"""

import pytest
from datetime import date
from backend.models import Base, Pracownik, Rola, Nieobecnosc
from backend.app import create_app


@pytest.fixture
def app():
    """Create and configure a test app instance"""
    app = create_app()
    app.config["TESTING"] = True
    yield app


@pytest.fixture
def client(app):
    """Create a test client for the app"""
    return app.test_client()


@pytest.fixture
def session(app):
    """Create a test database session"""
    from backend.database import engine, SessionLocal
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    # Setup: Create test role and employee
    role = Rola(id=1, nazwa_roli="Kasjer")
    employee = Pracownik(
        id=1,
        imie="Jan",
        nazwisko="Kowalski",
        rola_id=1,
        etat=1.0
    )
    db.add(role)
    db.add(employee)
    db.commit()
    
    yield db
    
    # Teardown
    db.close()
    Base.metadata.drop_all(bind=engine)


def test_create_vacation_success(client, session):
    """Test creating a vacation successfully"""
    payload = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "urlop",
        "data_od": "2024-01-10",
        "data_do": "2024-01-15"
    }
    
    response = client.post("/api/nieobecnosci", json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["typ_nieobecnosci"] == "urlop"
    assert data["pracownik_id"] == 1


def test_create_sick_leave_success(client, session):
    """Test creating a sick leave successfully"""
    payload = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "zwolnienie",
        "data_od": "2024-02-10",
        "data_do": "2024-02-15"
    }
    
    response = client.post("/api/nieobecnosci", json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["typ_nieobecnosci"] == "zwolnienie"


def test_vacation_overlapping_with_sick_leave_rejected(client, session):
    """Test that vacation overlapping with sick leave is rejected"""
    # First, create a sick leave
    sick_leave = Nieobecnosc(
        pracownik_id=1,
        typ_nieobecnosci="zwolnienie",
        data_od=date(2024, 3, 10),
        data_do=date(2024, 3, 15)
    )
    session.add(sick_leave)
    session.commit()
    
    # Try to create overlapping vacation
    payload = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "urlop",
        "data_od": "2024-03-12",
        "data_do": "2024-03-18"
    }
    
    response = client.post("/api/nieobecnosci", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "nakłada się" in data["message"]


def test_sick_leave_overlapping_with_vacation_rejected(client, session):
    """Test that sick leave overlapping with vacation is rejected"""
    # First, create a vacation
    vacation = Nieobecnosc(
        pracownik_id=1,
        typ_nieobecnosci="urlop",
        data_od=date(2024, 4, 10),
        data_do=date(2024, 4, 15)
    )
    session.add(vacation)
    session.commit()
    
    # Try to create overlapping sick leave
    payload = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "zwolnienie",
        "data_od": "2024-04-12",
        "data_do": "2024-04-18"
    }
    
    response = client.post("/api/nieobecnosci", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "nakłada się" in data["message"]


def test_vacation_completely_contains_sick_leave_rejected(client, session):
    """Test that vacation that completely contains a sick leave is rejected"""
    # First, create a sick leave
    sick_leave = Nieobecnosc(
        pracownik_id=1,
        typ_nieobecnosci="zwolnienie",
        data_od=date(2024, 5, 12),
        data_do=date(2024, 5, 14)
    )
    session.add(sick_leave)
    session.commit()
    
    # Try to create vacation that contains the sick leave
    payload = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "urlop",
        "data_od": "2024-05-10",
        "data_do": "2024-05-20"
    }
    
    response = client.post("/api/nieobecnosci", json=payload)
    assert response.status_code == 400


def test_non_overlapping_vacation_and_sick_leave_allowed(client, session):
    """Test that non-overlapping vacation and sick leave are allowed"""
    # Create a sick leave
    sick_leave = Nieobecnosc(
        pracownik_id=1,
        typ_nieobecnosci="zwolnienie",
        data_od=date(2024, 6, 1),
        data_do=date(2024, 6, 5)
    )
    session.add(sick_leave)
    session.commit()
    
    # Create a vacation after the sick leave
    payload = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "urlop",
        "data_od": "2024-06-10",
        "data_do": "2024-06-15"
    }
    
    response = client.post("/api/nieobecnosci", json=payload)
    assert response.status_code == 201


def test_adjacent_vacation_and_sick_leave_allowed(client, session):
    """Test that adjacent (but not overlapping) vacation and sick leave are allowed"""
    # Create a sick leave
    sick_leave = Nieobecnosc(
        pracownik_id=1,
        typ_nieobecnosci="zwolnienie",
        data_od=date(2024, 7, 1),
        data_do=date(2024, 7, 5)
    )
    session.add(sick_leave)
    session.commit()
    
    # Create a vacation starting the day after
    payload = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "urlop",
        "data_od": "2024-07-06",
        "data_do": "2024-07-10"
    }
    
    response = client.post("/api/nieobecnosci", json=payload)
    assert response.status_code == 201


def test_update_vacation_overlapping_with_sick_leave_rejected(client, session):
    """Test that updating a vacation to overlap with sick leave is rejected"""
    # Create a vacation and a sick leave
    vacation = Nieobecnosc(
        pracownik_id=1,
        typ_nieobecnosci="urlop",
        data_od=date(2024, 8, 1),
        data_do=date(2024, 8, 5)
    )
    sick_leave = Nieobecnosc(
        pracownik_id=1,
        typ_nieobecnosci="zwolnienie",
        data_od=date(2024, 8, 15),
        data_do=date(2024, 8, 20)
    )
    session.add(vacation)
    session.add(sick_leave)
    session.commit()
    
    vacation_id = vacation.id
    
    # Try to update vacation to overlap with sick leave
    payload = {
        "data_od": "2024-08-16",
        "data_do": "2024-08-19"
    }
    
    response = client.put(f"/api/nieobecnosci/{vacation_id}", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "nakłada się" in data["message"]


def test_update_vacation_without_overlap_allowed(client, session):
    """Test that updating a vacation without causing overlap is allowed"""
    # Create a vacation and a sick leave
    vacation = Nieobecnosc(
        pracownik_id=1,
        typ_nieobecnosci="urlop",
        data_od=date(2024, 9, 1),
        data_do=date(2024, 9, 5)
    )
    sick_leave = Nieobecnosc(
        pracownik_id=1,
        typ_nieobecnosci="zwolnienie",
        data_od=date(2024, 9, 15),
        data_do=date(2024, 9, 20)
    )
    session.add(vacation)
    session.add(sick_leave)
    session.commit()
    
    vacation_id = vacation.id
    
    # Update vacation to a different date range without overlap
    payload = {
        "data_od": "2024-09-07",
        "data_do": "2024-09-12"
    }
    
    response = client.put(f"/api/nieobecnosci/{vacation_id}", json=payload)
    assert response.status_code == 200


def test_multiple_vacations_allowed(client, session):
    """Test that multiple vacations for same employee are allowed"""
    # Create first vacation
    payload1 = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "urlop",
        "data_od": "2024-10-01",
        "data_do": "2024-10-05"
    }
    response1 = client.post("/api/nieobecnosci", json=payload1)
    assert response1.status_code == 201
    
    # Create second vacation
    payload2 = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "urlop",
        "data_od": "2024-10-10",
        "data_do": "2024-10-15"
    }
    response2 = client.post("/api/nieobecnosci", json=payload2)
    assert response2.status_code == 201


def test_multiple_sick_leaves_allowed(client, session):
    """Test that multiple sick leaves for same employee are allowed"""
    # Create first sick leave
    payload1 = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "zwolnienie",
        "data_od": "2024-11-01",
        "data_do": "2024-11-05"
    }
    response1 = client.post("/api/nieobecnosci", json=payload1)
    assert response1.status_code == 201
    
    # Create second sick leave
    payload2 = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "zwolnienie",
        "data_od": "2024-11-10",
        "data_do": "2024-11-15"
    }
    response2 = client.post("/api/nieobecnosci", json=payload2)
    assert response2.status_code == 201


def test_invalid_date_range_rejected(client, session):
    """Test that absence with end date before start date is rejected"""
    payload = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "urlop",
        "data_od": "2024-12-15",
        "data_do": "2024-12-10"
    }
    
    response = client.post("/api/nieobecnosci", json=payload)
    assert response.status_code == 400


def test_missing_fields_rejected(client, session):
    """Test that absence with missing required fields is rejected"""
    payload = {
        "pracownik_id": 1,
        "typ_nieobecnosci": "urlop"
        # Missing data_od and data_do
    }
    
    response = client.post("/api/nieobecnosci", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "missing" in data["message"].lower()
