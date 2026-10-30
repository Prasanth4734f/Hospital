from typing import Any, Optional, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[T] = None

class PaginatedData(BaseModel, Generic[T]):
    items: list[T]
    page: int
    limit: int
    total: int
    total_pages: int

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Items retrieved successfully"
    data: PaginatedData[T]

def api_success(message: str = "Operation successful", data: Any = None) -> dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data
    }

def api_error(message: str = "An error occurred", data: Any = None) -> dict[str, Any]:
    return {
        "success": False,
        "message": message,
        "data": data
    }

def api_paginated(items: list[Any], total: int, page: int, limit: int, message: str = "Items retrieved successfully") -> dict[str, Any]:
    total_pages = (total + limit - 1) // limit if limit > 0 else 0
    return {
        "success": True,
        "message": message,
        "data": {
            "items": items,
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages
        }
    }
