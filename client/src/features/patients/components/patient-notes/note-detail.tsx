"use client";

import { FileText, Star } from "lucide-react";
import { EmptyState, PageLoader, SectionHeader, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { useClinicalNote } from "../../queries";
import { useTherapists } from "@/features/therapists/queries";
import styles from "./note-detail.module.scss";

interface NoteDetailProps {
  noteId: number | null;
}

interface Section {
  label: string;
  value: string | null;
}

function buildSections(note: {
  chief_complaint: string | null;
  pain_location: string | null;
  diagnosis: string | null;
  assessment: string | null;
  rom: string | null;
  strength: string | null;
  special_tests: string | null;
  treatment: string | null;
  exercises: string | null;
  patient_response: string | null;
  hep: string | null;
  plan: string | null;
  therapist_notes: string | null;
}): Section[] {
  return [
    { label: "Chief complaint", value: note.chief_complaint },
    { label: "Pain location", value: note.pain_location },
    { label: "Diagnosis / impression", value: note.diagnosis },
    { label: "Assessment findings", value: note.assessment },
    { label: "Range of motion", value: note.rom },
    { label: "Muscle strength", value: note.strength },
    { label: "Special tests", value: note.special_tests },
    { label: "Treatment provided", value: note.treatment },
    { label: "Exercises given", value: note.exercises },
    { label: "Patient response", value: note.patient_response },
    { label: "Home exercise program", value: note.hep },
    { label: "Next-session plan", value: note.plan },
    { label: "Therapist notes", value: note.therapist_notes },
  ].filter((s) => s.value && s.value.trim().length > 0) as Section[];
}

export function NoteDetail({ noteId }: NoteDetailProps) {
  const note = useClinicalNote(noteId ?? 0);
  const therapists = useTherapists({ page: 1, page_size: 100 });

  if (!noteId) {
    return (
      <EmptyState
        icon={<FileText size={32} />}
        title="Select a note"
        description="Pick a session from the list to view its details."
      />
    );
  }

  if (note.isLoading) {
    return <PageLoader label="Loading note..." />;
  }

  if (!note.data) {
    return (
      <EmptyState
        icon={<FileText size={32} />}
        title="Note not found"
        description="The selected note may have been deleted."
      />
    );
  }

  const n = note.data;
  const therapistName =
    therapists.data?.items.find((t) => t.id === n.therapist_id)?.name ??
    `Therapist #${n.therapist_id}`;

  const sections = buildSections(n);

  return (
    <article className={styles.detail}>
      <header className={styles.header}>
        <SectionHeader
          title={formatDate(n.note_date, "datetime")}
          subtitle={therapistName}
          action={
            n.milestone ? (
              <span className={styles.milestoneTag}>
                <Star size={12} className={styles.milestoneIcon} />
                Milestone
              </span>
            ) : undefined
          }
        />
      </header>

      <div className={styles.scores}>
        {n.pain_score !== null && (
          <div className={styles.score}>
            <span className={styles.scoreLabel}>Pain</span>
            <span className={styles.scoreValue}>{n.pain_score}/10</span>
          </div>
        )}
        {n.rom_score !== null && (
          <div className={styles.score}>
            <span className={styles.scoreLabel}>ROM</span>
            <span className={styles.scoreValue}>{n.rom_score}%</span>
          </div>
        )}
        {n.strength_score !== null && (
          <div className={styles.score}>
            <span className={styles.scoreLabel}>Strength</span>
            <span className={styles.scoreValue}>{n.strength_score}/5</span>
          </div>
        )}
      </div>

      {n.milestone && (
        <div className={styles.milestoneBox}>
          <Star size={14} className={styles.milestoneIcon} />
          <span>{n.milestone}</span>
        </div>
      )}

      <div className={styles.sections}>
        {sections.map((s) => (
          <div key={s.label} className={styles.section}>
            <div className={styles.sectionLabel}>{s.label}</div>
            <div className={styles.sectionValue}>{s.value}</div>
          </div>
        ))}
      </div>
    </article>
  );
}
