"use client";

import { useParams } from "next/navigation";
import { PatientHeader } from "@/features/patients/components/patient-header";
import { PatientTabs } from "@/features/patients/components/patient-tabs";
import { usePatient } from "@/features/patients/queries";
import styles from "./layout.module.scss";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);
  const patient = usePatient(id);

  const isNotFound =
    !patient.isLoading && (patient.isError || (!patient.data && id > 0));

  return (
    <div className={styles.page}>
      <PatientHeader
        patient={patient.data}
        loading={patient.isLoading}
        notFound={isNotFound}
      />

      {!isNotFound && (
        <>
          <PatientTabs patientId={id} />
          <div className={styles.content}>{children}</div>
        </>
      )}
    </div>
  );
}
