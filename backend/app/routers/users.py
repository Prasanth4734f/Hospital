import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import UserRole, ADMIN_ROLES
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserStatusUpdate, UserResponse
from app.utils.responses import api_success, api_paginated
from app.utils.pagination import get_pagination_params, PaginationParams

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("")
def list_users(
    role: UserRole | None = None,
    is_active: bool | None = None,
    pagination: PaginationParams = Depends(get_pagination_params),
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(pagination.offset).limit(pagination.limit).all()

    items = [
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role.value,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat(),
            "updated_at": u.updated_at.isoformat(),
            "last_login": u.last_login.isoformat() if u.last_login else None
        } for u in users
    ]
    return api_paginated(items, total, pagination.page, pagination.limit, "Users retrieved successfully")

@router.post("", status_code=status.HTTP_201_CREATED)
def create_staff_user(
    req: UserCreate,
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN)),
    db: Session = Depends(get_db)
):
    # Only SUPER_ADMIN can create another SUPER_ADMIN or HOSPITAL_ADMIN
    if req.role in [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN] and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only SUPER_ADMIN can create administrative roles.")

    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")

    new_user = User(
        id=uuid.uuid4(),
        full_name=req.full_name.strip(),
        email=req.email.lower().strip(),
        phone=req.phone.strip() if req.phone else None,
        password_hash=hash_password(req.password),
        role=req.role,
        is_active=req.is_active,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return api_success(
        "Staff user created successfully",
        {
            "id": str(new_user.id),
            "full_name": new_user.full_name,
            "email": new_user.email,
            "phone": new_user.phone,
            "role": new_user.role.value,
            "is_active": new_user.is_active
        }
    )

@router.get("/{user_id}")
def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return api_success(
        "User retrieved successfully",
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role.value,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat()
        }
    )

@router.put("/{user_id}")
def update_user(
    user_id: uuid.UUID,
    req: UserUpdate,
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    update_data = req.model_dump(exclude_unset=True)
    if "role" in update_data and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Super Admin can change user roles.")

    for field, value in update_data.items():
        setattr(u, field, value)

    u.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(u)

    return api_success(
        "User updated successfully",
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active
        }
    )

@router.patch("/{user_id}/status")
def update_user_status(
    user_id: uuid.UUID,
    req: UserStatusUpdate,
    current_user: User = Depends(require_role(*ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    u.is_active = req.is_active
    u.updated_at = datetime.now(timezone.utc)
    db.commit()
    return api_success(f"User status updated to {'ACTIVE' if req.is_active else 'INACTIVE'}", {"id": str(u.id), "is_active": u.is_active})
