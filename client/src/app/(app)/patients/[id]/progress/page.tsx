"use client";

import { useParams } from "next/navigation";
import { PatientProgress } from "@/features/patients/components/patient-progress";

export default function PatientProgressPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);

  return <PatientProgress patientId={id} />;
}
