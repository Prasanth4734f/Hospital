import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.audit_log import AuditLog

def create_notification(
    db: Session,
    user_id: uuid.UUID,
    title: str,
    message: str,
    category: str = "SYSTEM",
    reference_id: uuid.UUID | None = None
) -> Notification:
    notif = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
        title=title,
        message=message,
        category=category,
        reference_id=reference_id,
        is_read=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(notif)
    db.flush()
    return notif

def create_audit_log(
    db: Session,
    user_id: uuid.UUID | None,
    action: str,
    entity_type: str,
    entity_id: uuid.UUID | None = None,
    details: dict | None = None,
    ip_address: str | None = None
) -> AuditLog:
    # Sanitize details to never include password or sensitive keys
    safe_details = None
    if details:
        safe_details = {k: v for k, v in details.items() if "password" not in k.lower() and "token" not in k.lower()}
    log = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=safe_details,
        ip_address=ip_address,
        created_at=datetime.now(timezone.utc)
    )
    db.add(log)
    db.flush()
    return log
