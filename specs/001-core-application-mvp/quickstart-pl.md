# Przewodnik Szybkiego Startu

Ten przewodnik zawiera podstawowe kroki do skonfigurowania środowiska deweloperskiego dla tego projektu.

### Wymagania Wstępne

1.  **Node.js**: Upewnij się, że masz zainstalowany Node.js (wersja 18 lub nowsza).
2.  **Rust**: Zainstaluj zestaw narzędzi Rust za pomocą [rustup](https://rustup.rs/).
3.  **Python**: Upewnij się, że masz zainstalowany Python (wersja 3.9 lub nowsza). Jest to wymagane dla skryptu solwera OR-Tools.
4.  **Wymagania Wstępne Tauri**: Postępuj zgodnie z [przewodnikiem wymagań wstępnych](https://tauri.app/v1/guides/getting-started/prerequisites) Tauri dla Twojego systemu operacyjnego (Windows), co obejmuje instalację Microsoft C++ Build Tools.

### Kroki Konfiguracji

1.  **Sklonuj repozytorium**
    ```bash
    git clone [adres-repozytorium]
    cd [folder-repozytorium]
    ```

2.  **Zainstaluj zależności Node.js**
    ```bash
    npm install
    ```

3.  **Zainstaluj zależności Pythona**
    ```bash
    pip install ortools
    ```

4.  **Uruchom aplikację w trybie deweloperskim**
    ```bash
    npm run tauri dev
    ```

### Budowanie Aplikacji

Aby zbudować ostateczny samodzielny plik wykonywalny dla systemu Windows:

```bash
npm run tauri build
```

Wynik będzie zlokalizowany w `src-tauri/target/release/bundle/`.
