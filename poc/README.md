# Proof of Concept (PoC) - Silnik Generatora Grafików

Ten katalog zawiera minimalną, działającą implementację silnika do generowania grafików przy użyciu Google OR-Tools.

## Cel

Celem tego PoC jest weryfikacja kluczowych założeń technicznych:
1.  Poprawność modelowania problemu planowania grafików.
2.  Zdolność do zaimplementowania krytycznych ograniczeń z Kodeksu Pracy, w szczególności **11-godzinnego odpoczynku dobowego**.
3.  Wydajność solwera dla małego zestawu danych.

## Wymagania

- Python 3.10+
- pip (manager pakietów Pythona)

## Instalacja

1.  Utwórz i aktywuj wirtualne środowisko:
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

2.  Zainstaluj wymaganą bibliotekę:
    ```bash
    pip install ortools
    ```

## Uruchomienie

Aby uruchomić skrypt i wygenerować przykładowy 7-dniowy grafik, wykonaj polecenie:

```bash
python poc_generator.py
```

## Opis Działania

Skrypt `poc_generator.py`:
1.  Wczytuje dane o pracownikach i zmianach z katalogu `data/`.
2.  Tworzy model optymalizacyjny na okres 7 dni.
3.  Definiuje zmienne decyzyjne (czy pracownik `p` w dniu `d` ma zmianę `z`).
4.  Dodaje kluczowe ograniczenia (constraints):
    - Każdy pracownik ma dokładnie jedną zmianę (lub wolne) dziennie.
    - Każda zmiana (oprócz "Wolne") ma minimalną obsadę (w PoC ustawioną na 1).
    - **Gwarantowany jest 11-godzinny odpoczynek dobowy między zmianami.**
5.  Uruchamia solver CP-SAT w poszukiwaniu poprawnego rozwiązania.
6.  Drukuje w konsoli znaleziony grafik lub informację o braku rozwiązania.
