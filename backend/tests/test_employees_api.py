"""Test API endpoints for employees."""

import pytest
from backend.app import create_app
from backend.database import create_db_tables, session_scope
from backend.models import Base, Pracownik, Rola
from backend.sample_data import seed_initial_data


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app()
    app.config["TESTING"] = True
    
    with app.app_context():
        # Create tables
        create_db_tables()
        # Seed initial data
        seed_initial_data()
    
    yield app


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


def test_create_employee_with_etat(client):
    """Test creating employee with numeric etat value."""
    payload = {
        "imie": "Test",
        "nazwisko": "Pracownik",
        "etat": 1.0
    }
    
    response = client.post('/api/pracownicy', json=payload)
    assert response.status_code == 201
    
    data = response.get_json()
    assert data["imie"] == "Test"
    assert data["nazwisko"] == "Pracownik"
    assert data["etat"] == 1.0


def test_update_employee_etat(client):
    """Test updating employee etat from 0.25 to 1.0."""
    # First create an employee with 0.25 etat
    payload = {
        "imie": "Jan",
        "nazwisko": "Kowalski",
        "etat": 0.25
    }
    
    response = client.post('/api/pracownicy', json=payload)
    assert response.status_code == 201
    employee_id = response.get_json()["id"]
    
    # Now update to 1.0 etat
    update_payload = {
        "etat": 1.0
    }
    
    response = client.put(f'/api/pracownicy/{employee_id}', json=update_payload)
    assert response.status_code == 200
    
    data = response.get_json()
    assert data["etat"] == 1.0
    
    # Verify by getting the employee
    response = client.get(f'/api/pracownicy/{employee_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data["etat"] == 1.0


def test_get_all_employees_etat_values(client):
    """Test that all employees have correct etat values."""
    response = client.get('/api/pracownicy')
    assert response.status_code == 200
    
    employees = response.get_json()
    assert len(employees) > 0
    
    # Check that all employees have numeric etat values
    for emp in employees:
        assert "etat" in emp
        assert isinstance(emp["etat"], (int, float))
        assert emp["etat"] in [0.25, 0.5, 0.75, 1.0]


def test_update_multiple_etat_values(client):
    """Test updating etat for multiple scenarios."""
    test_cases = [
        (0.25, 0.5),
        (0.5, 0.75),
        (0.75, 1.0),
        (1.0, 0.25),
    ]
    
    for initial_etat, updated_etat in test_cases:
        # Create employee
        payload = {
            "imie": f"Test_{initial_etat}",
            "nazwisko": f"User_{updated_etat}",
            "etat": initial_etat
        }
        
        response = client.post('/api/pracownicy', json=payload)
        assert response.status_code == 201
        employee_id = response.get_json()["id"]
        
        # Update etat
        update_payload = {"etat": updated_etat}
        response = client.put(f'/api/pracownicy/{employee_id}', json=update_payload)
        assert response.status_code == 200
        
        # Verify
        data = response.get_json()
        assert data["etat"] == updated_etat, f"Failed to update from {initial_etat} to {updated_etat}"
