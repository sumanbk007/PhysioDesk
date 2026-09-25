"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Card, EmptyState, PageLoader, SectionHeader } from "@/components/ui";
import { usePatient, usePatientNotes } from "../../queries";
import { NoteDetail } from "./note-detail";
import { NotesList } from "./notes-list";
import { NoteFormModal } from "../note-form-modal";
import styles from "./patient-notes.module.scss";

interface PatientNotesProps {
  patientId: number;
}

export function PatientNotes({ patientId }: PatientNotesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newOpen, setNewOpen] = useState(false);

  const patient = usePatient(patientId);
  const notes = usePatientNotes(patientId, { page: 1, page_size: 50 });

  const noteId = useMemo(() => {
    const raw = searchParams.get("note");
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const items = notes.data?.items ?? [];

  useEffect(() => {
    if (!noteId && items.length > 0) {
      const next = new URLSearchParams(searchParams.toString());
      next.set("note", String(items[0].id));
      router.replace(`/patients/${patientId}/notes?${next.toString()}`);
    }
  }, [noteId, items, patientId, router, searchParams]);

  const handleSelect = (id: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("note", String(id));
    router.replace(`/patients/${patientId}/notes?${next.toString()}`);
  };

  const handleCreated = (createdId: number) => {
    const next = new URLSearchParams();
    next.set("note", String(createdId));
    router.replace(`/patients/${patientId}/notes?${next.toString()}`);
  };

  return (
    <>
      <Card padded={false} className={styles.card}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <SectionHeader
                title="Clinical notes"
                subtitle={
                  notes.data
                    ? `${notes.data.total} ${notes.data.total === 1 ? "note" : "notes"}`
                    : "Loading..."
                }
                action={
                  <Button
                    variant="primary"
                    size="small"
                    icon={<Plus size={14} />}
                    onClick={() => setNewOpen(true)}
                  >
                    New
                  </Button>
                }
              />
            </div>

            <div className={styles.sidebarBody}>
              {notes.isLoading ? (
                <PageLoader label="Loading notes..." />
              ) : items.length === 0 ? (
                <EmptyState
                  title="No notes yet"
                  description="Create the first note for this patient."
                />
              ) : (
                <NotesList
                  notes={items}
                  selectedId={noteId}
                  onSelect={handleSelect}
                />
              )}
            </div>
          </aside>

          <section className={styles.main}>
            <NoteDetail noteId={noteId} patientId={patientId} />
          </section>
        </div>
      </Card>

      <NoteFormModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        patientId={patientId}
        defaultTherapistId={patient.data?.therapist_id}
        onSaved={handleCreated}
      />
    </>
  );
}
