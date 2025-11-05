# Faza 0: Badania i Decyzje

Ten dokument podsumowuje decyzje techniczne podjęte w celu rozwiązania punktów "WYMAGA WYJAŚNIENIA" zidentyfikowanych w planie implementacji.

---

### 1. Technologia Pakowania Aplikacji Desktopowej

- **Decyzja**: **Tauri**
- **Uzasadnienie**: Dla aplikacji desktopowej dla jednego użytkownika, korzyści Tauri w tworzeniu lekkich, bezpiecznych i wydajnych plików wykonywalnych są najważniejsze. Produkuje znacznie mniejsze pakiety aplikacji (~5-10 MB) w porównaniu do Electrona (~100+ MB), wykorzystując natywny webview systemu operacyjnego (WebView2 w systemie Windows). Prowadzi to do niższego zużycia pamięci i szybszego czasu uruchamiania. Architektura zorientowana na bezpieczeństwo, z Rustem na backendzie, jest znaczącą zaletą przy budowie solidnej aplikacji.
- **Rozważane Alternatywy**:
  - **Electron**: Odrzucony z powodu dużego rozmiaru pakietu i wysokiego zużycia zasobów, które są przesadą dla skali tego projektu. Chociaż oferuje pełny dostęp do Node.js, wymagana logika backendu nie jest na tyle skomplikowana, aby uzasadnić ten narzut.

---

### 2. Mechanizm Przechowywania Lokalnego

- **Decyzja**: **SQLite**
- **Uzasadnienie**: Model danych aplikacji (Pracownicy, Zmiany, Nieobecności) jest z natury relacyjny. SQLite dostarcza solidny, oparty na plikach i w pełni funkcjonalny silnik bazy danych SQL, który zapewnia integralność danych (zgodność z ACID) i pozwala na złożone zapytania. Jest to bardziej skalowalne i architektonicznie solidne rozwiązanie niż ręczne zarządzanie relacjami w plikach JSON. Początkowa złożoność konfiguracji (komunikacja IPC między backendem Rust a webview) jest wartą zachodu inwestycją w długoterminową niezawodność danych.
- **Rozważane Alternatywy**:
  - **JSON oparty na plikach**: Odrzucony, ponieważ nie nadaje się do danych relacyjnych. Wymagałoby to ładowania całych plików do pamięci w celu wykonania prostych zapytań i utrudniłoby zarządzanie spójnością i integralnością danych, zwłaszcza w miarę rozwoju funkcji.

---

### 3. Framework Testowy

- **Decyzja**: **Vitest**
- **Uzasadnienie**: Jako nowoczesny framework testowy zbudowany na Vite, Vitest oferuje wyższą wydajność i lepsze doświadczenie deweloperskie dla projektu Next.js/React w porównaniu do Jest. Jego niemal natychmiastowa informacja zwrotna w trybie watch, prostsza konfiguracja oraz natywne wsparcie dla modułów ES i TypeScript idealnie pasują do nowoczesnego stosu technologicznego tego projektu. Jego API kompatybilne z Jest ułatwia adopcję.
- **Rozważane Alternatywy**:
  - **Jest**: Odrzucony z powodu niższej wydajności i bardziej złożonej konfiguracji w kontekście nowoczesnego projektu opartego na ESM.

---

### 4. Strategia Integracji Google OR-Tools

- **Decyzja**: **Wykonanie za pomocą skryptu Pythona wywoływanego z backendu Tauri.**
- **Uzasadnienie**: Google OR-Tools nie ma oficjalnych powiązań (bindings) dla JavaScript. Najbardziej elastycznym i powszechnym sposobem użycia go w środowisku innym niż Python/Java/C++ jest wywołanie dedykowanego skryptu Pythona. W naszej architekturze Tauri, backend Rust będzie odpowiedzialny za uruchomienie procesu potomnego Pythona (`python solve_schedule.py`), przekazanie danych problemu przez `stdin` i odebranie rozwiązania przez `stdout`. Izoluje to logikę solwera i pozwala na użycie oficjalnej, dobrze udokumentowanej biblioteki Pythona dla OR-Tools.
- **Rozważane Alternatywy**:
  - **Powiązania Node.js**: Nieoficjalne i rzadziej utrzymywane. Użycie oficjalnej biblioteki Pythona jest bardziej niezawodne.

---

### 5. Strategia Integracji API Gemini

- **Decyzja**: **Proxy przez dedykowane polecenie w backendzie Tauri (Rust).**
- **Uzasadnienie**: Klucz API Gemini musi pozostać bezpieczny i nigdy nie być eksponowany na frontendzie. Frontend Next.js będzie wysyłał żądanie do niestandardowego polecenia Tauri (np. `invoke('gemini_solve', { ... })`). Backend Rust odbierze to żądanie, dołączy tajny klucz API (przechowywany bezpiecznie po stronie serwera) i wykona właściwe wywołanie do API Gemini za pomocą SDK `@google/generative-ai` lub bezpośredniego klienta HTTP. Jest to zgodne z najlepszą praktyką używania backendu jako bezpiecznego proxy.
- **Rozważane Alternatywy**:
  - **Trasy API Next.js**: W standardowej aplikacji internetowej byłoby to rozwiązanie. Jednak w aplikacji Tauri z backendem Rust, centralizacja całej logiki backendu (w tym proxy API) w Rust jest czystszą architekturą. Unika się uruchamiania osobnego procesu serwera Node.js tylko dla tras API.
