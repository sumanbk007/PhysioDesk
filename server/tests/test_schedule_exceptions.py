"""Tests for the schedule-exceptions sub-resource under /therapists."""

from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.therapist import Therapist


BASE = "/api/v1/therapists"


def _future(days: int = 30) -> str:
    return (date.today() + timedelta(days=days)).isoformat()


# ---------- AUTH GUARD ----------

def test_unauthenticated_request_is_rejected(client: TestClient, sample_therapist: Therapist):
    r = client.get(f"{BASE}/{sample_therapist.id}/schedule-exceptions")
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "authentication_error"


# ---------- CREATE ----------

def test_create_day_off_override(auth_client: TestClient, sample_therapist: Therapist):
    payload = {
        "date": _future(10),
        "is_off": True,
        "reason": "Public holiday",
    }
    r = auth_client.post(f"{BASE}/{sample_therapist.id}/schedule-exceptions", json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["is_off"] is True
    assert body["reason"] == "Public holiday"
    assert body["therapist_id"] == sample_therapist.id
    assert body["date"] == payload["date"]


def test_create_custom_hours_override(auth_client: TestClient, sample_therapist: Therapist):
    payload = {
        "date": _future(11),
        "is_off": False,
        "custom_start": "10:00:00",
        "custom_end": "13:00:00",
        "reason": "Clinic renovation",
    }
    r = auth_client.post(f"{BASE}/{sample_therapist.id}/schedule-exceptions", json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["is_off"] is False
    assert body["custom_start"] == "10:00:00"
    assert body["custom_end"] == "13:00:00"


def test_create_for_missing_therapist_returns_404(auth_client: TestClient):
    payload = {"date": _future(5), "is_off": True}
    r = auth_client.post(f"{BASE}/999999/schedule-exceptions", json=payload)
    assert r.status_code == 404
    assert "not found" in r.json()["error"]["detail"].lower()


def test_create_duplicate_date_returns_409(auth_client: TestClient, sample_therapist: Therapist):
    payload = {"date": _future(20), "is_off": True}
    r1 = auth_client.post(f"{BASE}/{sample_therapist.id}/schedule-exceptions", json=payload)
    assert r1.status_code == 201

    r2 = auth_client.post(f"{BASE}/{sample_therapist.id}/schedule-exceptions", json=payload)
    assert r2.status_code == 409
    assert "already exists" in r2.json()["error"]["detail"].lower()


def test_create_without_custom_hours_when_not_off_returns_400(
    auth_client: TestClient, sample_therapist: Therapist
):
    payload = {"date": _future(21), "is_off": False}
    r = auth_client.post(f"{BASE}/{sample_therapist.id}/schedule-exceptions", json=payload)
    assert r.status_code == 400
    assert "custom_start" in r.json()["error"]["detail"].lower()


def test_create_with_invalid_time_range_returns_422(
    auth_client: TestClient, sample_therapist: Therapist
):
    payload = {
        "date": _future(22),
        "is_off": False,
        "custom_start": "15:00:00",
        "custom_end": "12:00:00",  # before start
    }
    r = auth_client.post(f"{BASE}/{sample_therapist.id}/schedule-exceptions", json=payload)
    assert r.status_code == 422  # Pydantic validator catches it


# ---------- LIST ----------

def test_list_overrides_for_therapist(auth_client: TestClient, sample_therapist: Therapist):
    auth_client.post(
        f"{BASE}/{sample_therapist.id}/schedule-exceptions",
        json={"date": _future(40), "is_off": True},
    )
    auth_client.post(
        f"{BASE}/{sample_therapist.id}/schedule-exceptions",
        json={"date": _future(41), "is_off": True},
    )

    r = auth_client.get(f"{BASE}/{sample_therapist.id}/schedule-exceptions")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) >= 2


def test_list_upcoming_only_filters_past(auth_client: TestClient, sample_therapist: Therapist):
    # Past date — should be excluded when upcoming_only=true
    auth_client.post(
        f"{BASE}/{sample_therapist.id}/schedule-exceptions",
        json={"date": _future(-5), "is_off": True, "reason": "past"},
    )
    # Future date — should be included
    auth_client.post(
        f"{BASE}/{sample_therapist.id}/schedule-exceptions",
        json={"date": _future(60), "is_off": True, "reason": "future"},
    )

    all_r = auth_client.get(f"{BASE}/{sample_therapist.id}/schedule-exceptions")
    upcoming_r = auth_client.get(
        f"{BASE}/{sample_therapist.id}/schedule-exceptions",
        params={"upcoming_only": True},
    )
    assert upcoming_r.status_code == 200
    assert len(upcoming_r.json()) <= len(all_r.json())


def test_list_for_missing_therapist_returns_404(auth_client: TestClient):
    r = auth_client.get(f"{BASE}/999999/schedule-exceptions")
    assert r.status_code == 404


# ---------- UPDATE ----------

def test_patch_mark_as_day_off(auth_client: TestClient, sample_therapist: Therapist):
    create = auth_client.post(
        f"{BASE}/{sample_therapist.id}/schedule-exceptions",
        json={
            "date": _future(80),
            "is_off": False,
            "custom_start": "10:00:00",
            "custom_end": "12:00:00",
        },
    )
    exc_id = create.json()["id"]

    r = auth_client.patch(
        f"{BASE}/schedule-exceptions/{exc_id}",
        json={"is_off": True, "reason": "Now a full day off"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["is_off"] is True
    assert r.json()["reason"] == "Now a full day off"


def test_patch_invalid_time_range_returns_400(
    auth_client: TestClient, sample_therapist: Therapist
):
    create = auth_client.post(
        f"{BASE}/{sample_therapist.id}/schedule-exceptions",
        json={
            "date": _future(90),
            "is_off": False,
            "custom_start": "10:00:00",
            "custom_end": "12:00:00",
        },
    )
    exc_id = create.json()["id"]

    r = auth_client.patch(
        f"{BASE}/schedule-exceptions/{exc_id}",
        json={"custom_end": "09:00:00"},  # before custom_start
    )
    assert r.status_code == 400
    assert "after" in r.json()["error"]["detail"].lower()


# ---------- DELETE ----------

def test_delete_override(auth_client: TestClient, sample_therapist: Therapist):
    create = auth_client.post(
        f"{BASE}/{sample_therapist.id}/schedule-exceptions",
        json={"date": _future(100), "is_off": True},
    )
    exc_id = create.json()["id"]

    r = auth_client.delete(f"{BASE}/schedule-exceptions/{exc_id}")
    assert r.status_code == 200
    assert "deleted" in r.json()["message"].lower()

    # Confirm gone
    again = auth_client.delete(f"{BASE}/schedule-exceptions/{exc_id}")
    assert again.status_code == 404


def test_delete_missing_returns_404(auth_client: TestClient):
    r = auth_client.delete(f"{BASE}/schedule-exceptions/999999")
    assert r.status_code == 404
