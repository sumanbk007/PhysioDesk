"use client";

import { useParams } from "next/navigation";
import { PatientReports } from "@/features/patients/components/patient-reports";

export default function PatientReportsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);

  return <PatientReports patientId={id} />;
}
