# Solver Grafiků

Ten katalog zawiera skrypt Pythona do automatycznego generowania grafików pracowniczych przy użyciu Google OR-Tools.

## Instalacja

Zainstaluj zależności Pythona:

```bash
pip install -r requirements.txt
```

## Użycie

Skrypt `solve_schedule.py` przyjmuje dane wejściowe w formacie JSON przez stdin i zwraca rozwiązanie przez stdout.

### Format danych wejściowych

```json
{
  "employees": [
    {
      "id": 1,
      "first_name": "Jan",
      "last_name": "Kowalski",
      "employment_type": "Pełny etat"
    }
  ],
  "shifts": [
    {
      "id": 1,
      "day_of_week": 1,
      "start_time": "08:00",
      "end_time": "16:00",
      "required_staff": 2
    }
  ],
  "absences": [
    {
      "employee_id": 1,
      "start_date": "2025-11-10",
      "end_date": "2025-11-15",
      "type": "urlop"
    }
  ],
  "date_range": {
    "start_date": "2025-11-01",
    "end_date": "2025-11-30"
  }
}
```

### Format danych wyjściowych

```json
{
  "status": "OPTIMAL",
  "assignments": [
    {
      "employee_id": 1,
      "date": "2025-11-01",
      "shift_id": 1
    }
  ],
  "warnings": [],
  "errors": []
}
```

### Przykład użycia z wiersza poleceń

```bash
echo '{"employees": [...], "shifts": [...]}' | python solve_schedule.py
```

## Integracja z Tauri

Skrypt jest wywoływany z backendu Rust przez Tauri command `run_local_solver`, który:
1. Serializuje dane z bazy SQLite do JSON
2. Uruchamia proces Pythona
3. Przekazuje JSON przez stdin
4. Odbiera wynik przez stdout
5. Deserializuje i zwraca wynik do frontendu
