"""Shared pytest fixtures for the PhysioDesk test suite.

Uses the real Postgres database but cleans up test rows after each test.
"""

from __future__ import annotations

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Register all models with SQLAlchemy before any test imports them
from app.db.base import Base  # noqa: F401
from app.core.security import hash_password
from app.db.session import SessionLocal, engine
from app.main import app
from app.models.patient import Patient
from app.models.therapist import Therapist
from app.models.user import User


TEST_USERNAME = "test_frontdesk"
TEST_PASSWORD = "test_password_123"


@pytest.fixture(scope="session", autouse=True)
def setup_database() -> Generator[None, None, None]:
    """Ensure tables exist and create a test user once per test session."""
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        existing = (
            db.query(User).filter(User.username == TEST_USERNAME).first()
        )
        if existing is None:
            db.add(
                User(
                    username=TEST_USERNAME,
                    hashed_password=hash_password(TEST_PASSWORD),
                    full_name="Test Front Desk",
                )
            )
            db.commit()

    yield

    # Cleanup test user at the end (best effort)
    with SessionLocal() as db:
        db.query(User).filter(User.username == TEST_USERNAME).delete()
        db.commit()


@pytest.fixture
def db() -> Generator[Session, None, None]:
    """A DB session for a test."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client() -> TestClient:
    """A FastAPI test client (unauthenticated)."""
    return TestClient(app)


@pytest.fixture
def auth_client(client: TestClient) -> TestClient:
    """A test client with an Authorization header set from a real login."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"username": TEST_USERNAME, "password": TEST_PASSWORD},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    token = resp.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


@pytest.fixture
def sample_therapist(db: Session) -> Generator[Therapist, None, None]:
    """A therapist that exists only for the duration of one test."""
    t = Therapist(
        name="Pytest Sample Therapist",
        specialty="Pytest Specialty",
        email="pytest.sample@physiodesk.test",
        work_days=["Mon", "Tue", "Wed"],
        start_time="09:00:00",
        end_time="17:00:00",
        slot_minutes=30,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    yield t
    # Cleanup any patients attached to this therapist, then the therapist
    db.query(Patient).filter(Patient.therapist_id == t.id).delete()
    db.query(Therapist).filter(Therapist.id == t.id).delete()
    db.commit()


@pytest.fixture
def sample_patient(
    db: Session, sample_therapist: Therapist
) -> Generator[Patient, None, None]:
    """A patient assigned to sample_therapist, cleaned up after the test."""
    p = Patient(
        name="Pytest Sample Patient",
        age=30,
        gender="Male",
        phone="9800000000",
        condition="Test condition",
        therapist_id=sample_therapist.id,
        sessions_total=10,
        sessions_used=0,
        status="Active",
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    yield p
    db.query(Patient).filter(Patient.id == p.id).delete()
    db.commit()
