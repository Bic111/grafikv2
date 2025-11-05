# Instalacja Rust dla Tauri

## Wymagania

Aby uruchomić aplikację Grafikv2 z backendem Tauri, musisz zainstalować Rust.

## Krok 1: Instalacja Rust

### Windows

1. Pobierz instalator Rust z oficjalnej strony:
   **https://rustup.rs/**

2. Uruchom pobrany plik `rustup-init.exe`

3. Postępuj zgodnie z instrukcjami instalatora (domyślne opcje są OK)

4. Po zakończeniu instalacji, **zamknij i otwórz ponownie terminal** (PowerShell/CMD)

5. Sprawdź instalację:
   ```powershell
   rustc --version
   cargo --version
   ```

## Krok 2: Dodatkowe narzędzia dla Windows

Tauri wymaga **Microsoft C++ Build Tools**:

1. Pobierz **Build Tools for Visual Studio 2022**:
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

2. Podczas instalacji zaznacz:
   - ✅ **Desktop development with C++**
   - ✅ **Windows 10/11 SDK**

3. Instalacja zajmie ~5-10 GB miejsca

## Krok 3: Instalacja WebView2 (jeśli jeszcze nie zainstalowany)

WebView2 jest zazwyczaj preinstalowany na Windows 11 i nowszych wersjach Windows 10.

Jeśli brakuje, pobierz z:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Krok 4: Weryfikacja

Sprawdź, czy wszystko działa:

```powershell
cd D:\graf\Grafikv2
npm run tauri dev
```

Pierwsza kompilacja zajmie 5-15 minut (Tauri musi skompilować wszystkie zależności Rust).

## Alternatywa: Tryb tylko-frontend

Jeśli nie chcesz instalować Rust, możesz uruchomić aplikację tylko w trybie frontend:

```bash
npm run dev
```

**Uwaga:** W tym trybie:
- ✅ Interfejs użytkownika działa
- ❌ Baza danych SQLite nie działa (brak backendu)
- ❌ Solvery nie działają (wymagają backendu Rust)
- ❌ Nie można zbudować standalone EXE

## Rozwiązywanie problemów

### Błąd: "cargo: command not found"
- Uruchom ponownie terminal po instalacji Rust
- Sprawdź PATH: `echo $env:PATH` (PowerShell) lub `echo %PATH%` (CMD)
- Dodaj ręcznie: `C:\Users\YourUsername\.cargo\bin`

### Błąd: "link.exe not found"
- Zainstaluj Microsoft C++ Build Tools (Krok 2)

### Błąd podczas pierwszej kompilacji
- To normalne - pierwsza kompilacja trwa długo
- Upewnij się, że masz minimum 2 GB wolnego miejsca

### Długi czas kompilacji
- Pierwsza kompilacja: 5-15 minut (normalnie)
- Kolejne kompilacje: 10-30 sekund (tylko zmienione pliki)

## Przydatne komendy

```bash
# Sprawdź wersję Rust
rustc --version

# Aktualizuj Rust
rustup update

# Wyczyść cache kompilacji (jeśli problemy)
cd src-tauri
cargo clean

# Zbuduj release (standalone EXE)
npm run tauri build
```

## Wsparcie

- Oficjalna dokumentacja Tauri: https://tauri.app/v2/guides/prerequisites
- Rust installation: https://rustup.rs/
- W razie problemów: otwórz issue w repozytorium
