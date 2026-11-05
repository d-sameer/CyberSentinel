
import os
from datetime import datetime, timedelta, timezone

import jwt


JWT_SECRET_KEY = os.getenv("CYBERSENTINEL_JWT_SECRET")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 30


def create_access_token(user_id: int, role: str) -> str:
    if not JWT_SECRET_KEY or len(JWT_SECRET_KEY) < 32:
        raise RuntimeError(
            "Set CYBERSENTINEL_JWT_SECRET to a random secret "
            "of at least 32 characters."
        )

    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }

    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    if not JWT_SECRET_KEY or len(JWT_SECRET_KEY) < 32:
        raise RuntimeError(
            "Set CYBERSENTINEL_JWT_SECRET to a random secret "
            "of at least 32 characters."
        )

    return jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms=[JWT_ALGORITHM],
        options={"require": ["sub", "iat", "exp"]},
    )
