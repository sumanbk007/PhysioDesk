"use client";

import { useParams } from "next/navigation";
import { PatientNotes } from "@/features/patients/components/patient-notes";

export default function PatientNotesPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);

  return <PatientNotes patientId={id} />;
}
