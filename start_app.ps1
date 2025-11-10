param(
    [switch]$NoFrontend,
    [switch]$Production,
    [switch]$BuildOnly,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$repoRoot = Split-Path -Parent $PSCommandPath
$backendScript = Join-Path $repoRoot "start_backend.ps1"
$frontendScript = Join-Path $repoRoot "start_frontend.ps1"

# Check if scripts exist
if (!(Test-Path $backendScript)) {
    Write-Error "Nie znaleziono skryptu start_backend.ps1"
    exit 1
}

if (!(Test-Path $frontendScript)) {
    Write-Error "Nie znaleziono skryptu start_frontend.ps1"
    exit 1
}

Write-Host "=== WorkSchedule PL - Launcher ===" -ForegroundColor Green
Write-Host ""

Write-Host "=== WorkSchedule PL - Launcher ===" -ForegroundColor Green
Write-Host ""

# Handle special modes
if ($BackendOnly) {
    Write-Host "Uruchamiam tylko backend..." -ForegroundColor Cyan
    if ($Production) {
        & $backendScript -Production
    } else {
        & $backendScript
    }
    exit $LASTEXITCODE
}

if ($FrontendOnly) {
    Write-Host "Uruchamiam tylko frontend..." -ForegroundColor Cyan
    if ($Production) {
        & $frontendScript -Production
    } elseif ($BuildOnly) {
        & $frontendScript -Build
    } else {
        & $frontendScript
    }
    exit $LASTEXITCODE
}

# Build-only mode for release package
if ($BuildOnly) {
    $releaseDir = Join-Path $repoRoot "release"
    $backendPath = Join-Path $repoRoot "backend"
    $frontendPath = Join-Path $repoRoot "frontend"
    
    Write-Host "=== Tryb produkcyjny: Budowanie aplikacji ===" -ForegroundColor Green
    
    # Create release directory
    if (!(Test-Path $releaseDir)) {
        New-Item -ItemType Directory -Path $releaseDir | Out-Null
    }
    
    # Build frontend
    Write-Host "Budowanie frontendu..." -ForegroundColor Cyan
    Push-Location $frontendPath
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Budowanie frontendu zakończone niepowodzeniem"
            exit 1
        }
    } finally {
        Pop-Location
    }
    
    # Copy backend files to release
    Write-Host "Kopiowanie plików backendu..." -ForegroundColor Cyan
    $backendReleaseDir = Join-Path $releaseDir "backend"
    if (Test-Path $backendReleaseDir) {
        Remove-Item -Recurse -Force $backendReleaseDir
    }
    Copy-Item -Recurse -Path $backendPath -Destination $backendReleaseDir -Exclude @("venv", "__pycache__", "*.pyc", ".pytest_cache", "*.db")
    
    # Copy frontend build to release
    Write-Host "Kopiowanie zbudowanego frontendu..." -ForegroundColor Cyan
    $frontendBuildDir = Join-Path $frontendPath "out"
    if (!(Test-Path $frontendBuildDir)) {
        $frontendBuildDir = Join-Path $frontendPath ".next"
    }
    
    $frontendReleaseDir = Join-Path $releaseDir "frontend"
    if (Test-Path $frontendReleaseDir) {
        Remove-Item -Recurse -Force $frontendReleaseDir
    }
    
    # Copy necessary frontend files
    Copy-Item -Recurse -Path $frontendBuildDir -Destination (Join-Path $frontendReleaseDir ".next")
    Copy-Item -Path (Join-Path $frontendPath "package.json") -Destination $frontendReleaseDir
    Copy-Item -Path (Join-Path $frontendPath "next.config.ts") -Destination $frontendReleaseDir -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $frontendPath "public") -Destination (Join-Path $frontendReleaseDir "public") -Recurse -ErrorAction SilentlyContinue
    
    # Copy documentation
    Write-Host "Kopiowanie dokumentacji..." -ForegroundColor Cyan
    $docsDir = Join-Path $repoRoot "docs"
    if (Test-Path $docsDir) {
        Copy-Item -Recurse -Path $docsDir -Destination (Join-Path $releaseDir "docs")
    }
    
    # Copy start script
    Copy-Item -Path $PSCommandPath -Destination $releaseDir
    
    # Create production start script
    $prodStartScript = @"
# WorkSchedule PL - Production Start Script
param(
    [switch]`$NoFrontend
)

`$backendPath = Join-Path `$PSScriptRoot "backend"
`$frontendPath = Join-Path `$PSScriptRoot "frontend"

Write-Host "Uruchamiam WorkSchedule PL (tryb produkcyjny)..." -ForegroundColor Green

# Start backend
Write-Host "Uruchamiam backend..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '`$backendPath'; python -m backend.app"
)

if (-not `$NoFrontend) {
    Write-Host "Uruchamiam frontend..."
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '`$frontendPath'; npm start"
    )
} else {
    Write-Host "Pominięto uruchomienie frontendu (parametr -NoFrontend)."
}

Write-Host "`nAplikacja uruchomiona!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
if (-not `$NoFrontend) {
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
}
"@
    
    $prodStartScriptPath = Join-Path $releaseDir "start_production.ps1"
    Set-Content -Path $prodStartScriptPath -Value $prodStartScript -Encoding UTF8
    
    # Create README for release package
    $releaseReadme = @"
# WorkSchedule PL - Paczka Instalacyjna

## Wymagania

- Python 3.11 lub nowszy
- Node.js 18 lub nowszy
- PowerShell 5.1 lub nowszy

## Instalacja

1. Zainstaluj zależności Python:
   ```
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. Zainstaluj zależności Node.js:
   ```
   cd frontend
   npm install --production
   ```

3. Uruchom aplikację:
   ```
   .\start_production.ps1
   ```

## Dostęp do aplikacji

- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

## Dokumentacja

Szczegółowa dokumentacja znajduje się w katalogu `docs/`.

Dla instrukcji instalacji offline, zobacz `docs/INSTRUKCJA.md`.

"@
    
    $releaseReadmePath = Join-Path $releaseDir "README.md"
    Set-Content -Path $releaseReadmePath -Value $releaseReadme -Encoding UTF8
    
    Write-Host "`n=== Budowanie zakończone ===" -ForegroundColor Green
    Write-Host "Paczka release znajduje się w: $releaseDir" -ForegroundColor Cyan
    exit 0
}

# Standard mode: Start both backend and frontend in separate windows
if ($Production) {
    Write-Host "Uruchamiam w trybie produkcyjnym..." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Uruchamiam w trybie deweloperskim..." -ForegroundColor Yellow
    Write-Host ""
}

# Start backend in new window
Write-Host "Uruchamiam backend..." -ForegroundColor Cyan
if ($Production) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", $backendScript, "-Production"
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-File", $backendScript
}

# Start frontend in new window (unless NoFrontend flag)
if (-not $NoFrontend) {
    Write-Host "Uruchamiam frontend..." -ForegroundColor Cyan
    if ($Production) {
        Start-Process powershell -ArgumentList "-NoExit", "-File", $frontendScript, "-Production"
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-File", $frontendScript
    }
} else {
    Write-Host "Pominięto uruchomienie frontendu (parametr -NoFrontend)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Aplikacja uruchomiona ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
if (-not $NoFrontend) {
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Zamknij okna terminali aby zatrzymać serwery." -ForegroundColor Yellow

