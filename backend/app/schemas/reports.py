from typing import Any
from pydantic import BaseModel

class ReportResponse(BaseModel):
    title: str
    filters_applied: dict[str, Any]
    total_records: int
    data: list[dict[str, Any]]
