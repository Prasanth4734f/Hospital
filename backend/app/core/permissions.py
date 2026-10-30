from enum import Enum
from typing import List, Callable
from fastapi import HTTPException, status

class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    HOSPITAL_ADMIN = "HOSPITAL_ADMIN"
    DOCTOR = "DOCTOR"
    RECEPTIONIST = "RECEPTIONIST"
    PHARMACIST = "PHARMACIST"
    PATIENT = "PATIENT"

ADMIN_ROLES = [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN]
CLINICAL_ROLES = [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR]
STAFF_ROLES = [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PHARMACIST]
PHARMACY_ROLES = [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.PHARMACIST]
BILLING_ROLES = [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.RECEPTIONIST]
RECEPTION_ROLES = [UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.RECEPTIONIST]

def require_roles(allowed_roles: List[UserRole]) -> Callable:
    def role_checker(current_user):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker
