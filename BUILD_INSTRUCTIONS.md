# Build Instructions - Grafikv2 MVP

## Prerequisites Status

### ✅ Installed
- Node.js (verified working)
- Rust toolchain (verified working)
- Python 3.14.0 (verified working)
- Python OR-Tools package (verified working)

### ⚠️ Required for Production Build
- **Microsoft C++ Build Tools** (MSVC v143 or later)

## Installation of Missing Prerequisites

### Microsoft C++ Build Tools

**Why needed:** Tauri requires the MSVC linker (`link.exe`) to compile Rust code on Windows.

**Installation steps:**

1. Download Visual Studio Build Tools 2022:
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

2. Run the installer and select:
   - **"Desktop development with C++"** workload

3. This will install:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - Windows 10/11 SDK
   - CMake tools for Windows

4. Installation size: ~6GB
5. Installation time: 10-20 minutes

6. **After installation:**
   - Restart your terminal/IDE
   - Verify installation: `where link` should show path to `link.exe`

## Development Build

Once C++ Build Tools are installed:

```bash
# First-time setup
npm install

# Run development server with hot reload
npm run tauri dev
```

**Note:** First compilation takes 5-15 minutes (Rust compiles 577 packages).

## Production Build

```bash
# Build optimized Windows executable
npm run tauri build
```

**Output locations:**
- MSI Installer: `src-tauri/target/release/bundle/msi/Grafikv2_0.1.0_x64_en-US.msi`
- Standalone EXE: `src-tauri/target/release/Grafikv2.exe`

**Build time:** 10-20 minutes (first build), 2-5 minutes (incremental builds)

## Troubleshooting

### Error: `linker 'link.exe' not found`

**Cause:** Microsoft C++ Build Tools not installed or not in PATH.

**Solution:**
1. Install C++ Build Tools (see above)
2. Restart terminal
3. Verify: `where link` should output a path

### Error: `could not compile 'package_name'`

**Cause:** Rust compilation error, often due to missing dependencies.

**Solution:**
1. Clean build artifacts: `cd src-tauri && cargo clean`
2. Rebuild: `npm run tauri build`

### Error: Module not found or TypeScript errors

**Cause:** Node modules not installed or outdated.

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Phase 5 Completion Status

### ✅ Implemented Features
- Employee management
- Shift configuration
- Absence tracking
- Manual scheduling
- Schedule validation
- Local solver (OR-Tools)
- Cloud solver (Gemini AI)
- CSV export
- PDF export (print dialog)

### ✅ Code Quality
- All TODO markers resolved or documented as stub implementations
- No NEEDS CLARIFICATION markers remaining
- Documentation updated (README.md, quickstart.md)

### ⏸️ Pending (User Action Required)
- **Install Microsoft C++ Build Tools** to enable production builds
- **Run `npm run tauri build`** after installing build tools
- **Test standalone executable** on clean Windows machine

## Next Steps (After C++ Build Tools Installation)

1. Open fresh terminal (to load new PATH)
2. Navigate to project directory
3. Run build command:
   ```bash
   npm run tauri build
   ```
4. Test the installer:
   ```bash
   src-tauri/target/release/bundle/msi/Grafikv2_0.1.0_x64_en-US.msi
   ```
5. Verify application launches and all features work

## Support

- **Tauri Prerequisites Guide:** https://tauri.app/v1/guides/getting-started/prerequisites
- **Rust Installation:** https://rustup.rs/
- **Project Documentation:** See `README.md` and `specs/001-core-application-mvp/`
