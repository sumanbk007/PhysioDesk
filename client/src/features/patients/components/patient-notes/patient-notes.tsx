"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Card, EmptyState, PageLoader, SectionHeader } from "@/components/ui";
import { usePatientNotes } from "../../queries";
import { NoteDetail } from "./note-detail";
import { NotesList } from "./notes-list";
import styles from "./patient-notes.module.scss";

interface PatientNotesProps {
  patientId: number;
}

export function PatientNotes({ patientId }: PatientNotesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const notes = usePatientNotes(patientId, { page: 1, page_size: 50 });

  const noteId = useMemo(() => {
    const raw = searchParams.get("note");
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const items = notes.data?.items ?? [];

  // Auto-select the first note on first load if nothing is selected.
  // This makes the two-column layout useful immediately.
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

  return (
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
                  disabled
                  title="Coming soon — creating notes is next"
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
                description="Notes will appear once sessions are recorded."
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
          <NoteDetail noteId={noteId} />
        </section>
      </div>
    </Card>
  );
}
