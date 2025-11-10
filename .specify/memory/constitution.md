<!--
Sync Impact Report
- Version change: 1.1.0 (no version bump - templates synchronized, constitution unchanged)
- Templates synchronized:
  - .specify/templates/plan-template.md (Constitution Check section): ✅ updated
  - .specify/templates/spec-template.md: ✅ no changes needed
  - .specify/templates/tasks-template.md: ✅ no changes needed
- All 5 core principles aligned across templates and constitution
- Last synchronized: 2025-11-10
-->
# WorkSchedule PL Constitution

## Core Principles

### I. Modularity and Reusability
All functionalities will be developed as independent, reusable modules. Each module must have a well-defined interface and be independently testable. This ensures that the components can be easily integrated into different parts of the application or even in other projects, promoting a clean and scalable architecture.

### II. API-First Design
All modules will expose their functionalities through a well-defined API. The API design must be documented using OpenAPI/Swagger before implementation. This ensures a clear separation between the modules and the rest of the application, allowing for parallel development and easier testing.

### III. Walidacja i zgodność z prawem pracy
Każda funkcjonalność modyfikująca lub generująca grafik musi być w pierwszej kolejności sprawdzona pod kątem zgodności z polskim Kodeksem Pracy. Testy walidacyjne muszą być napisane przed implementacją logiki biznesowej, aby zagwarantować, że system nie wygeneruje nieprawidłowego grafiku.

### IV. Optymalizacja oparta na danych
System będzie wykorzystywał silnik optymalizacyjny (Google OR-Tools) do automatycznego generowania grafików. Proces ten musi być sterowany przez precyzyjnie zdefiniowane ograniczenia (prawne, biznesowe) oraz funkcję celu (np. minimalizacja nadgodzin, równomierne obciążenie), aby zapewnić jak najlepszy wynik.

### V. Dokumentacja
Kluczowe elementy systemu, takie jak API, modele danych i instrukcje uruchomieniowe, muszą być dobrze udokumentowane. Zapewni to łatwość w utrzymaniu i dalszym rozwoju aplikacji.

## Additional Constraints

The project will be developed using the following technology stack: Next.js (TypeScript) for the frontend, Python (Flask/FastAPI) for the backend, and a local SQLite database. The optimization engine will be Google OR-Tools. The application is run and managed via PowerShell scripts.

## Development Workflow

The development workflow will be based on the Gitflow workflow. The main branch will be used for the production-ready code, and the develop branch will be used for the integration of the new features. The features will be developed in separate feature branches.

## Governance

All significant code changes should be developed in separate feature branches and reviewed before being merged into the develop branch.

**Version**: 1.1.0 | **Ratified**: 2025-11-09 | **Last Amended**: 2025-11-09
