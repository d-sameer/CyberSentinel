import pytest
import httpx

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models.user import User
from app.auth.passwords import hash_password
from app.routes.auth import router as auth_router


@pytest.fixture
async def api():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    with TestingSession() as db:
        db.add_all([
            User(username="admin_test", email="admin@test.local",
                 password_hash=hash_password("Admin-Test@2026"), role="Admin"),
            User(username="analyst_test", email="analyst@test.local",
                 password_hash=hash_password("Analyst-Test@2026"), role="Analyst"),
            User(username="viewer_test", email="viewer@test.local",
                 password_hash=hash_password("Viewer-Test@2026"), role="Viewer"),
        ])
        db.commit()

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    test_app = FastAPI()
    test_app.include_router(auth_router)
    test_app.dependency_overrides[get_db] = override_get_db

    transport = httpx.ASGITransport(app=test_app)

    try:
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            yield client
    finally:
        test_app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


async def login(client, username, password):
    return await client.post(
        "/api/auth/login",
        json={"username": username, "password": password},
    )


@pytest.mark.anyio
async def test_admin_login_and_profile(api):
    response = await login(api, "admin_test", "Admin-Test@2026")
    assert response.status_code == 200

    token = response.json()["access_token"]
    profile = await api.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert profile.status_code == 200
    assert profile.json()["role"] == "Admin"


@pytest.mark.anyio
async def test_invalid_login_is_rejected(api):
    response = await login(api, "admin_test", "WrongPassword@2026")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_analyst_cannot_list_users(api):
    response = await login(api, "analyst_test", "Analyst-Test@2026")
    token = response.json()["access_token"]
    users = await api.get(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert users.status_code == 403


@pytest.mark.anyio
async def test_viewer_cannot_list_users(api):
    response = await login(api, "viewer_test", "Viewer-Test@2026")
    token = response.json()["access_token"]
    users = await api.get(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert users.status_code == 403


@pytest.mark.anyio
async def test_unauthenticated_user_cannot_list_users(api):
    response = await api.get("/api/auth/users")
    assert response.status_code == 401

@pytest.mark.anyio
async def test_deactivated_user_cannot_use_existing_token(api):
    response = await login(api, "analyst_test", "Analyst-Test@2026")
    assert response.status_code == 200

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    profile_before = await api.get("/api/auth/me", headers=headers)
    assert profile_before.status_code == 200

    # Deactivation is performed through the Admin API.
    admin_login = await login(api, "admin_test", "Admin-Test@2026")
    admin_token = admin_login.json()["access_token"]

    deactivation = await api.patch(
        "/api/auth/users/2/status?is_active=false",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert deactivation.status_code == 200

    profile_after = await api.get("/api/auth/me", headers=headers)
    assert profile_after.status_code == 401
