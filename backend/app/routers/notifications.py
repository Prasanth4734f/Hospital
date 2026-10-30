import uuid
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.utils.responses import api_success, api_paginated
from app.utils.pagination import get_pagination_params, PaginationParams

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def list_my_notifications(
    pagination: PaginationParams = Depends(get_pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    total = query.count()
    items = query.order_by(Notification.created_at.desc()).offset(pagination.offset).limit(pagination.limit).all()

    data = [
        {
            "id": str(n.id),
            "title": n.title,
            "message": n.message,
            "category": n.category,
            "reference_id": str(n.reference_id) if n.reference_id else None,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        } for n in items
    ]
    return api_paginated(data, total, pagination.page, pagination.limit, "Notifications retrieved successfully")

@router.patch("/{id}/read")
def mark_as_read(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    n = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    n.is_read = True
    db.commit()
    return api_success("Notification marked as read", {"id": str(n.id), "is_read": True})

@router.patch("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return api_success(f"{count} notifications marked as read", {"count": count})

@router.delete("/{id}")
def delete_notification(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    n = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    db.delete(n)
    db.commit()
    return api_success("Notification deleted successfully", None)
