"use client";

import { Star } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { ClinicalNoteListItem } from "../../types";
import styles from "./notes-list.module.scss";

interface NotesListProps {
  notes: ClinicalNoteListItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function NotesList({ notes, selectedId, onSelect }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes yet"
        description="Treatment notes will appear here once they're recorded."
      />
    );
  }

  return (
    <ul className={styles.list}>
      {notes.map((note) => {
        const isActive = note.id === selectedId;
        return (
          <li key={note.id}>
            <button
              type="button"
              onClick={() => onSelect(note.id)}
              className={`${styles.item} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "true" : undefined}
            >
              <span className={styles.date}>
                {formatDate(note.note_date, "short")}
              </span>
              <span className={styles.meta}>
                {note.pain_score !== null && (
                  <span className={styles.pain}>Pain {note.pain_score}</span>
                )}
                {note.milestone && (
                  <Star
                    size={12}
                    className={styles.milestone}
                    aria-label="Milestone"
                  />
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
