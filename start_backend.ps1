# WorkSchedule PL - Backend Start Script

param(
    [switch]$Production
)

$repoRoot = Split-Path -Parent $PSCommandPath
$backendPath = Join-Path $repoRoot "backend"
$venvActivate = Join-Path $backendPath "venv\Scripts\Activate.ps1"

# Check if virtual environment exists
if (!(Test-Path $venvActivate)) {
    Write-Error "Nie znaleziono środowiska wirtualnego w backend\venv."
    Write-Host "Utwórz środowisko wirtualne:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Cyan
    Write-Host "  python -m venv venv" -ForegroundColor Cyan
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Cyan
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Cyan
    exit 1
}

Set-Location $backendPath

# Activate virtual environment
Write-Host "Aktywacja środowiska wirtualnego..." -ForegroundColor Cyan
. $venvActivate

if ($Production) {
    Write-Host "=== Uruchamiam backend (PRODUKCJA) ===" -ForegroundColor Green
    $env:FLASK_ENV = "production"
} else {
    Write-Host "=== Uruchamiam backend (ROZWÓJ) ===" -ForegroundColor Green
    $env:FLASK_ENV = "development"
}

Write-Host "Backend będzie dostępny na: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Start Flask application
python -m backend.app
