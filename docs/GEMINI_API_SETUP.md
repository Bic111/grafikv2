# Konfiguracja Gemini API

Ten dokument opisuje, jak skonfigurować klucz API Gemini dla funkcji automatycznego generowania grafików w chmurze.

## Krok 1: Uzyskanie klucza API

1. Przejdź do [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Zaloguj się kontem Google
3. Kliknij "Get API Key" lub "Create API Key"
4. Skopiuj wygenerowany klucz (zaczyna się od `AIza...`)

## Krok 2: Konfiguracja w aplikacji

### Opcja A: Plik .env (Zalecane dla rozwoju)

1. Skopiuj plik `.env.example` do `.env`:
   ```bash
   copy .env.example .env
   ```

2. Otwórz plik `.env` w edytorze tekstu

3. Zastąp `your-api-key-here` swoim kluczem API:
   ```
   GEMINI_API_KEY=AIzaSyAbc123YourActualKeyHere
   ```

4. Zapisz plik

5. Uruchom ponownie aplikację:
   ```bash
   npm run tauri dev
   ```

### Opcja B: Zmienna środowiskowa systemu (Zalecane dla produkcji)

#### Windows (PowerShell):
```powershell
# Tymczasowo (ważne tylko dla bieżącej sesji)
$env:GEMINI_API_KEY="AIzaSyAbc123YourActualKeyHere"

# Permanentnie (dla użytkownika)
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIzaSyAbc123YourActualKeyHere', 'User')
```

#### Windows (CMD):
```cmd
# Tymczasowo
set GEMINI_API_KEY=AIzaSyAbc123YourActualKeyHere

# Permanentnie (wymaga GUI)
# Panel Sterowania > System > Zaawansowane ustawienia systemu > Zmienne środowiskowe
```

## Krok 3: Weryfikacja konfiguracji

1. Uruchom aplikację
2. Przejdź do strony "Grafik"
3. Kliknij przycisk "✨ Generuj (Gemini AI)"
4. Jeśli konfiguracja jest poprawna, zobaczysz komunikat o przetwarzaniu
5. Jeśli brakuje klucza, zobaczysz błąd z instrukcjami

## Bezpieczeństwo

⚠️ **WAŻNE - Zasady bezpieczeństwa:**

1. **Nigdy nie commituj pliku `.env`** do repozytorium Git (jest w `.gitignore`)
2. **Nie udostępniaj klucza API** innym osobom
3. **Nie wklejaj klucza** w kodzie źródłowym JavaScript/TypeScript
4. **Jeśli klucz wycieknie**, natychmiast:
   - Przejdź do Google AI Studio
   - Usuń skompromitowany klucz
   - Wygeneruj nowy klucz

## Limity i koszty

- Gemini API ma **bezpłatny tier** z limitami requestów
- Sprawdź aktualne limity na: https://ai.google.dev/pricing
- Monitoruj zużycie w Google Cloud Console

## Rozwiązywanie problemów

### Błąd: "Brak klucza API Gemini"
- Sprawdź, czy plik `.env` istnieje
- Sprawdź, czy zmienna `GEMINI_API_KEY` jest ustawiona
- Uruchom ponownie aplikację po dodaniu klucza

### Błąd: "Błąd API Gemini (kod: 400)"
- Klucz API jest nieprawidłowy
- Wygeneruj nowy klucz w Google AI Studio

### Błąd: "Błąd API Gemini (kod: 429)"
- Przekroczono limit requestów
- Poczekaj kilka minut lub sprawdź limity konta

### Błąd: "Błąd połączenia z Gemini API"
- Sprawdź połączenie internetowe
- Sprawdź firewall/proxy

## Alternatywa: Solver lokalny

Jeśli nie chcesz używać Gemini API, możesz korzystać z **solvera lokalnego** (Python + OR-Tools):

1. Zainstaluj Python 3.8+
2. Zainstaluj zależności:
   ```bash
   pip install google-ortools
   ```
3. Użyj przycisku "🔧 Generuj (Lokalnie)" zamiast "✨ Generuj (Gemini AI)"

## Wsparcie

W razie problemów:
- Sprawdź logi aplikacji (Developer Tools w Tauri)
- Otwórz issue w repozytorium projektu
- Sprawdź dokumentację Gemini API: https://ai.google.dev/docs
