from typing import Any, Optional
from fastapi import HTTPException, status

class MediCoreException(HTTPException):
    def __init__(self, status_code: int, message: str, data: Optional[Any] = None):
        super().__init__(status_code=status_code, detail=message)
        self.message = message
        self.data = data

class NotFoundException(MediCoreException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, message=message)

class BadRequestException(MediCoreException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, message=message)

class UnauthorizedException(MediCoreException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, message=message)

class ForbiddenException(MediCoreException):
    def __init__(self, message: str = "Access forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, message=message)

class ConflictException(MediCoreException):
    def __init__(self, message: str = "Conflict occurred"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, message=message)
