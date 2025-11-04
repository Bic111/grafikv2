# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Grafikv2** is an employee shift scheduling application packaged as a Windows desktop application. It's a modern Next.js web application (React 19, TypeScript, Tailwind CSS v4) with backend capabilities planned via Tauri (Rust) and SQLite for local storage.

**Current Status**: Core infrastructure in place; feature implementation in progress on branch `001-core-application-mvp`.

**Key Constraint**: All user-facing content must be in Polish (Constitutional Principle I).

## Development Commands

### Installation & Setup
```bash
npm install                    # Install dependencies
```

### Development
```bash
npm run dev                    # Start Next.js dev server (localhost:3000)
```

### Build & Production
```bash
npm run build                  # Build for production
npm start                      # Start production server
```

### Code Quality
```bash
npm run lint                   # Run ESLint (flat config format)
```

### Testing (Planned)
Testing framework not yet configured. **Vitest** is the planned choice.
```bash
npm run test                   # (Not yet available; plan to use Vitest)
npm run test:watch            # (Planned; watch mode)
```

### Desktop App (Planned)
Once Tauri is integrated:
```bash
npm run tauri dev              # Run with Tauri in development
npm run tauri build            # Build standalone Windows executable
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.x (strict mode)
- **UI Library**: React 19 with Server Components
- **Styling**: Tailwind CSS 4 (with `@tailwindcss/postcss` plugin)
- **Linting**: ESLint 9 with flat config format

### Backend (Planned)
- **Desktop Framework**: Tauri (Rust-based; produces ~5-10MB standalone executables)
- **Database**: SQLite (local file-based, ACID-compliant, relational)
- **Scheduler Engine**: Google OR-Tools (via Python script spawned from Rust backend)
- **AI Integration**: Gemini API (proxied through Rust backend for security)
- **IPC**: Tauri commands for frontend-backend communication

### Code Structure
```
src/
└── app/                    # Next.js App Router pages
    ├── layout.tsx          # Root layout with Geist fonts & Tailwind theme
    ├── page.tsx            # Home page
    └── globals.css         # Global styles (Tailwind v4 with dark mode)
public/                     # Static SVG assets
specs/                      # Feature specifications & implementation plans
.specify/                   # Specify framework metadata (templates, constitution)
```

## Architecture & Key Concepts

### 1. Domain Model
The application is organized around these core entities (per Constitutional Principle IV):
- **Employee**: Person with role, employment type, availability
- **Shift**: Recurring work period (day, start/end time, required staff)
- **Absence**: Employee unavailability period (vacation, sick leave, etc.)
- **ScheduleEntry**: Shift assignment (employee + shift + date)

See `specs/001-core-application-mvp/data-model.md` for full schema.

### 2. Frontend Architecture
- **Pages**: Located in `src/app/` using Next.js App Router
- **Styling**: Global Tailwind CSS v4 configuration in `globals.css` with dark mode support
- **Path Aliases**: `@/*` points to `src/*` (configured in `tsconfig.json`)
- **Fonts**: Geist Sans and Mono from `next/font/google` (configured in `layout.tsx`)

### 3. Backend Strategy (Tauri)
- **Rust Backend**: Handles database, file I/O, external API calls, and process spawning
- **Next.js Frontend**: Communicates with Rust via Tauri commands (IPC)
- **Security Model**: API keys (e.g., Gemini) stored server-side; frontend invokes commands without secrets
- **Solver Integration**: Python script (`solve_schedule.py`) spawned by Rust backend for OR-Tools

### 4. Data Validation
Per Constitutional Principle II ("Walidacja jest Niepodważalna"):
- All validation rules must be enforced strictly
- Critical errors block actions (saving schedules, accepting AI suggestions)
- Validation rules include shift rest periods, daily/weekly hour limits, holidays
- UI must clearly highlight validation violations

### 5. AI Integration
Per Constitutional Principle III ("AI Wspiera, Nie Zastępuje"):
- AI generates and optimizes schedules
- All AI suggestions must pass the same validation rules as manual changes
- User always has the final say
- Progress indicators and clear error messages required

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript strict mode, ES2017 target, path aliases |
| `next.config.ts` | Next.js configuration (minimal) |
| `postcss.config.mjs` | PostCSS with Tailwind CSS v4 plugin |
| `eslint.config.mjs` | ESLint (flat config), Next.js rules + TypeScript rules |
| `.gitignore` | Excludes node_modules, .next, .env, build artifacts, AI metadata |

## Constitutional Principles

This project operates under a formal **Constitution** (v1.0.0, ratified 2025-11-04). Key principles:

1. **Język Polski jest Podstawą**: All UI, messages, and docs must be in Polish
2. **Walidacja jest Niepodważalna**: Strict enforcement of validation rules
3. **AI Wspiera, Nie Zastępuje**: AI assists but doesn't replace user decisions
4. **Model Domeny Kieruje Rozwojem**: Domain model guides all development
5. **Elastyczność przez Konfigurację**: Key business logic must be user-configurable

See `.specify/memory/constitution.md` for full details.

## Specification Documents

The `specs/001-core-application-mvp/` directory contains:
- **spec.md**: Feature specification with user stories and requirements
- **plan.md**: Implementation plan with technical approach
- **research.md**: Technical decisions with rationale (Tauri, SQLite, Vitest, OR-Tools, Gemini)
- **data-model.md**: Database schema and entity relationships
- **quickstart.md**: Setup and build instructions (including planned Tauri commands)
- **tasks.md**: Detailed task breakdown (generated by `/speckit.tasks` command)

## Project Governance

- **Branch Model**: Features developed on branches (e.g., `001-core-application-mvp`), PRs against `main`
- **Changes**: Code changes must pass ESLint; constitutional changes require version bump + documentation
- **Git Status**: Latest 8 commits focus on PowerShell script fixes and project setup

## Useful Development Patterns

### TypeScript Path Aliases
Import from source using `@/`:
```typescript
import { MyComponent } from '@/app/components/MyComponent'
```

### Tailwind CSS v4 Theming
Dark mode is configured in `globals.css` using CSS custom properties:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### Server Components
Next.js 16 App Router uses Server Components by default. Mark client-side components with `'use client'`.

## Related Resources

- **Constitution**: `.specify/memory/constitution.md`
- **Specification**: `specs/001-core-application-mvp/spec.md`
- **Research & Decisions**: `specs/001-core-application-mvp/research.md`
- **Data Model**: `specs/001-core-application-mvp/data-model.md`
- **README**: `README.md` (Polish language overview)
