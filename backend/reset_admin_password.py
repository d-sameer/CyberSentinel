
from getpass import getpass

from app.auth.passwords import hash_password
from app.database import SessionLocal
from app.models.user import User


def main():
    username = input("Enter admin username: ").strip()
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if user is None:
            print("ERROR: Admin account was not found. No changes made.")
            return

        print(f"Account: {user.username}")
        print(f"Role: {user.role}")
        print(f"Active: {user.is_active}")

        if not user.is_active or user.role != "Admin":
            print("ERROR: Account is not an active Admin. No changes made.")
            return

        password = getpass("Enter a NEW password (minimum 12 characters): ")
        confirmation = getpass("Confirm the new password: ")

        if len(password) < 12:
            print("ERROR: Password must contain at least 12 characters.")
            return

        if password != confirmation:
            print("ERROR: Passwords do not match. No changes made.")
            return

        user.password_hash = hash_password(password)
        db.commit()

        print("SUCCESS: Admin password has been reset.")
        print("Your username and role have not changed.")

    except Exception:
        db.rollback()
        print("ERROR: Reset failed. Database changes were rolled back.")
        raise

    finally:
        db.close()

if __name__ == "__main__":
    main()
