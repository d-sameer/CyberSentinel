import pytest
import jwt

from app.auth.passwords import hash_password, verify_password
from app.auth.tokens import create_access_token, decode_access_token


def test_password_hash_is_not_plain_text():
    password = "CyberSentinel-Test@2026"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)


def test_wrong_password_is_rejected():
    hashed = hash_password("CyberSentinel-Test@2026")

    assert not verify_password("WrongPassword@2026", hashed)


def test_empty_password_is_rejected():
    with pytest.raises(ValueError):
        hash_password("   ")


def test_missing_password_hash_is_rejected():
    assert not verify_password("SomePassword@2026", "")


def test_jwt_creation_and_decoding():
    token = create_access_token(user_id=101, role="Analyst")
    payload = decode_access_token(token)

    assert payload["sub"] == "101"
    assert payload["role"] == "Analyst"
    assert "iat" in payload
    assert "exp" in payload


def test_expired_jwt_is_rejected():
    expired_token = jwt.encode(
        {
            "sub": "101",
            "role": "Analyst",
            "iat": 1000000000,
            "exp": 1000000001,
        },
        "cybersentinel-test-secret-only-not-for-production-2026",
        algorithm="HS256",
    )

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_access_token(expired_token)


def test_tampered_jwt_is_rejected():
    token = create_access_token(user_id=101, role="Analyst")
    tampered_token = token[:-5] + "abcde"

    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token(tampered_token)
