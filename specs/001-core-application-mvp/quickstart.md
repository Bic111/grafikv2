# Quickstart Guide

This guide provides the basic steps to set up the development environment and build instructions for the Core Application MVP (Phase 5 - Complete).

### Prerequisites

1.  **Node.js**: Ensure you have Node.js installed (v18 or later).
2.  **Rust**: Install the Rust toolchain via [rustup](https://rustup.rs/).
3.  **Python**: Ensure you have Python installed (v3.9 or later). This is required for the OR-Tools solver script.
4.  **Tauri Prerequisites**: Follow the Tauri [prerequisites guide](https://tauri.app/v1/guides/getting-started/prerequisites) for your operating system (Windows), which includes installing the Microsoft C++ Build Tools.

### Setup Steps

1.  **Install Node.js dependencies**
    ```bash
    npm install
    ```

2.  **Install Python dependencies**
    ```bash
    pip install ortools
    ```

3.  **Run the application in development mode**
    ```bash
    npm run tauri dev
    ```

### Building the Application

To build the final standalone executable for Windows:

```bash
npm run tauri build
```

The output will be located in `src-tauri/target/release/bundle/`.

### Features Implemented (Phase 5 Complete)

**Core Functionality:**
- ✅ Employee management (add, edit, configure roles and employment types)
- ✅ Shift configuration (define shifts per day of week with time slots)
- ✅ Absence management (vacation, sick leave tracking)
- ✅ Manual schedule creation with drag-and-drop interface
- ✅ Schedule validation (11-hour rest periods, daily/weekly limits, holiday rules)

**Automated Generation:**
- ✅ Local solver (Google OR-Tools via Python subprocess)
- ✅ Cloud-based AI solver (Gemini API integration)
- ✅ Validation of AI-generated schedules

**Export & Polish:**
- ✅ CSV export (downloadable file with schedule data)
- ✅ PDF export (print-ready HTML format via browser print dialog)
- ✅ Code cleanup (removed all TODO markers, documented stub implementations)

### Optional: Gemini API Configuration

To use AI-powered schedule generation:

1. Create a `.env` file in the project root
2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```
3. Obtain a key from [Google AI Studio](https://makersuite.google.com/app/apikey)

The local OR-Tools solver works without any API configuration.
