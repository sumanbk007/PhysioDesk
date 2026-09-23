"""Tests for the Schedule and Appointments modules."""

from datetime import date as date_type, time as time_type, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.therapist import Therapist


SCHEDULE = "/api/v1/schedule"
APPOINTMENTS = "/api/v1/appointments"


def _next_working_day(therapist: Therapist) -> date_type:
    """Return the next date (>= tomorrow) that falls on the therapist's work_days."""
    d = date_type.today() + timedelta(days=1)
    for _ in range(14):
        # weekday: Mon=0 ... Sun=6
        abbrev = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d.weekday()]
        if abbrev in therapist.work_days:
            return d
        d += timedelta(days=1)
    raise RuntimeError("Therapist has no working days in the next 2 weeks")


# ---------- SCHEDULE GRID ----------

def test_schedule_unauthenticated(client: TestClient):
    r = client.get(SCHEDULE, params={"date": str(date_type.today())})
    assert r.status_code == 401


def test_schedule_returns_grid(auth_client: TestClient, sample_therapist: Therapist):
    d = _next_working_day(sample_therapist)
    r = auth_client.get(SCHEDULE, params={"date": str(d), "therapist_id": sample_therapist.id})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["date"] == str(d)
    entries = body["therapists"]
    assert len(entries) == 1
    entry = entries[0]
    assert entry["therapist_id"] == sample_therapist.id
    assert entry["is_off"] is False
    # 09:00-17:00 with 30-min slots = 16 slots
    assert entry["total_slots"] == 16
    assert entry["free_slots"] == 16
    assert entry["booked_slots"] == 0
    assert len(entry["slots"]) == 16


def test_schedule_shows_off_when_exception_is_off(
    auth_client: TestClient, sample_therapist: Therapist
):
    d = _next_working_day(sample_therapist)
    auth_client.post(
        f"/api/v1/therapists/{sample_therapist.id}/schedule-exceptions",
        json={"date": str(d), "is_off": True, "reason": "Test off"},
    )
    r = auth_client.get(SCHEDULE, params={"date": str(d), "therapist_id": sample_therapist.id})
    assert r.status_code == 200
    entry = r.json()["therapists"][0]
    assert entry["is_off"] is True
    assert entry["total_slots"] == 0
    assert entry["slots"] == []


# ---------- APPOINTMENTS ----------

def test_create_appointment(
    auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient
):
    d = _next_working_day(sample_therapist)
    r = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "10:00:00",
            "end_time": "10:30:00",
            "payment_method": "Cash",
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["patient_id"] == sample_patient.id
    assert body["therapist_id"] == sample_therapist.id
    assert body["status"] == "Booked"

    auth_client.delete(f"{APPOINTMENTS}/{body['id']}")


def test_booked_slot_appears_in_schedule(
    auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient
):
    d = _next_working_day(sample_therapist)
    r = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "10:00:00",
            "end_time": "10:30:00",
        },
    )
    appt_id = r.json()["id"]

    s = auth_client.get(SCHEDULE, params={"date": str(d), "therapist_id": sample_therapist.id})
    entry = s.json()["therapists"][0]
    assert entry["booked_slots"] == 1
    booked = [slot for slot in entry["slots"] if slot["is_booked"]]
    assert len(booked) == 1
    assert booked[0]["appointment_id"] == appt_id
    assert booked[0]["patient_id"] == sample_patient.id

    auth_client.delete(f"{APPOINTMENTS}/{appt_id}")


def test_double_booking_returns_409(
    auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient
):
    d = _next_working_day(sample_therapist)
    payload = {
        "patient_id": sample_patient.id,
        "therapist_id": sample_therapist.id,
        "date": str(d),
        "start_time": "11:00:00",
        "end_time": "11:30:00",
    }
    r1 = auth_client.post(APPOINTMENTS, json=payload)
    assert r1.status_code == 201
    id1 = r1.json()["id"]

    r2 = auth_client.post(APPOINTMENTS, json=payload)
    assert r2.status_code == 409
    assert "already booked" in r2.json()["error"]["detail"].lower()

    auth_client.delete(f"{APPOINTMENTS}/{id1}")


def test_create_with_missing_patient_returns_400(
    auth_client: TestClient, sample_therapist: Therapist
):
    d = _next_working_day(sample_therapist)
    r = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": 999999,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "12:00:00",
            "end_time": "12:30:00",
        },
    )
    assert r.status_code == 400


def test_create_with_invalid_time_range_returns_422(
    auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient
):
    d = _next_working_day(sample_therapist)
    r = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "15:00:00",
            "end_time": "14:00:00",
        },
    )
    assert r.status_code == 422


def test_reschedule(
    auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient
):
    d = _next_working_day(sample_therapist)
    r = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "13:00:00",
            "end_time": "13:30:00",
        },
    )
    appt_id = r.json()["id"]

    r2 = auth_client.patch(
        f"{APPOINTMENTS}/{appt_id}",
        json={"start_time": "14:00:00", "end_time": "14:30:00"},
    )
    assert r2.status_code == 200
    assert r2.json()["start_time"] == "14:00:00"

    auth_client.delete(f"{APPOINTMENTS}/{appt_id}")


def test_reschedule_into_booked_slot_returns_409(
    auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient
):
    d = _next_working_day(sample_therapist)
    r1 = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "15:00:00",
            "end_time": "15:30:00",
        },
    )
    id1 = r1.json()["id"]

    r2 = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "15:30:00",
            "end_time": "16:00:00",
        },
    )
    id2 = r2.json()["id"]

    r3 = auth_client.patch(
        f"{APPOINTMENTS}/{id2}",
        json={"start_time": "15:00:00", "end_time": "15:30:00"},
    )
    assert r3.status_code == 409

    auth_client.delete(f"{APPOINTMENTS}/{id1}")
    auth_client.delete(f"{APPOINTMENTS}/{id2}")


def test_cancel_frees_slot(
    auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient
):
    d = _next_working_day(sample_therapist)
    r = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "16:00:00",
            "end_time": "16:30:00",
        },
    )
    appt_id = r.json()["id"]

    c = auth_client.patch(f"{APPOINTMENTS}/{appt_id}", json={"status": "Cancelled"})
    assert c.status_code == 200
    assert c.json()["status"] == "Cancelled"

    s = auth_client.get(SCHEDULE, params={"date": str(d), "therapist_id": sample_therapist.id})
    entry = s.json()["therapists"][0]
    assert entry["booked_slots"] == 0

    auth_client.delete(f"{APPOINTMENTS}/{appt_id}")


def test_get_appointment(auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient):
    d = _next_working_day(sample_therapist)
    r = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "16:30:00",
            "end_time": "17:00:00",
        },
    )
    appt_id = r.json()["id"]

    g = auth_client.get(f"{APPOINTMENTS}/{appt_id}")
    assert g.status_code == 200
    assert g.json()["id"] == appt_id

    auth_client.delete(f"{APPOINTMENTS}/{appt_id}")


def test_get_missing_appointment_returns_404(auth_client: TestClient):
    r = auth_client.get(f"{APPOINTMENTS}/999999")
    assert r.status_code == 404


def test_delete_appointment(auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient):
    d = _next_working_day(sample_therapist)
    r = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "09:00:00",
            "end_time": "09:30:00",
        },
    )
    appt_id = r.json()["id"]

    d1 = auth_client.delete(f"{APPOINTMENTS}/{appt_id}")
    assert d1.status_code == 200
    d2 = auth_client.delete(f"{APPOINTMENTS}/{appt_id}")
    assert d2.status_code == 404


def test_patient_session_history(auth_client: TestClient, sample_therapist: Therapist, sample_patient: Patient):
    d = _next_working_day(sample_therapist)
    r = auth_client.post(
        APPOINTMENTS,
        json={
            "patient_id": sample_patient.id,
            "therapist_id": sample_therapist.id,
            "date": str(d),
            "start_time": "09:30:00",
            "end_time": "10:00:00",
        },
    )
    appt_id = r.json()["id"]

    h = auth_client.get(f"/api/v1/patients/{sample_patient.id}/appointments")
    assert h.status_code == 200
    body = h.json()
    assert body["total"] >= 1
    assert any(item["id"] == appt_id for item in body["items"])

    auth_client.delete(f"{APPOINTMENTS}/{appt_id}")


def test_patient_history_for_missing_patient_returns_404(auth_client: TestClient):
    r = auth_client.get("/api/v1/patients/999999/appointments")
    assert r.status_code == 404
