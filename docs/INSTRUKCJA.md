# WorkSchedule PL - Instrukcja Instalacji Offline

## Spis treści

1. [Wymagania systemowe](#wymagania-systemowe)
2. [Przygotowanie środowiska](#przygotowanie-środowiska)
3. [Instalacja krok po kroku](#instalacja-krok-po-kroku)
4. [Pierwsze uruchomienie](#pierwsze-uruchomienie)
5. [Konfiguracja](#konfiguracja)
6. [Rozwiązywanie problemów](#rozwiązywanie-problemów)

---

## Wymagania systemowe

### Minimalne wymagania

- **System operacyjny**: Windows 10/11 (64-bit)
- **Procesor**: Intel Core i3 lub równoważny
- **RAM**: 4 GB
- **Dysk**: 2 GB wolnej przestrzeni
- **Połączenie sieciowe**: Nie wymagane po instalacji

### Wymagane oprogramowanie

1. **Python 3.11 lub nowszy**
   - Pobierz z: https://www.python.org/downloads/
   - Podczas instalacji zaznacz "Add Python to PATH"

2. **Node.js 18 LTS lub nowszy**
   - Pobierz z: https://nodejs.org/
   - Zalecana wersja LTS (Long Term Support)

3. **PowerShell 5.1 lub nowszy**
   - Wbudowany w Windows 10/11
   - Sprawdź wersję: `$PSVersionTable.PSVersion`

### Sprawdzenie wymagań

Przed instalacją sprawdź dostępność wymaganych narzędzi:

```powershell
# Sprawdź Python
python --version

# Sprawdź Node.js
node --version

# Sprawdź npm
npm --version

# Sprawdź PowerShell
$PSVersionTable.PSVersion
```

---

## Przygotowanie środowiska

### 1. Pobieranie paczki instalacyjnej

Jeśli otrzymałeś paczkę jako archiwum ZIP:

1. Rozpakuj archiwum do wybranego katalogu (np. `C:\WorkSchedule`)
2. Upewnij się, że struktura katalogów jest zachowana:
   ```
   WorkSchedule/
   ├── backend/
   ├── frontend/
   ├── docs/
   ├── start_production.ps1
   └── README.md
   ```

### 2. Generowanie paczki release (dla deweloperów)

Jeśli masz dostęp do repozytorium źródłowego:

```powershell
cd D:\graf\Grafikv2
.\start_app.ps1 -Production -BuildOnly
```

Paczka zostanie wygenerowana w katalogu `release/`.

---

## Instalacja krok po kroku

### Krok 1: Instalacja zależności backendu

1. Otwórz PowerShell jako administrator
2. Przejdź do katalogu backendu:
   ```powershell
   cd C:\WorkSchedule\backend
   ```

3. Utwórz środowisko wirtualne Python:
   ```powershell
   python -m venv venv
   ```

4. Aktywuj środowisko wirtualne:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   
   **Uwaga**: Jeśli pojawi się błąd dotyczący polityki wykonywania skryptów:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

5. Zainstaluj zależności Python:
   ```powershell
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

6. Zainicjalizuj bazę danych:
   ```powershell
   python -c "from database import create_db_tables; create_db_tables()"
   ```

### Krok 2: Instalacja zależności frontendu

1. Otwórz nowe okno PowerShell
2. Przejdź do katalogu frontendu:
   ```powershell
   cd C:\WorkSchedule\frontend
   ```

3. Zainstaluj zależności Node.js:
   ```powershell
   npm install --production
   ```
   
   Lub dla pełnej instalacji (jeśli potrzebujesz narzędzi deweloperskich):
   ```powershell
   npm install
   ```

### Krok 3: Konfiguracja środowiska

1. **Backend** - Utwórz plik `.env` w katalogu `backend/`:
   ```env
   DATABASE_URL=sqlite:///work_schedule.db
   FLASK_ENV=production
   SECRET_KEY=zmien-na-bezpieczny-klucz
   ```

2. **Frontend** - Utwórz plik `.env.local` w katalogu `frontend/`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

---

## Pierwsze uruchomienie

### Opcja 1: Uruchomienie automatyczne (zalecane)

Z katalogu głównego WorkSchedule:

```powershell
.\start_production.ps1
```

To uruchomi zarówno backend, jak i frontend w osobnych oknach PowerShell.

### Opcja 2: Uruchomienie ręczne

**Backend** (terminal 1):
```powershell
cd C:\WorkSchedule\backend
.\venv\Scripts\Activate.ps1
python -m backend.app
```

**Frontend** (terminal 2):
```powershell
cd C:\WorkSchedule\frontend
npm start
```

### Dostęp do aplikacji

Po uruchomieniu aplikacja będzie dostępna pod adresami:

- **Frontend (interfejs użytkownika)**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Dokumentacja API**: http://localhost:5000/api/docs (jeśli dostępna)

---

## Konfiguracja

### Pierwsze kroki w aplikacji

1. **Konfiguracja ról i zmian**
   - Przejdź do: Ustawienia → Role i zmiany
   - Dodaj role pracowników (np. Kasjer, Magazynier)
   - Zdefiniuj zmiany robocze (np. Poranna 8:00-16:00)

2. **Dodanie pracowników**
   - Przejdź do: Pracownicy
   - Dodaj pracowników z przypisanymi rolami
   - Ustaw limity godzin pracy

3. **Konfiguracja świąt i wymagań obsadowych**
   - Przejdź do: Ustawienia → Święta
   - Dodaj święta i dni specjalne
   - Zdefiniuj wymagania obsadowe dla różnych typów dni

4. **Generowanie grafiku**
   - Przejdź do: Grafik
   - Wybierz miesiąc i parametry generatora
   - Uruchom generator (heuristic lub OR-Tools)

### Zaawansowana konfiguracja

#### Parametry generatora OR-Tools

W `backend/services/configuration.py` można dostosować:
- Wagi optymalizacji
- Limity kolejnych zmian nocnych
- Minimalne okresy odpoczynku

#### Reguły walidacji

Plik `docs/analysis/ANALIZA_KP.md` zawiera szczegółowy opis reguł Kodeksu Pracy stosowanych przez walidator.

---

## Rozwiązywanie problemów

### Problem: Backend nie uruchamia się

**Objawy**: Błąd "ModuleNotFoundError" lub "ImportError"

**Rozwiązanie**:
1. Upewnij się, że środowisko wirtualne jest aktywne
2. Zainstaluj ponownie zależności:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

### Problem: Frontend nie uruchamia się

**Objawy**: Błęd "Module not found" lub "Cannot find module"

**Rozwiązanie**:
1. Usuń katalog `node_modules` i plik `package-lock.json`
2. Zainstaluj ponownie zależności:
   ```powershell
   cd frontend
   npm install
   ```

### Problem: Błąd polityki wykonywania PowerShell

**Objawy**: "cannot be loaded because running scripts is disabled"

**Rozwiązanie**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problem: Backend i frontend nie mogą się połączyć

**Objawy**: Błędy CORS lub "Network Error" w przeglądarce

**Rozwiązanie**:
1. Sprawdź czy backend działa na porcie 5000
2. Sprawdź plik `frontend/.env.local` - upewnij się, że `NEXT_PUBLIC_API_BASE_URL` wskazuje na `http://localhost:5000`
3. Zrestartuj oba serwisy

### Problem: Brak danych w bazie

**Objawy**: Puste listy pracowników, ról, zmian

**Rozwiązanie**:
1. Zainicjalizuj bazę danych przykładowymi danymi:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   python -m backend.sample_data
   ```

### Problem: Błędy walidacji grafiku

**Objawy**: Generator tworzy grafik, ale pojawiają się błędy walidacji

**Rozwiązanie**:
1. Sprawdź wymagania obsadowe w Ustawieniach
2. Upewnij się, że są zdefiniowane wszystkie role i zmiany
3. Sprawdź czy pracownicy mają przypisane role
4. Zobacz szczegóły walidacji w panelu Dashboard lub Raporty

---

## Wsparcie techniczne

### Logi aplikacji

**Backend**:
- Logi wyświetlają się w oknie PowerShell gdzie uruchomiono backend
- Można przekierować do pliku: `python -m backend.app > backend.log 2>&1`

**Frontend**:
- Logi wyświetlają się w oknie PowerShell oraz w konsoli przeglądarki (F12)

### Kontakt

Dla wsparcia technicznego i raportowania błędów:
- Zobacz dokumentację w katalogu `docs/`
- Sprawdź plik `README.md` w katalogu głównym

---

## Aktualizacje

### Aktualizacja do nowszej wersji

1. **Backup danych**:
   ```powershell
   copy backend\work_schedule.db backend\work_schedule_backup.db
   ```

2. **Zamknij aplikację** (zamknij okna PowerShell z backendem i frontendem)

3. **Zastąp pliki aplikacji** nowszą wersją (zachowując bazę danych)

4. **Zaktualizuj zależności**:
   ```powershell
   # Backend
   cd backend
   .\venv\Scripts\Activate.ps1
   pip install --upgrade -r requirements.txt
   
   # Frontend
   cd ..\frontend
   npm install
   ```

5. **Uruchom ponownie** aplikację

---

## Bezpieczeństwo

### Zalecenia bezpieczeństwa

1. **Zmień domyślny SECRET_KEY** w pliku `backend/.env`
2. **Backup bazy danych** regularnie:
   ```powershell
   copy backend\work_schedule.db D:\Backups\work_schedule_$(Get-Date -Format "yyyyMMdd").db
   ```
3. **Nie udostępniaj** aplikacji w Internecie bez odpowiedniego zabezpieczenia (HTTPS, autentykacja)
4. **Aktualizuj** regularnie Python i Node.js do najnowszych wersji

---

## Dodatki

### Przykładowe dane testowe

Aby załadować przykładowe dane do testowania:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m backend.sample_data
```

To utworzy:
- 3 role (Kasjer, Magazynier, Menedżer)
- 5 zmian roboczych
- 10 przykładowych pracowników
- Przykładowe nieobecności
- Święta państwowe

### Eksport danych

Raporty można eksportować do formatów:
- **CSV**: Przejdź do Raporty → Eksportuj CSV
- **JSON**: Przejdź do Raporty → Eksportuj JSON

---

**Wersja dokumentu**: 2.0  
**Data aktualizacji**: 2025-11-09  
**Dla wersji aplikacji**: Plan 2 (WorkSchedule PL Expansion)
