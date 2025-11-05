# ✅ Rust został zainstalowany!

## Status instalacji

Rust i Cargo zostały pomyślnie zainstalowane przez winget.

## ⚠️ Wymagane: Restart terminala

Aby użyć Rust, **musisz zrestartować terminal PowerShell**.

Rust został dodany do zmiennej PATH, ale zmiany będą widoczne dopiero po:
1. Zamknięciu bieżącego terminala PowerShell
2. Otwarciu nowego terminala PowerShell

## Weryfikacja instalacji (po restarcie terminala)

Otwórz **nowy** terminal PowerShell i wykonaj:

```powershell
rustc --version
cargo --version
```

Powinieneś zobaczyć coś podobnego do:
```
rustc 1.83.0 (90b35a623 2024-11-26)
cargo 1.83.0 (5ffbef321 2024-10-29)
```

## Następne kroki

### 1. Zainstaluj Microsoft C++ Build Tools (wymagane!)

Tauri wymaga kompilatora C++ od Microsoft:

1. Pobierz **Build Tools for Visual Studio 2022**:
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

2. Podczas instalacji zaznacz:
   - ✅ **Desktop development with C++**
   - ✅ **Windows 10/11 SDK**

3. Instalacja zajmie ~5-10 GB miejsca

**WAŻNE**: Bez tego kroku kompilacja Tauri będzie kończyła się błędem "link.exe not found"

### 2. Skonfiguruj Gemini API (opcjonalnie)

Jeśli chcesz używać funkcji AI do generowania grafików:

```powershell
# Skopiuj plik przykładowy
copy .env.example .env

# Edytuj .env i dodaj swój klucz API z https://makersuite.google.com/app/apikey
# GEMINI_API_KEY=your-api-key-here
```

Szczegóły: `docs/GEMINI_API_SETUP.md`

### 3. Uruchom aplikację Tauri

Po restarcie terminala i zainstalowaniu C++ Build Tools:

```powershell
# W nowym terminalu PowerShell
cd D:\graf\Grafikv2
npm run tauri dev
```

**Pierwsza kompilacja zajmie 5-15 minut** - to normalne!
Rust kompiluje wszystkie zależności od zera.

Kolejne uruchomienia będą trwały 10-30 sekund.

### 4. Zbuduj standalone EXE (opcjonalnie)

Gdy chcesz stworzyć wykonywalny plik .exe:

```powershell
npm run tauri build
```

Plik .exe znajdziesz w:
`src-tauri\target\release\bundle\nsis\`

## Rozwiązywanie problemów

### Błąd: "cargo: command not found" (po restarcie terminala)
1. Sprawdź, czy naprawdę otworzyłeś **nowy** terminal
2. Sprawdź PATH:
   ```powershell
   $env:Path -split ';' | Select-String cargo
   ```
3. Ręcznie dodaj do PATH (jeśli brakuje):
   ```powershell
   $env:Path += ";$env:USERPROFILE\.cargo\bin"
   ```

### Błąd: "link.exe not found"
- Zainstaluj Microsoft C++ Build Tools (patrz krok 1)

### Kompilacja trwa bardzo długo
- Pierwsza kompilacja: **5-15 minut** (normalne!)
- Kolejne: 10-30 sekund

### Błąd podczas kompilacji Tauri
1. Upewnij się, że zainstalowałeś C++ Build Tools
2. Zrestartuj terminal po instalacji
3. Spróbuj wyczyścić cache:
   ```powershell
   cd src-tauri
   cargo clean
   cd ..
   npm run tauri dev
   ```

## Co dalej?

### Tryb deweloperski (z hot-reload):
```powershell
npm run tauri dev
```

### Build produkcyjny:
```powershell
npm run tauri build
```

### Tylko frontend (bez backendu):
```powershell
npm run dev
```

## Dokumentacja

- 📖 [Konfiguracja Gemini API](docs/GEMINI_API_SETUP.md)
- 📖 [Instalacja Rust](docs/RUST_INSTALLATION.md)
- 📖 [Architektura projektu](CLAUDE.md)
- 📖 [Specyfikacja funkcji](specs/001-core-application-mvp/spec.md)

---

**Status**: ✅ Rust zainstalowany | ⏳ Wymagany restart terminala | ⏳ Wymagane C++ Build Tools
