param(
    [switch]$NoFrontend
)

$repoRoot = Split-Path -Parent $PSCommandPath
$backendPath = Join-Path $repoRoot "backend"
$frontendPath = Join-Path $repoRoot "frontend"
$venvActivate = Join-Path $backendPath "venv\Scripts\Activate.ps1"

if (!(Test-Path $venvActivate)) {
    Write-Error "Nie znaleziono środowiska wirtualnego w backend\venv. Uruchom Phase 1, aby je utworzyć."
    exit 1
}

Write-Host "Uruchamiam backend..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendPath'; . '$venvActivate'; python -m backend.app"
)

if (-not $NoFrontend) {
    Write-Host "Uruchamiam frontend..."
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$frontendPath'; npm run dev"
    )
} else {
    Write-Host "Pominięto uruchomienie frontendu (parametr -NoFrontend)."
}
