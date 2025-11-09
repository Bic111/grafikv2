param(
    [switch]$NoFrontend,
    [switch]$Production,
    [switch]$BuildOnly
)

$repoRoot = Split-Path -Parent $PSCommandPath
$backendPath = Join-Path $repoRoot "backend"
$frontendPath = Join-Path $repoRoot "frontend"
$venvActivate = Join-Path $backendPath "venv\Scripts\Activate.ps1"
$releaseDir = Join-Path $repoRoot "release"

if (!(Test-Path $venvActivate)) {
    Write-Error "Nie znaleziono środowiska wirtualnego w backend\venv. Uruchom Phase 1, aby je utworzyć."
    exit 1
}

# Production mode: Build and bundle application
if ($Production -or $BuildOnly) {
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
    
    if ($BuildOnly) {
        Write-Host "Tryb BuildOnly - zakończono bez uruchamiania aplikacji." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "`nUruchamianie aplikacji w trybie produkcyjnym..." -ForegroundColor Green
    # Continue to production start...
}

# Development or production start
if ($Production) {
    Write-Host "Uruchamiam backend (produkcja)..."
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$backendPath'; . '$venvActivate'; $env:FLASK_ENV='production'; python -m backend.app"
    )
    
    if (-not $NoFrontend) {
        Write-Host "Uruchamiam frontend (produkcja)..."
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "Set-Location '$frontendPath'; npm start"
        )
    }
} else {
    # Development mode (original behavior)
    Write-Host "Uruchamiam backend (rozwój)..."
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$backendPath'; . '$venvActivate'; python -m backend.app"
    )

    if (-not $NoFrontend) {
        Write-Host "Uruchamiam frontend (rozwój)..."
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "Set-Location '$frontendPath'; npm run dev"
        )
    } else {
        Write-Host "Pominięto uruchomienie frontendu (parametr -NoFrontend)."
    }
}

Write-Host "`nAplikacja uruchomiona!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
if (-not $NoFrontend) {
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
}
