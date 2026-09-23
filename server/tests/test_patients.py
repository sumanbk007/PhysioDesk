"""Tests for the Patients module."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.therapist import Therapist


BASE = "/api/v1/patients"


# ---------- AUTH GUARD ----------

def test_unauthenticated_request_is_rejected(client: TestClient):
    r = client.get(BASE)
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "authentication_error"


# ---------- CREATE ----------

def test_create_patient(auth_client: TestClient, sample_therapist: Therapist):
    payload = {
        "name": "Test Create Patient",
        "age": 35,
        "gender": "Female",
        "phone": "9811111111",
        "address": "Kathmandu",
        "condition": "Lower back pain",
        "therapist_id": sample_therapist.id,
        "package": "10 sessions",
        "sessions_total": 10,
        "sessions_used": 0,
        "status": "Active",
    }
    r = auth_client.post(BASE, json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["name"] == "Test Create Patient"
    assert body["therapist_id"] == sample_therapist.id
    assert body["sessions_total"] == 10
    assert body["sessions_used"] == 0
    assert body["status"] == "Active"
    assert "id" in body

    # cleanup
    auth_client.delete(f"{BASE}/{body['id']}")


def test_create_patient_with_missing_therapist_returns_400(auth_client: TestClient):
    payload = {
        "name": "Orphan Patient",
        "age": 30,
        "gender": "Male",
        "phone": "9811111112",
        "condition": "Test",
        "therapist_id": 999999,
        "sessions_total": 5,
        "sessions_used": 0,
    }
    r = auth_client.post(BASE, json=payload)
    assert r.status_code == 400
    assert "does not exist" in r.json()["error"]["detail"].lower()


def test_create_with_sessions_used_exceeding_total_returns_422(
    auth_client: TestClient, sample_therapist: Therapist
):
    payload = {
        "name": "Bad Sessions",
        "age": 30,
        "gender": "Male",
        "phone": "9811111113",
        "condition": "Test",
        "therapist_id": sample_therapist.id,
        "sessions_total": 5,
        "sessions_used": 10,  # > total
    }
    r = auth_client.post(BASE, json=payload)
    assert r.status_code == 422
    detail = r.json()["error"]
    assert detail["code"] == "validation_error"


def test_create_with_invalid_gender_returns_422(
    auth_client: TestClient, sample_therapist: Therapist
):
    payload = {
        "name": "Bad Gender",
        "age": 30,
        "gender": "Alien",
        "phone": "9811111114",
        "condition": "Test",
        "therapist_id": sample_therapist.id,
        "sessions_total": 5,
        "sessions_used": 0,
    }
    r = auth_client.post(BASE, json=payload)
    assert r.status_code == 422


def test_create_with_invalid_status_returns_422(
    auth_client: TestClient, sample_therapist: Therapist
):
    payload = {
        "name": "Bad Status",
        "age": 30,
        "gender": "Male",
        "phone": "9811111115",
        "condition": "Test",
        "therapist_id": sample_therapist.id,
        "sessions_total": 5,
        "sessions_used": 0,
        "status": "Unknown",
    }
    r = auth_client.post(BASE, json=payload)
    assert r.status_code == 422


def test_create_with_negative_age_returns_422(
    auth_client: TestClient, sample_therapist: Therapist
):
    payload = {
        "name": "Negative Age",
        "age": -1,
        "gender": "Male",
        "phone": "9811111116",
        "condition": "Test",
        "therapist_id": sample_therapist.id,
        "sessions_total": 5,
        "sessions_used": 0,
    }
    r = auth_client.post(BASE, json=payload)
    assert r.status_code == 422


# ---------- LIST ----------

def test_list_patients_pagination_shape(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.get(BASE)
    assert r.status_code == 200
    body = r.json()
    assert set(body.keys()) >= {"items", "total", "page", "page_size", "pages"}
    assert isinstance(body["items"], list)
    assert body["page"] == 1
    assert body["page_size"] == 20


def test_search_by_name(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.get(BASE, params={"search": "Pytest Sample Patient"})
    assert r.status_code == 200
    names = [it["name"] for it in r.json()["items"]]
    assert any("Pytest Sample" in n for n in names)


def test_search_by_phone(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.get(BASE, params={"search": "9800000000"})
    assert r.status_code == 200
    phones = [it["phone"] for it in r.json()["items"]]
    assert "9800000000" in phones


def test_filter_by_therapist_id(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.get(BASE, params={"therapist_id": sample_patient.therapist_id})
    assert r.status_code == 200
    for item in r.json()["items"]:
        assert item["therapist_id"] == sample_patient.therapist_id


def test_filter_by_status(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.get(BASE, params={"status": "Active"})
    assert r.status_code == 200
    for item in r.json()["items"]:
        assert item["status"] == "Active"


def test_combined_filters(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.get(
        BASE,
        params={
            "search": "Pytest",
            "therapist_id": sample_patient.therapist_id,
            "status": "Active",
        },
    )
    assert r.status_code == 200
    items = r.json()["items"]
    assert all("Pytest" in i["name"] for i in items)


def test_pagination_page_size(auth_client: TestClient, sample_therapist: Therapist):
    # Create 3 patients
    ids = []
    for i in range(3):
        r = auth_client.post(
            BASE,
            json={
                "name": f"Pagination Patient {i}",
                "age": 30,
                "gender": "Male",
                "phone": f"98444400{i:02d}",
                "condition": "Test",
                "therapist_id": sample_therapist.id,
                "sessions_total": 5,
                "sessions_used": 0,
            },
        )
        ids.append(r.json()["id"])

    r = auth_client.get(BASE, params={"page": 1, "page_size": 2})
    assert r.status_code == 200
    body = r.json()
    assert body["page_size"] == 2
    assert len(body["items"]) <= 2

    # cleanup
    for pid in ids:
        auth_client.delete(f"{BASE}/{pid}")


# ---------- READ ----------

def test_get_one_patient(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.get(f"{BASE}/{sample_patient.id}")
    assert r.status_code == 200
    assert r.json()["id"] == sample_patient.id


def test_get_missing_patient_returns_404(auth_client: TestClient):
    r = auth_client.get(f"{BASE}/999999")
    assert r.status_code == 404
    assert r.json()["error"]["code"] == "not_found"


# ---------- UPDATE ----------

def test_patch_partial_update(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.patch(
        f"{BASE}/{sample_patient.id}", json={"condition": "Updated condition"}
    )
    assert r.status_code == 200
    assert r.json()["condition"] == "Updated condition"
    # Unchanged fields preserved
    assert r.json()["name"] == sample_patient.name


def test_patch_therapist_to_invalid_returns_400(
    auth_client: TestClient, sample_patient: Patient
):
    r = auth_client.patch(
        f"{BASE}/{sample_patient.id}", json={"therapist_id": 999999}
    )
    assert r.status_code == 400
    assert "does not exist" in r.json()["error"]["detail"].lower()


def test_patch_sessions_used_exceeding_total_returns_400(
    auth_client: TestClient, sample_patient: Patient
):
    # sample_patient has sessions_total=10, sessions_used=0
    r = auth_client.patch(
        f"{BASE}/{sample_patient.id}", json={"sessions_used": 20}
    )
    assert r.status_code == 400
    assert "exceed" in r.json()["error"]["detail"].lower()


# ---------- DELETE ----------

def test_delete_patient(auth_client: TestClient, sample_therapist: Therapist):
    r = auth_client.post(
        BASE,
        json={
            "name": "To Be Deleted",
            "age": 40,
            "gender": "Male",
            "phone": "9855555555",
            "condition": "Test",
            "therapist_id": sample_therapist.id,
            "sessions_total": 5,
            "sessions_used": 0,
        },
    )
    pid = r.json()["id"]

    d = auth_client.delete(f"{BASE}/{pid}")
    assert d.status_code == 200
    assert "deleted" in d.json()["message"].lower()

    # Second delete returns 404
    d2 = auth_client.delete(f"{BASE}/{pid}")
    assert d2.status_code == 404


def test_delete_missing_returns_404(auth_client: TestClient):
    r = auth_client.delete(f"{BASE}/999999")
    assert r.status_code == 404


# ---------- META ----------

def test_meta_statuses(auth_client: TestClient):
    r = auth_client.get(f"{BASE}/meta/statuses")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert "Active" in data
