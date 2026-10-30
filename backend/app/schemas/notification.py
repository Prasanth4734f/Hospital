import uuid
from datetime import datetime
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    message: str
    category: str
    reference_id: uuid.UUID | None = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
