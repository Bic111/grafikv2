# Skrypty uruchomieniowe WorkSchedule PL

## Główny launcher: `start_app.ps1`

Uniwersalny skrypt uruchamiający aplikację w różnych trybach.

### Podstawowe użycie

```powershell
# Tryb deweloperski (backend + frontend)
./start_app.ps1

# Tryb deweloperski - tylko backend
./start_app.ps1 -NoFrontend

# Tryb produkcyjny (backend + frontend)
./start_app.ps1 -Production

# Build release package (bez uruchamiania)
./start_app.ps1 -BuildOnly
```

### Parametry

- `-NoFrontend` - Uruchom tylko backend
- `-Production` - Tryb produkcyjny (Flask production + npm start)
- `-BuildOnly` - Zbuduj paczkę release/ bez uruchamiania
- `-BackendOnly` - Uruchom tylko backend (osobne okno)
- `-FrontendOnly` - Uruchom tylko frontend (osobne okno)

## Osobne skrypty

### Backend: `start_backend.ps1`

Uruchamia tylko backend Flask.

```powershell
# Tryb deweloperski
./start_backend.ps1

# Tryb produkcyjny
./start_backend.ps1 -Production
```

**Wymagania:**
- Python 3.11+
- Środowisko wirtualne w `backend/venv/`
- Zainstalowane zależności (`pip install -r backend/requirements.txt`)

**Backend dostępny na:** http://localhost:5000

### Frontend: `start_frontend.ps1`

Uruchamia tylko frontend Next.js.

```powershell
# Tryb deweloperski
./start_frontend.ps1

# Tryb produkcyjny (wymaga wcześniejszego build)
./start_frontend.ps1 -Production

# Tylko build (bez uruchamiania)
./start_frontend.ps1 -Build
```

**Wymagania:**
- Node.js 20 LTS
- Zainstalowane zależności (`npm install` w `frontend/`)

**Frontend dostępny na:** http://localhost:3000

## Przykłady użycia

### Rozwój pełnego stosu
```powershell
# Uruchom oba serwery w osobnych oknach
./start_app.ps1
```

### Rozwój tylko backendu
```powershell
# Opcja 1: przez launcher
./start_app.ps1 -BackendOnly

# Opcja 2: bezpośrednio
./start_backend.ps1
```

### Rozwój tylko frontendu (backend już działa)
```powershell
# Opcja 1: przez launcher
./start_app.ps1 -FrontendOnly

# Opcja 2: bezpośrednio
./start_frontend.ps1
```

### Przygotowanie release package
```powershell
# Zbuduj frontend i skopiuj pliki do release/
./start_app.ps1 -BuildOnly
```

### Produkcja (po build)
```powershell
# Uruchom w trybie produkcyjnym
./start_app.ps1 -Production
```

## Zatrzymywanie serwerów

- Zamknij okna terminali w których działają serwery
- Lub użyj `Ctrl+C` w oknie terminala serwera

## Rozwiązywanie problemów

### Backend: "Nie znaleziono środowiska wirtualnego"
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend: "Nie znaleziono node_modules"
```powershell
cd frontend
npm install
```

### Port 5000 zajęty
Zmień port w `backend/app.py`:
```python
app.run(host="0.0.0.0", port=5001, debug=True)
```

### Port 3000 zajęty
Zmień port w `frontend/package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

## Struktura plików

```
Grafikv2/
├── start_app.ps1          # Główny launcher
├── start_backend.ps1      # Uruchamia backend Flask
├── start_frontend.ps1     # Uruchamia frontend Next.js
├── SCRIPTS_README.md      # Ten plik
├── backend/
│   ├── venv/              # Środowisko wirtualne Python
│   ├── app.py             # Główny plik aplikacji Flask
│   └── requirements.txt   # Zależności Python
└── frontend/
    ├── node_modules/      # Zależności Node.js
    ├── package.json       # Konfiguracja npm
    └── next.config.ts     # Konfiguracja Next.js
```
