# Gemini Agent Context for Grafikv2

This file provides context to the Gemini AI agent working on the Grafikv2 project.

## Project Overview

**Grafikv2** is a modern Next.js 16 application using React 19, TypeScript, and Tailwind CSS 4. It is a desktop application for employee shift scheduling.

**Core Tech Stack:**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Package Manager:** npm

## Feature: 001-core-application-mvp

This feature implements the core MVP for the scheduling application.

### Technology Choices for this Feature:
- **Desktop Packaging:** Tauri (with Rust backend)
- **Database:** SQLite (local file-based)
- **Testing:** Vitest
- **Scheduling Solver (Local):** Google OR-Tools (via Python script)
- **Scheduling Solver (Cloud):** Gemini API

### Key Architectural Patterns:
- The application is a Next.js frontend packaged in a Tauri container.
- All backend logic, database access, and solver execution is handled by the Rust backend, exposed to the frontend via Tauri commands.
- API calls to the Gemini service are securely proxied through the Rust backend.
