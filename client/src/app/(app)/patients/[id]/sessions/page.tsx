"use client";

import { useParams } from "next/navigation";
import { PatientSessions } from "@/features/patients/components/patient-sessions";

export default function PatientSessionsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);

  return <PatientSessions patientId={id} />;
}
