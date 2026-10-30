from datetime import datetime, timezone, date, time
from typing import Optional

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def format_date(d: Optional[date]) -> Optional[str]:
    return d.isoformat() if d else None

def format_time(t: Optional[time]) -> Optional[str]:
    return t.strftime("%H:%M:%S") if t else None
