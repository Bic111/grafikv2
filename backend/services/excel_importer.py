from __future__ import annotations

from pathlib import Path
from typing import IO, Iterable, List

import pandas as pd

from ..database import session_scope
from ..models import GrafikEntry, GrafikMiesieczny, Pracownik, Zmiana


class ImportError(Exception):
    pass


REQUIRED_COLUMNS = {"data", "zmiana", "pracownik"}


def _load_dataframe(source: IO[bytes]) -> pd.DataFrame:
    try:
        df = pd.read_excel(source)
    except Exception as exc:  # pragma: no cover - pandas internal errors vary
        raise ImportError("Nie udało się odczytać pliku Excel") from exc

    lower_columns = {str(col).lower() for col in df.columns}
    missing = REQUIRED_COLUMNS - lower_columns
    if missing:
        raise ImportError(f"Brak wymaganych kolumn: {', '.join(missing)}")
    return df


def _normalise_dataframe(df: pd.DataFrame) -> Iterable[dict]:
    df = df.rename(columns=lambda col: str(col).lower())
    for _, row in df.iterrows():
        yield {
            "date": pd.to_datetime(row["data"]).date(),
            "shift_name": str(row["zmiana"]).strip(),
            "employee": str(row["pracownik"]).strip(),
        }


def import_schedule(month: str, file_stream: IO[bytes]):
    df = _load_dataframe(file_stream)
    entries = list(_normalise_dataframe(df))
    if not entries:
        raise ImportError("Plik nie zawiera danych do zaimportowania")

    with session_scope() as session:
        schedule = (
            session.query(GrafikMiesieczny)
            .filter(GrafikMiesieczny.miesiac_rok == month)
            .one_or_none()
        )
        if schedule is None:
            schedule = GrafikMiesieczny(miesiac_rok=month, status="roboczy")
            session.add(schedule)
            session.flush()
        else:
            session.query(GrafikEntry).filter(
                GrafikEntry.grafik_miesieczny_id == schedule.id
            ).delete()

        employees = {
            f"{emp.imie} {emp.nazwisko}".strip(): emp
            for emp in session.query(Pracownik).all()
        }
        shifts = {shift.nazwa_zmiany: shift for shift in session.query(Zmiana).all()}

        created: List[GrafikEntry] = []
        for entry in entries:
            employee = employees.get(entry["employee"])
            if not employee:
                raise ImportError(f"Nieznany pracownik: {entry['employee']}")
            shift = shifts.get(entry["shift_name"])
            if not shift:
                raise ImportError(f"Nieznana zmiana: {entry['shift_name']}")

            grafik_entry = GrafikEntry(
                grafik_miesieczny_id=schedule.id,
                pracownik_id=employee.id,
                zmiana_id=shift.id,
                data=entry["date"],
            )
            session.add(grafik_entry)
            created.append(grafik_entry)

        return schedule, created
