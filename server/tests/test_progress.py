"""Tests for the patient progress endpoint."""

from fastapi.testclient import TestClient

from app.models.patient import Patient
from app.models.therapist import Therapist


def _url(patient_id: int) -> str:
    return f"/api/v1/patients/{patient_id}/progress"


def _notes_url(patient_id: int) -> str:
    return f"/api/v1/patients/{patient_id}/clinical-notes"


def _note_url(note_id: int) -> str:
    return f"/api/v1/clinical-notes/{note_id}"


def test_unauthenticated_is_rejected(client: TestClient, sample_patient: Patient):
    r = client.get(_url(sample_patient.id))
    assert r.status_code == 401


def test_empty_progress_for_patient_with_no_notes(
    auth_client: TestClient, sample_patient: Patient
):
    r = auth_client.get(_url(sample_patient.id))
    assert r.status_code == 200
    body = r.json()
    assert body["patient_id"] == sample_patient.id
    assert body["pain"] == []
    assert body["rom"] == []
    assert body["strength"] == []
    assert body["milestones"] == []


def test_progress_series_and_milestones(
    auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist
):
    ids = []
    for pain, rom, strength in [(7, 45, 4), (5, 60, 4), (3, 80, 5)]:
        r = auth_client.post(
            _notes_url(sample_patient.id),
            json={
                "therapist_id": sample_therapist.id,
                "pain_score": pain,
                "rom_score": rom,
                "strength_score": strength,
            },
        )
        ids.append(r.json()["id"])

    r = auth_client.post(
        _notes_url(sample_patient.id),
        json={
            "therapist_id": sample_therapist.id,
            "pain_score": 2,
            "rom_score": 90,
            "strength_score": 5,
            "milestone": "SLR test now negative",
        },
    )
    ids.append(r.json()["id"])

    g = auth_client.get(_url(sample_patient.id))
    assert g.status_code == 200
    body = g.json()

    assert len(body["pain"]) == 4
    assert body["pain"][0]["value"] == 7
    assert body["pain"][-1]["value"] == 2

    assert len(body["rom"]) == 4
    assert body["rom"][0]["value"] == 45
    assert body["rom"][-1]["value"] == 90

    assert len(body["strength"]) == 4
    assert body["strength"][0]["value"] == 4
    assert body["strength"][-1]["value"] == 5

    assert len(body["milestones"]) == 1
    assert body["milestones"][0]["text"] == "SLR test now negative"

    for nid in ids:
        auth_client.delete(_note_url(nid))


def test_series_skips_null_scores(
    auth_client: TestClient, sample_patient: Patient, sample_therapist: Therapist
):
    r1 = auth_client.post(
        _notes_url(sample_patient.id),
        json={"therapist_id": sample_therapist.id, "pain_score": 5},
    )
    r2 = auth_client.post(
        _notes_url(sample_patient.id),
        json={"therapist_id": sample_therapist.id},  # no pain_score
    )
    r3 = auth_client.post(
        _notes_url(sample_patient.id),
        json={"therapist_id": sample_therapist.id, "pain_score": 3},
    )

    g = auth_client.get(_url(sample_patient.id))
    assert len(g.json()["pain"]) == 2

    for r in (r1, r2, r3):
        auth_client.delete(_note_url(r.json()["id"]))


def test_progress_for_missing_patient_returns_404(auth_client: TestClient):
    r = auth_client.get(_url(999999))
    assert r.status_code == 404
