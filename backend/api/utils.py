from __future__ import annotations

from datetime import date, time
from typing import Any, Dict, Optional


def parse_date(value: Optional[str]) -> Optional[date]:
    if value in (None, ""):
        return None
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value))


def parse_time(value: Optional[str]) -> Optional[time]:
    if value in (None, ""):
        return None
    if isinstance(value, time):
        return value
    return time.fromisoformat(str(value))


def response_message(message: str, **extra: Any) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"message": message}
    payload.update(extra)
    return payload
