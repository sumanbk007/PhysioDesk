"use client";

import { useParams } from "next/navigation";
import { PageLoader } from "@/components/ui";
import { TherapistHeader } from "@/features/therapists/components/therapist-header";
import { TherapistProfileCard } from "@/features/therapists/components/therapist-profile-card";
import { useTherapist } from "@/features/therapists/queries";
import styles from "./profile.module.scss";

export default function TherapistProfilePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);
  const therapist = useTherapist(id);

  const isNotFound =
    !therapist.isLoading &&
    (therapist.isError || (!therapist.data && id > 0));

  return (
    <div className={styles.page}>
      <TherapistHeader
        therapist={therapist.data}
        loading={therapist.isLoading}
        notFound={isNotFound}
      />

      {therapist.isLoading && <PageLoader label="Loading profile..." />}

      {therapist.data && (
        <TherapistProfileCard therapist={therapist.data} />
      )}
    </div>
  );
}
