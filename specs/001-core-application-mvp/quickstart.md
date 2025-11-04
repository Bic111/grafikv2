# Quickstart Guide

This guide provides the basic steps to set up the development environment for this project.

### Prerequisites

1.  **Node.js**: Ensure you have Node.js installed (v18 or later).
2.  **Rust**: Install the Rust toolchain via [rustup](https://rustup.rs/).
3.  **Python**: Ensure you have Python installed (v3.9 or later). This is required for the OR-Tools solver script.
4.  **Tauri Prerequisites**: Follow the Tauri [prerequisites guide](https://tauri.app/v1/guides/getting-started/prerequisites) for your operating system (Windows), which includes installing the Microsoft C++ Build Tools.

### Setup Steps

1.  **Clone the repository**
    ```bash
    git clone [repository-url]
    cd [repository-folder]
    ```

2.  **Install Node.js dependencies**
    ```bash
    npm install
    ```

3.  **Install Python dependencies**
    ```bash
    pip install ortools
    ```

4.  **Run the application in development mode**
    ```bash
    npm run tauri dev
    ```

### Building the Application

To build the final standalone executable for Windows:

```bash
npm run tauri build
```

The output will be located in `src-tauri/target/release/bundle/`.
