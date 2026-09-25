"use client";

import { useParams } from "next/navigation";
import { PatientBilling } from "@/features/patients/components/patient-billing";

export default function PatientBillingPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);

  return <PatientBilling patientId={id} />;
}
