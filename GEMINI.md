# Gemini Project Context: Grafikv2 - WorkSchedule PL

## Project Overview

This is a comprehensive work schedule management system designed for the Polish market. It features a Python/Flask backend that uses Google OR-Tools for automated schedule generation, ensuring compliance with Polish labor laws. The frontend is a modern web application built with Next.js and TypeScript.

The system is architected as a dual-layer application with a clear separation between the RESTful backend API and the React-based frontend.

### Key Technologies

*   **Backend:**
    *   **Framework:** Flask
    *   **Language:** Python 3.11+
    *   **ORM:** SQLAlchemy
    *   **Database:** SQLite
    *   **Optimization:** Google OR-Tools (CP-SAT)
    *   **Testing:** pytest

*   **Frontend:**
    *   **Framework:** Next.js 13+ (App Router)
    *   **Language:** TypeScript
    *   **Styling:** Tailwind CSS
    *   **UI Library:** React
    *   **Testing:** Playwright (E2E)

*   **Tooling:**
    *   Node.js 20 LTS
    *   PowerShell 7+

## Building and Running

The project uses a main PowerShell script (`start_app.ps1`) to manage development and production environments.

### Initial Setup

**1. Backend (Python):**
```powershell
cd backend
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
cd ..
```

**2. Frontend (Node.js):**
```powershell
cd frontend
npm install
cd ..
```

### Running the Application

**Development Mode:**
This command starts both the backend and frontend servers with hot-reloading.
```powershell
./start_app.ps1
```
*   **Backend API:** `http://localhost:5000`
*   **Frontend App:** `http://localhost:3000`

**Seeding Initial Data:**
To populate the database with sample employees, roles, and shifts:
```powershell
cd backend
./venv/Scripts/Activate.ps1
python -m backend.sample_data
```

### Testing

**Backend Tests (pytest):**
```powershell
cd backend
./venv/Scripts/Activate.ps1
python -m pytest tests/ -v --cov=backend
```

**Frontend Tests (Playwright E2E):**
```powershell
cd frontend
npx playwright install  # One-time setup
npx playwright test
```

## Development Conventions

*   **Backend:** Code follows PEP 8 standards, uses type hints, and includes docstrings.
*   **Frontend:** Adheres to ESLint rules, uses TypeScript in strict mode, and is built with functional components.
*   **API:** The project uses a RESTful API-first design with Polish endpoint names (e.g., `/api/pracownicy`, `/api/grafiki`). API contracts are documented in OpenAPI format.
*   **Git Workflow:**
    1.  Create a feature branch from `main`.
    2.  Implement changes and add corresponding tests.
    3.  Run all tests to ensure nothing is broken.
    4.  Create a Pull Request for review.
*   **Documentation:** Project documentation is maintained in Markdown within the `docs/` and `specs/` directories.
