# Grafikv2

System do zarządzania grafikami pracowniczymi z automatycznym generowaniem harmonogramów przy użyciu AI i solverów optymalizacyjnych.

## 🚀 Szybki start

### Wymagania wstępne

1. **Node.js** 18+ (sprawdź: `node --version`)
2. **Rust** (zainstalowany przez winget) - **✅ ZAINSTALOWANE!**
3. **Python** 3.9+ (dla OR-Tools solver) - (sprawdź: `python --version`)
4. **Microsoft C++ Build Tools** - ⚠️ **WYMAGANE DO KOMPILACJI TAURI**

📖 **Szczegóły instalacji**: [RUST_INSTALLED.md](RUST_INSTALLED.md)

**Instalacja C++ Build Tools:**
- Pobierz: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
- Podczas instalacji wybierz: **"Desktop development with C++"**
- Po instalacji zrestartuj terminal

### Instalacja zależności

```bash
npm install
```

### Uruchomienie aplikacji

#### Pełna aplikacja (Tauri + frontend):
```bash
npm run tauri dev
```
**⚠️ Wymaga**: Restart terminala po instalacji Rust + zainstalowane C++ Build Tools

**Pierwsza kompilacja**: 5-15 minut (normalne!)

#### Tylko frontend (bez backendu):
```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

### Build produkcyjny

#### Build Next.js (web):
```bash
npm run build
npm start
```

#### Build standalone Windows executable:
```bash
npm run tauri build
```

**Uwaga**: Pierwsza kompilacja Rust może zająć 5-15 minut.

Wynikowy plik `.exe` znajdziesz w: `src-tauri/target/release/bundle/msi/` lub `src-tauri/target/release/`

### Linting

```bash
npm run lint
```

## 🛠️ Stack technologiczny

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Język:** [TypeScript](https://www.typescriptlang.org)
- **Style:** [Tailwind CSS 4](https://tailwindcss.com)
- **UI Library:** [React 19](https://react.dev)
- **Linting:** ESLint

### Backend
- **Desktop Framework:** [Tauri 2](https://tauri.app) (Rust)
- **Baza danych:** SQLite
- **Solver:** Google OR-Tools (Python)
- **AI:** Gemini API (opcjonalnie)

## 📁 Struktura projektu

```
Grafikv2/
├── src/
│   └── app/          # App Router pages
├── public/           # Statyczne zasoby
├── next.config.ts    # Konfiguracja Next.js
├── tsconfig.json     # Konfiguracja TypeScript
└── tailwind.config.ts # Konfiguracja Tailwind
```

## ⚙️ Konfiguracja

### Konfiguracja Gemini API (opcjonalna)

Aby korzystać z funkcji automatycznego generowania grafików przez AI:

1. Skopiuj plik `.env.example` do `.env`
2. Wygeneruj klucz API na [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Dodaj klucz do pliku `.env`:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```

**📖 Szczegółowe instrukcje:** [docs/GEMINI_API_SETUP.md](docs/GEMINI_API_SETUP.md)

### Solver lokalny (alternatywa dla Gemini)

Jeśli nie chcesz używać Gemini API, możesz korzystać z lokalnego solvera:

1. Zainstaluj Python 3.8+
2. Zainstaluj zależności:
   ```bash
   pip install google-ortools
   ```

## 🎯 Funkcje

- ✅ Zarządzanie pracownikami (dodawanie, edycja, role)
- ✅ Konfiguracja zmian (godziny, wymagana obsada)
- ✅ Zarządzanie nieobecnościami (urlopy, L4)
- ✅ Ręczne tworzenie grafików
- ✅ Walidacja grafików (11h odpoczynek, limity godzin)
- ✅ Automatyczne generowanie grafików (OR-Tools)
- ✅ Generowanie grafików przez AI (Gemini)
- ✅ Eksport do PDF/CSV

## 📝 Informacje o rozwoju

Projekt wykorzystuje najnowsze wersje Next.js z App Routerem oraz React 19 z Server Components.

Strony znajdują się w katalogu `src/app/` i automatycznie aktualizują się podczas edycji.

Więcej informacji o architekturze i konwencjach: **[CLAUDE.md](CLAUDE.md)**

## 📚 Dokumentacja

- [Konfiguracja Gemini API](docs/GEMINI_API_SETUP.md)
- [Specyfikacja projektu](specs/001-core-application-mvp/spec.md)
- [Model danych](specs/001-core-application-mvp/data-model.md)
- [Konstytucja projektu](.specify/memory/constitution.md)

