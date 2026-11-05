
from getpass import getpass

from app.auth.passwords import hash_password
from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()

try:
    if db.query(User).count() != 0:
        print("STOP: An authentication user already exists.")
        raise SystemExit(1)

    username = input("Enter admin username: ").strip()
    email = input("Enter your email: ").strip().lower()
    password = getpass("Create a unique password (minimum 12 characters): ")
    confirm = getpass("Confirm password: ")

    if len(password) < 12:
        raise ValueError("Password must contain at least 12 characters.")

    if password != confirm:
        raise ValueError("Passwords do not match.")

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role="Admin",
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    print("Admin account created successfully.")
    print("Username:", user.username)
    print("Role:", user.role)
    print("Active:", user.is_active)

except Exception:
    db.rollback()
    raise
finally:
    db.close()
