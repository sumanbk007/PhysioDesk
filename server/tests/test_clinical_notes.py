"""Tests for the Clinical Notes module."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.therapist import Therapist


def _base(patient_id: int) -> str:
    return f"/api/v1/patients/{patient_id}/clinical-notes"


def _note_url(note_id: int) -> str:
    return f"/api/v1/clinical-notes/{note_id}"


def test_unauthenticated_is_rejected(client: TestClient, sample_patient: Patient):
    r = client.get(_base(sample_patient.id))
    assert r.status_code == 401


def test_create_note(auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist):
    payload = {
        "therapist_id": sample_therapist.id,
        "chief_complaint": "Lower back pain",
        "pain_score": 6,
        "rom_score": 70,
        "strength_score": 4,
    }
    r = auth_client.post(_base(sample_patient.id), json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["patient_id"] == sample_patient.id
    assert body["therapist_id"] == sample_therapist.id
    assert body["pain_score"] == 6
    assert body["rom_score"] == 70
    assert body["strength_score"] == 4
    auth_client.delete(_note_url(body["id"]))


def test_create_note_increments_sessions_used(
    auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist
):
    before = auth_client.get(f"/api/v1/patients/{sample_patient.id}").json()["sessions_used"]

    r = auth_client.post(
        _base(sample_patient.id),
        json={"therapist_id": sample_therapist.id, "pain_score": 5},
    )
    assert r.status_code == 201
    note_id = r.json()["id"]

    after = auth_client.get(f"/api/v1/patients/{sample_patient.id}").json()["sessions_used"]
    assert after == before + 1

    auth_client.delete(_note_url(note_id))

    final = auth_client.get(f"/api/v1/patients/{sample_patient.id}").json()["sessions_used"]
    assert final == before


def test_create_note_with_missing_therapist(
    auth_client: TestClient, sample_patient: Patient
):
    r = auth_client.post(
        _base(sample_patient.id),
        json={"therapist_id": 999999, "pain_score": 5},
    )
    assert r.status_code == 400


def test_create_note_with_bad_pain_score(
    auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist
):
    r = auth_client.post(
        _base(sample_patient.id),
        json={"therapist_id": sample_therapist.id, "pain_score": 11},
    )
    assert r.status_code == 422


def test_create_note_with_bad_rom_score(
    auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist
):
    r = auth_client.post(
        _base(sample_patient.id),
        json={"therapist_id": sample_therapist.id, "rom_score": 101},
    )
    assert r.status_code == 422


def test_create_note_with_bad_strength_score(
    auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist
):
    r = auth_client.post(
        _base(sample_patient.id),
        json={"therapist_id": sample_therapist.id, "strength_score": 6},
    )
    assert r.status_code == 422


def test_create_note_for_missing_patient(
    auth_client: TestClient, sample_therapist: Therapist
):
    r = auth_client.post(
        _base(999999),
        json={"therapist_id": sample_therapist.id, "pain_score": 5},
    )
    assert r.status_code == 404


def test_list_notes_newest_first(
    auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist
):
    ids = []
    for i in range(3):
        r = auth_client.post(
            _base(sample_patient.id),
            json={
                "therapist_id": sample_therapist.id,
                "pain_score": 5 + i,
                "chief_complaint": f"Visit {i}",
            },
        )
        ids.append(r.json()["id"])

    r = auth_client.get(_base(sample_patient.id))
    assert r.status_code == 200
    body = r.json()
    assert body["total"] >= 3
    assert body["items"][0]["id"] == ids[-1]

    for nid in ids:
        auth_client.delete(_note_url(nid))


def test_get_note(auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist):
    r = auth_client.post(
        _base(sample_patient.id),
        json={"therapist_id": sample_therapist.id, "pain_score": 5},
    )
    note_id = r.json()["id"]

    g = auth_client.get(_note_url(note_id))
    assert g.status_code == 200
    assert g.json()["id"] == note_id

    auth_client.delete(_note_url(note_id))


def test_get_missing_note(auth_client: TestClient):
    r = auth_client.get(_note_url(999999))
    assert r.status_code == 404


def test_update_note(auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist):
    r = auth_client.post(
        _base(sample_patient.id),
        json={"therapist_id": sample_therapist.id, "pain_score": 7},
    )
    note_id = r.json()["id"]

    u = auth_client.patch(_note_url(note_id), json={"pain_score": 3})
    assert u.status_code == 200
    assert u.json()["pain_score"] == 3

    auth_client.delete(_note_url(note_id))


def test_delete_note(auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist):
    r = auth_client.post(
        _base(sample_patient.id),
        json={"therapist_id": sample_therapist.id, "pain_score": 5},
    )
    note_id = r.json()["id"]

    d = auth_client.delete(_note_url(note_id))
    assert d.status_code == 200

    again = auth_client.delete(_note_url(note_id))
    assert again.status_code == 404


def test_milestone_flag_persists(
    auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist
):
    r = auth_client.post(
        _base(sample_patient.id),
        json={
            "therapist_id": sample_therapist.id,
            "milestone": "SLR test now negative",
            "pain_score": 3,
        },
    )
    note_id = r.json()["id"]

    g = auth_client.get(_note_url(note_id))
    assert g.json()["milestone"] == "SLR test now negative"

    auth_client.delete(_note_url(note_id))
