"""Tests for Notifications and Dashboard."""

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.models.patient import Patient
from app.models.therapist import Therapist


NOTIF = "/api/v1/notifications"
DASH = "/api/v1/dashboard"


def _new_notification(auth_client: TestClient, patient_id: int):
    payload = {
        "patient_id": patient_id,
        "type": "Appointment reminder",
        "channel": "SMS",
        "scheduled_for": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "message": "Reminder: you have an appointment tomorrow.",
    }
    r = auth_client.post(NOTIF, json=payload)
    assert r.status_code == 201, r.text
    return r.json()


def test_unauthenticated_notifications(client: TestClient):
    assert client.get(NOTIF).status_code == 401


def test_unauthenticated_dashboard(client: TestClient):
    assert client.get(f"{DASH}/summary").status_code == 401


def test_create_notification(auth_client: TestClient, sample_patient: Patient):
    n = _new_notification(auth_client, sample_patient.id)
    assert n["status"] == "Scheduled"
    assert n["sent_at"] is None
    auth_client.delete(f"{NOTIF}/{n['id']}")


def test_create_notification_with_invalid_type(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.post(
        NOTIF,
        json={
            "patient_id": sample_patient.id,
            "type": "Bogus",
            "channel": "SMS",
            "scheduled_for": datetime.now(timezone.utc).isoformat(),
            "message": "Test",
        },
    )
    assert r.status_code == 422


def test_create_notification_for_missing_patient(auth_client: TestClient):
    r = auth_client.post(
        NOTIF,
        json={
            "patient_id": 999999,
            "type": "Appointment reminder",
            "channel": "SMS",
            "scheduled_for": datetime.now(timezone.utc).isoformat(),
            "message": "Test",
        },
    )
    assert r.status_code == 400


def test_mark_sent(auth_client: TestClient, sample_patient: Patient):
    n = _new_notification(auth_client, sample_patient.id)
    r = auth_client.post(f"{NOTIF}/{n['id']}/mark-sent")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "Sent"
    assert body["sent_at"] is not None
    auth_client.delete(f"{NOTIF}/{n['id']}")


def test_mark_sent_twice_conflicts(auth_client: TestClient, sample_patient: Patient):
    n = _new_notification(auth_client, sample_patient.id)
    auth_client.post(f"{NOTIF}/{n['id']}/mark-sent")
    r = auth_client.post(f"{NOTIF}/{n['id']}/mark-sent")
    assert r.status_code == 409
    auth_client.delete(f"{NOTIF}/{n['id']}")


def test_cancel(auth_client: TestClient, sample_patient: Patient):
    n = _new_notification(auth_client, sample_patient.id)
    r = auth_client.post(f"{NOTIF}/{n['id']}/cancel")
    assert r.status_code == 200
    assert r.json()["status"] == "Cancelled"
    auth_client.delete(f"{NOTIF}/{n['id']}")


def test_cancel_after_sent_conflicts(auth_client: TestClient, sample_patient: Patient):
    n = _new_notification(auth_client, sample_patient.id)
    auth_client.post(f"{NOTIF}/{n['id']}/mark-sent")
    r = auth_client.post(f"{NOTIF}/{n['id']}/cancel")
    assert r.status_code == 409
    auth_client.delete(f"{NOTIF}/{n['id']}")


def test_list_filtered_by_status(auth_client: TestClient, sample_patient: Patient):
    n = _new_notification(auth_client, sample_patient.id)
    auth_client.post(f"{NOTIF}/{n['id']}/mark-sent")

    r = auth_client.get(NOTIF, params={"status": "Sent"})
    assert r.status_code == 200
    for item in r.json()["items"]:
        assert item["status"] == "Sent"

    auth_client.delete(f"{NOTIF}/{n['id']}")


def test_delete_notification(auth_client: TestClient, sample_patient: Patient):
    n = _new_notification(auth_client, sample_patient.id)
    d = auth_client.delete(f"{NOTIF}/{n['id']}")
    assert d.status_code == 200
    again = auth_client.delete(f"{NOTIF}/{n['id']}")
    assert again.status_code == 404


def test_dashboard_summary(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.get(f"{DASH}/summary")
    assert r.status_code == 200
    body = r.json()
    assert set(body.keys()) >= {
        "date",
        "patients_seen_today",
        "therapists_on_duty",
        "revenue_today",
        "open_slots_today",
    }


def test_dashboard_capacity(auth_client: TestClient, sample_therapist: Therapist):
    r = auth_client.get(f"{DASH}/capacity")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_dashboard_recent_patients(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.get(f"{DASH}/recent-patients", params={"limit": 3})
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) <= 3
