import uuid
from datetime import datetime, timezone
from app.database.session import SessionLocal
from app.models.user import User
from app.core.permissions import UserRole
from app.core.security import hash_password

def create_super_admin():
    db = SessionLocal()
    try:
        email = "superadmin@medicore.com"
        admin = db.query(User).filter(User.email == email).first()
        if not admin:
            admin = User(
                id=uuid.uuid4(),
                full_name="Super Administrator",
                email=email,
                phone="+19876543210",
                password_hash=hash_password("SuperAdmin@2026!"),
                role=UserRole.SUPER_ADMIN,
                is_active=True,
                is_verified=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(admin)
            db.commit()
            print(f"Super Admin created: {email} / SuperAdmin@2026!")
        else:
            print(f"Super Admin already exists: {email}")
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()
