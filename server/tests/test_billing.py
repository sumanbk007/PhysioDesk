"""Tests for Billing: invoices, payments, refunds, status recompute."""

from decimal import Decimal

from fastapi.testclient import TestClient

from app.models.patient import Patient
from app.models.therapist import Therapist


BASE = "/api/v1/invoices"
BILLING = "/api/v1/billing"


def _new_invoice(auth_client: TestClient, patient_id: int, amount: str = "1000.00", discount: str = "0.00"):
    r = auth_client.post(
        BASE,
        json={
            "patient_id": patient_id,
            "service": "Session - Physiotherapy",
            "amount": amount,
            "discount": discount,
        },
    )
    assert r.status_code == 201, r.text
    return r.json()


def test_unauthenticated_is_rejected(client: TestClient):
    assert client.get(BASE).status_code == 401


def test_create_invoice_generates_number_and_status(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00")
    assert inv["status"] == "Due"
    assert inv["paid_amount"] == "0.00"
    assert inv["invoice_number"].startswith("INV-")
    auth_client.delete(f"{BASE}/{inv['id']}")


def test_discount_cannot_exceed_amount(auth_client: TestClient, sample_patient: Patient):
    r = auth_client.post(
        BASE,
        json={
            "patient_id": sample_patient.id,
            "service": "Test",
            "amount": "500.00",
            "discount": "600.00",
        },
    )
    assert r.status_code == 422


def test_partial_then_full_payment(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00")

    p1 = auth_client.post(
        f"{BASE}/{inv['id']}/payments",
        json={"amount": "400.00", "method": "Cash"},
    )
    assert p1.status_code == 201, p1.text

    after_partial = auth_client.get(f"{BASE}/{inv['id']}").json()
    assert after_partial["status"] == "Partial"
    assert after_partial["paid_amount"] == "400.00"

    p2 = auth_client.post(
        f"{BASE}/{inv['id']}/payments",
        json={"amount": "600.00", "method": "eSewa", "method_details": {"txn_id": "TXN-1"}},
    )
    assert p2.status_code == 201

    after_full = auth_client.get(f"{BASE}/{inv['id']}").json()
    assert after_full["status"] == "Paid"
    assert after_full["paid_amount"] == "1000.00"

    auth_client.delete(f"{BASE}/{inv['id']}")


def test_payment_cannot_exceed_balance(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00")

    r = auth_client.post(
        f"{BASE}/{inv['id']}/payments",
        json={"amount": "1500.00", "method": "Cash"},
    )
    assert r.status_code == 400
    assert "cannot exceed balance" in r.json()["error"]["detail"].lower()

    auth_client.delete(f"{BASE}/{inv['id']}")


def test_discount_reduces_balance(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00", "200.00")
    r = auth_client.post(
        f"{BASE}/{inv['id']}/payments",
        json={"amount": "800.00", "method": "Cash"},
    )
    assert r.status_code == 201

    after = auth_client.get(f"{BASE}/{inv['id']}").json()
    assert after["status"] == "Paid"

    auth_client.delete(f"{BASE}/{inv['id']}")


def test_refund_reverses_payment(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00")

    auth_client.post(f"{BASE}/{inv['id']}/payments", json={"amount": "1000.00", "method": "Cash"})
    assert auth_client.get(f"{BASE}/{inv['id']}").json()["status"] == "Paid"

    r = auth_client.post(
        f"{BASE}/{inv['id']}/payments",
        json={"amount": "-300.00", "method": "Cash", "note": "Partial refund"},
    )
    assert r.status_code == 201, r.text

    after = auth_client.get(f"{BASE}/{inv['id']}").json()
    assert after["status"] == "Partial"
    assert after["paid_amount"] == "700.00"

    auth_client.delete(f"{BASE}/{inv['id']}")


def test_full_refund_marks_invoice_refunded(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "500.00")
    auth_client.post(f"{BASE}/{inv['id']}/payments", json={"amount": "500.00", "method": "Cash"})
    auth_client.post(
        f"{BASE}/{inv['id']}/payments",
        json={"amount": "-500.00", "method": "Cash", "note": "Full refund"},
    )
    after = auth_client.get(f"{BASE}/{inv['id']}").json()
    assert after["status"] == "Refunded"
    assert after["paid_amount"] == "0.00"
    auth_client.delete(f"{BASE}/{inv['id']}")


def test_refund_cannot_exceed_paid(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00")
    auth_client.post(f"{BASE}/{inv['id']}/payments", json={"amount": "300.00", "method": "Cash"})

    r = auth_client.post(
        f"{BASE}/{inv['id']}/payments",
        json={"amount": "-500.00", "method": "Cash"},
    )
    assert r.status_code == 400
    assert "cannot exceed" in r.json()["error"]["detail"].lower()

    auth_client.delete(f"{BASE}/{inv['id']}")


def test_zero_amount_rejected(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00")
    r = auth_client.post(
        f"{BASE}/{inv['id']}/payments",
        json={"amount": "0", "method": "Cash"},
    )
    assert r.status_code == 422
    auth_client.delete(f"{BASE}/{inv['id']}")


def test_payment_history(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "500.00")
    auth_client.post(f"{BASE}/{inv['id']}/payments", json={"amount": "200.00", "method": "Cash"})
    auth_client.post(f"{BASE}/{inv['id']}/payments", json={"amount": "300.00", "method": "eSewa"})

    r = auth_client.get(f"{BASE}/{inv['id']}/payments")
    assert r.status_code == 200
    body = r.json()
    assert len(body) == 2
    assert body[0]["amount"] == "200.00"
    assert body[1]["amount"] == "300.00"
    auth_client.delete(f"{BASE}/{inv['id']}")


def test_delete_payment_recomputes_status(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "500.00")
    p = auth_client.post(f"{BASE}/{inv['id']}/payments", json={"amount": "500.00", "method": "Cash"}).json()

    auth_client.delete(f"{BASE}/payments/{p['id']}")
    after = auth_client.get(f"{BASE}/{inv['id']}").json()
    assert after["status"] == "Due"
    assert after["paid_amount"] == "0.00"

    auth_client.delete(f"{BASE}/{inv['id']}")


def test_list_invoices_with_filter(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00")
    r = auth_client.get(BASE, params={"status": "Due", "patient_id": sample_patient.id})
    assert r.status_code == 200
    body = r.json()
    assert any(item["id"] == inv["id"] for item in body["items"])
    auth_client.delete(f"{BASE}/{inv['id']}")


def test_patient_invoices_endpoint(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00")
    r = auth_client.get(f"/api/v1/patients/{sample_patient.id}/invoices")
    assert r.status_code == 200
    assert any(item["id"] == inv["id"] for item in r.json()["items"])
    auth_client.delete(f"{BASE}/{inv['id']}")


def test_billing_dashboard(auth_client: TestClient, sample_patient: Patient):
    inv = _new_invoice(auth_client, sample_patient.id, "1000.00")
    auth_client.post(f"{BASE}/{inv['id']}/payments", json={"amount": "500.00", "method": "Cash"})

    r = auth_client.get(f"{BILLING}/dashboard")
    assert r.status_code == 200
    body = r.json()
    assert "today_revenue" in body
    assert "pending_payments" in body
    assert "total_patients" in body
    assert "today_appointments" in body
    assert Decimal(str(body["today_revenue"])) >= Decimal("0")

    auth_client.delete(f"{BASE}/{inv['id']}")
