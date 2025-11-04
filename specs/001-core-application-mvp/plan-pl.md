# Plan Implementacji: [FUNKCJA]

**Gałąź**: `[###-nazwa-funkcji]` | **Data**: [DATA] | **Specyfikacja**: [link]
**Wejście**: Specyfikacja funkcji z `/specs/[###-nazwa-funkcji]/spec.md`

**Uwaga**: Ten szablon jest wypełniany przez polecenie `/speckit.plan`. Zobacz `.specify/templates/commands/plan.md` dla przepływu wykonania.

## Podsumowanie

[Wyciąg ze specyfikacji funkcji: główne wymaganie + podejście techniczne z badania]

## Kontekst Techniczny

<!--
  WYMAGANE DZIAŁANIE: Zastąp zawartość tej sekcji szczegółami technicznymi
  dla projektu. Struktura tutaj jest przedstawiona jako doradcza, aby prowadzić
  proces iteracji.
-->

**Język/Wersja**: [np. Python 3.11, Swift 5.9, Rust 1.75 lub WYMAGA WYJAŚNIENIA]  
**Główne Zależności**: [np. FastAPI, UIKit, LLVM lub WYMAGA WYJAŚNIENIA]  
**Przechowywanie**: [jeśli dotyczy, np. PostgreSQL, CoreData, pliki lub N/A]  
**Testowanie**: [np. pytest, XCTest, cargo test lub WYMAGA WYJAŚNIENIA]  
**Platforma Docelowa**: [np. serwer Linux, iOS 15+, WASM lub WYMAGA WYJAŚNIENIA]
**Typ Projektu**: [pojedynczy/web/mobilny - określa strukturę źródłową]  
**Cele Wydajnościowe**: [specyficzne dla domeny, np. 1000 req/s, 10k linii/s, 60 fps lub WYMAGA WYJAŚNIENIA]  
**Ograniczenia**: [specyficzne dla domeny, np. <200ms p95, <100MB pamięci, zdolny do pracy offline lub WYMAGA WYJAŚNIENIA]  
**Skala/Zakres**: [specyficzne dla domeny, np. 10k użytkowników, 1M LOC, 50 ekranów lub WYMAGA WYJAŚNIENIA]

## Sprawdzenie Konstytucji

*BRAMKA: Musi przejść przed badaniem Fazy 0. Sprawdź ponownie po projekcie Fazy 1.*

[Bramki określone na podstawie pliku konstytucji]

## Struktura Projektu

### Dokumentacja (ta funkcja)

```text
specs/[###-funkcja]/
├── plan.md              # Ten plik (wynik polecenia /speckit.plan)
├── research.md          # Wynik Fazy 0 (polecenie /speckit.plan)
├── data-model.md        # Wynik Fazy 1 (polecenie /speckit.plan)
├── quickstart.md        # Wynik Fazy 1 (polecenie /speckit.plan)
├── contracts/           # Wynik Fazy 1 (polecenie /speckit.plan)
└── tasks.md             # Wynik Fazy 2 (polecenie /speckit.tasks - NIE tworzone przez /speckit.plan)
```

### Kod Źródłowy (główny katalog repozytorium)
<!--
  WYMAGANE DZIAŁANIE: Zastąp poniższe drzewo zastępcze konkretnym układem
  dla tej funkcji. Usuń nieużywane opcje i rozwiń wybraną strukturę o
  rzeczywiste ścieżki (np. apps/admin, packages/something). Dostarczony plan musi
  nie zawierać etykiet Opcji.
-->

```text
# [USUŃ, JEŚLI NIEUŻYWANE] Opcja 1: Pojedynczy projekt (DOMYŚLNY)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [USUŃ, JEŚLI NIEUŻYWANE] Opcja 2: Aplikacja internetowa (gdy wykryto "frontend" + "backend")
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [USUŃ, JEŚLI NIEUŻYWANE] Opcja 3: Mobilna + API (gdy wykryto "iOS/Android")
api/
└── [tak samo jak backend powyżej]

ios/ lub android/
└── [struktura specyficzna dla platformy: moduły funkcji, przepływy UI, testy platformowe]
```

**Decyzja o Strukturze**: [Udokumentuj wybraną strukturę i odwołaj się do rzeczywistych
katalogów przechwyconych powyżej]

## Śledzenie Złożoności

> **Wypełnij TYLKO, jeśli Sprawdzenie Konstytucji ma naruszenia, które muszą być uzasadnione**

| Naruszenie | Dlaczego Potrzebne | Prostsza Alternatywa Odrzucona Ponieważ |
|-----------|------------|-------------------------------------|
| [np. 4. projekt] | [bieżąca potrzeba] | [dlaczego 3 projekty niewystarczające] |
| [np. wzorzec Repozytorium] | [konkretny problem] | [dlaczego bezpośredni dostęp do DB niewystarczający] |
