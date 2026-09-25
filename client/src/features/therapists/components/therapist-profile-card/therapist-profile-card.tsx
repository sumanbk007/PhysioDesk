"use client";

import { BadgeCheck, Briefcase, Mail, Phone, Star } from "lucide-react";
import { Card, InfoList, SectionHeader } from "@/components/ui";
import type { Therapist } from "../../types";
import styles from "./therapist-profile-card.module.scss";

interface TherapistProfileCardProps {
  therapist: Therapist;
}

export function TherapistProfileCard({
  therapist,
}: TherapistProfileCardProps) {
  const workDays = therapist.work_days.join(", ");

  return (
    <div className={styles.grid}>
      <Card className={styles.card}>
        <SectionHeader title="Contact" divider />
        <InfoList
          items={[
            {
              label: "Phone",
              value: therapist.phone ? (
                <span className={styles.inline}>
                  <Phone size={13} className={styles.icon} />
                  {therapist.phone}
                </span>
              ) : (
                "—"
              ),
            },
            {
              label: "Email",
              value: therapist.email ? (
                <span className={styles.inline}>
                  <Mail size={13} className={styles.icon} />
                  {therapist.email}
                </span>
              ) : (
                "—"
              ),
            },
            {
              label: "Experience",
              value: therapist.experience_years ? (
                <span className={styles.inline}>
                  <Briefcase size={13} className={styles.icon} />
                  {therapist.experience_years} years
                </span>
              ) : (
                "—"
              ),
            },
          ]}
        />
      </Card>

      <Card className={styles.card}>
        <SectionHeader title="Working hours" divider />
        <InfoList
          items={[
            { label: "Work days", value: workDays },
            {
              label: "Hours",
              value: `${therapist.start_time.slice(0, 5)} – ${therapist.end_time.slice(0, 5)}`,
            },
            {
              label: "Slot length",
              value: `${therapist.slot_minutes} min`,
            },
          ]}
        />
      </Card>

      {therapist.qualifications && (
        <Card className={`${styles.card} ${styles.wide}`}>
          <SectionHeader title="Qualifications" divider />
          <p className={styles.text}>
            <BadgeCheck size={14} className={styles.icon} />
            {therapist.qualifications}
          </p>
        </Card>
      )}

      {therapist.bio && (
        <Card className={`${styles.card} ${styles.wide}`}>
          <SectionHeader title="About" divider />
          <p className={styles.text}>
            <Star size={14} className={styles.icon} />
            {therapist.bio}
          </p>
        </Card>
      )}
    </div>
  );
}
