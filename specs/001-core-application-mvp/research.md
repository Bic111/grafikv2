# Phase 0: Research & Decisions

This document summarizes the technical decisions made to resolve the 'NEEDS CLARIFICATION' items identified in the implementation plan.

---

### 1. Desktop App Packaging Technology

- **Decision**: **Tauri**
- **Rationale**: For a single-user desktop application, Tauri's benefits of creating lightweight, secure, and performant executables are paramount. It produces significantly smaller application bundles (~5-10 MB) compared to Electron (~100+ MB) by leveraging the operating system's native webview (WebView2 on Windows). This leads to lower memory consumption and faster startup times. The security-first architecture, with Rust on the backend, is a significant advantage for building a robust application.
- **Alternatives Considered**:
  - **Electron**: Rejected due to its large bundle size and high resource consumption, which are overkill for this project's scale. While it offers full Node.js access, the required backend logic is not complex enough to justify the overhead.

---

### 2. Local Storage Mechanism

- **Decision**: **SQLite**
- **Rationale**: The application's data model (Employees, Shifts, Absences) is inherently relational. SQLite provides a robust, file-based, and fully-featured SQL database engine that ensures data integrity (ACID compliance) and allows for complex queries. This is a more scalable and architecturally sound solution than managing relationships manually in JSON files. The initial setup complexity (IPC communication between the Rust backend and the webview) is a worthwhile investment for long-term data reliability.
- **Alternatives Considered**:
  - **File-based JSON**: Rejected because it is not suitable for relational data. It would require loading entire files into memory for simple queries and would make managing data consistency and integrity difficult, especially as features grow.

---

### 3. Testing Framework

- **Decision**: **Vitest**
- **Rationale**: As a modern testing framework built on Vite, Vitest offers superior performance and a better developer experience for a Next.js/React project compared to Jest. Its near-instant feedback in watch mode, simpler configuration, and native support for ES Modules and TypeScript align perfectly with the modern tech stack of this project. Its Jest-compatible API makes it easy to adopt.
- **Alternatives Considered**:
  - **Jest**: Rejected due to slower performance and more complex configuration in the context of a modern ESM-based project.

---

### 4. Google OR-Tools Integration Strategy

- **Decision**: **Execute via a Python script called from the Tauri backend.**
- **Rationale**: Google OR-Tools does not have official JavaScript bindings. The most flexible and common way to use it in a non-Python/Java/C++ environment is to call a dedicated Python script. In our Tauri architecture, the Rust backend will be responsible for spawning a Python child process (`python solve_schedule.py`), passing the problem data via `stdin`, and receiving the solution via `stdout`. This isolates the solver logic and allows for using the official, well-documented Python library for OR-Tools.
- **Alternatives Considered**:
  - **Node.js bindings**: Unofficial and less maintained. Using the official Python library is more reliable.

---

### 5. Gemini API Integration Strategy

- **Decision**: **Proxy through a dedicated command in the Tauri Rust backend.**
- **Rationale**: The Gemini API key must remain secure and never be exposed to the frontend. The Next.js frontend will make a request to a custom Tauri command (e.g., `invoke('gemini_solve', { ... })`). The Rust backend will then receive this request, attach the secret API key (stored securely on the server-side), and make the actual call to the Gemini API using the `@google/generative-ai` SDK or a direct HTTP client. This follows the best practice of using the backend as a secure proxy.
- **Alternatives Considered**:
  - **Next.js API Routes**: In a standard web app, this would be the solution. However, in a Tauri app with a Rust backend, centralizing all backend logic (including API proxying) in Rust is a cleaner architecture. It avoids running a separate Node.js server process just for the API routes.
