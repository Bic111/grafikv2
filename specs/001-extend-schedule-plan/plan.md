# Implementation Plan: Plan 2 – WorkSchedule PL Expansion

**Branch**: `001-extend-schedule-plan` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-extend-schedule-plan/spec.md`

## Summary

Rozszerzenie WorkSchedule PL obejmuje przygotowanie kompletnej dokumentacji (ANALIZA_KP, aktualne OpenAPI, ERD, makiety), przebudowę generatora grafików z wykorzystaniem OR-Tools, rozbudowę UI (dashboard, raporty, konfiguracja wymagań) oraz finalizację procesu dystrybucji aplikacji. Technicznie oznacza to iteracyjne wzmocnienie backendu Flask/SQLAlchemy, integrację OR-Tools z pełnym zestawem ograniczeń oraz doposażenie Next.js w nowe widoki i przepływy.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Python 3.11 (backend), TypeScript with Next.js 13 (frontend)  
**Primary Dependencies**: Flask, SQLAlchemy, Google OR-Tools, pytest, Next.js (App Router), Tailwind CSS  
**Storage**: SQLite (lokalna baza dla generatora i konfiguracji)  
**Testing**: pytest (backend), Playwright dla kluczowych scenariuszy UI  
**Target Platform**: Windows workstation (PowerShell start) + przeglądarka obsługująca Next.js build  
**Project Type**: Web application (oddzielny backend + frontend)  
**Performance Goals**: Brak formalnych celów czasowych; akceptujemy generowanie grafiku w tempie zapewnianym przez OR-Tools dla bieżącej skali  
**Constraints**: Praca w trybie offline instalacyjnym (pakiet dystrybucyjny)  
**Scale/Scope**: Jedna organizacja / pojedynczy sklep, jeden scheduler, kilkadziesiąt pracowników

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Modularity and Reusability**: Plan zakłada utrzymanie generatora, walidacji i usług raportowych jako odrębnych modułów (backend/services, backend/core) z jasnymi interfejsami API.
- **API-First Design**: Rozszerzenia OpenAPI (FR-012) zostaną przygotowane przed implementacją nowych endpointów oraz odzwierciedlą wszystkie zmiany Plan 2.
- **Walidacja i zgodność z prawem pracy**: Faza dokumentacji (ANALIZA_KP) poprzedzi rozwój OR-Tools, a testy walidacyjne zostaną zaplanowane przed kodowaniem nowych reguł.
- **Optymalizacja oparta na danych**: Plan obejmuje migrację do OR-Tools z pełnym zestawem parametrów i wag, w oparciu o przygotowaną dokumentację i dane historyczne.
- **Dokumentacja**: FR-011–FR-014 gwarantują, że wszystkie artefakty (ANALIZA_KP, OpenAPI, ERD, makiety, quickstart) będą zapisane i aktualizowane.

**Re-check (post Phase 1)**: Utworzone artefakty projektowe (research, data-model, openapi draft, quickstart, zaktualizowany agent context) potwierdzają zgodność ze wszystkimi zasadami konstytucji.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── api/
├── core/
├── services/
└── tests/

frontend/
├── app/
├── components/ (to be expanded for new widgets)
└── tests/ (do utworzenia dla e2e/regresji UI)
```

**Structure Decision**: Dwuwarstwowa aplikacja webowa utrzymuje istniejące katalogi `backend/` (Flask + OR-Tools) i `frontend/` (Next.js). Nowe elementy (makiety, quickstart, testy UI) będą dodawane w tych modułach bez zmiany globalnej architektury.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
