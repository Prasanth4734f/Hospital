import re

def validate_phone(phone: str) -> bool:
    if not phone:
        return False
    # Standard 10-15 digit phone format, optional leading +
    pattern = r"^\+?[0-9]{10,15}$"
    return bool(re.match(pattern, phone.strip()))

def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter."
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter."
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit."
    return True, ""
