
from pwdlib import PasswordHash

_password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    if not password or not password.strip():
        raise ValueError("Password must not be empty.")

    return _password_hash.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    if not password or not password_hash:
        return False

    try:
        return _password_hash.verify(password, password_hash)
    except (ValueError, TypeError):
        return False
