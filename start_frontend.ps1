# WorkSchedule PL - Frontend Start Script

param(
    [switch]$Production,
    [switch]$Build
)

$repoRoot = Split-Path -Parent $PSCommandPath
$frontendPath = Join-Path $repoRoot "frontend"

# Check if node_modules exists
$nodeModules = Join-Path $frontendPath "node_modules"
if (!(Test-Path $nodeModules)) {
    Write-Error "Nie znaleziono node_modules w frontend."
    Write-Host "Zainstaluj zależności:" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor Cyan
    Write-Host "  npm install" -ForegroundColor Cyan
    exit 1
}

Set-Location $frontendPath

if ($Build) {
    Write-Host "=== Budowanie frontendu (produkcja) ===" -ForegroundColor Green
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Budowanie frontendu zakończone niepowodzeniem"
        exit 1
    }
    
    Write-Host "`nBudowanie zakończone pomyślnie!" -ForegroundColor Green
    Write-Host "Build znajduje się w: frontend\.next" -ForegroundColor Cyan
    exit 0
}

if ($Production) {
    Write-Host "=== Uruchamiam frontend (PRODUKCJA) ===" -ForegroundColor Green
    Write-Host "Upewnij się, że frontend został zbudowany (npm run build)" -ForegroundColor Yellow
    Write-Host "Frontend będzie dostępny na: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    npm start
} else {
    Write-Host "=== Uruchamiam frontend (ROZWÓJ) ===" -ForegroundColor Green
    Write-Host "Frontend będzie dostępny na: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    npm run dev
}
