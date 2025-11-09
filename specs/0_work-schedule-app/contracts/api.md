# API Contracts

This document outlines the API endpoints required to support the WorkSchedule PL application.

## Endpoints

### Pracownicy

- `GET /api/pracownicy`: Get all employees.
- `GET /api/pracownicy/{id}`: Get a single employee.
- `POST /api/pracownicy`: Create a new employee.
- `PUT /api/pracownicy/{id}`: Update an employee.
- `DELETE /api/pracownicy/{id}`: Delete an employee.

### Role

- `GET /api/role`: Get all roles.
- `POST /api/role`: Create a new role.
- `PUT /api/role/{id}`: Update a role.
- `DELETE /api/role/{id}`: Delete a role.

### Zmiany

- `GET /api/zmiany`: Get all shifts.
- `POST /api/zmiany`: Create a new shift.
- `PUT /api/zmiany/{id}`: Update a shift.
- `DELETE /api/zmiany/{id}`: Delete a shift.

### Grafiki

- `GET /api/grafiki/{rok}/{miesiac}`: Get the schedule for a specific month.
- `POST /api/grafiki`: Save a schedule.
- `PUT /api/grafiki/{id}`: Update a schedule.
- `POST /api/grafiki/generuj`: Generate a new schedule.

### Nieobecnosci

- `GET /api/nieobecnosci`: Get all absences.
- `POST /api/nieobecnosci`: Create a new absence.

### Inne

- `POST /api/import/excel`: Import a schedule from an Excel file.
- `GET /api/raporty`: Get reports.
