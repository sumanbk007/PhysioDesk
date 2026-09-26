"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  PageLoader,
  SectionHeader,
} from "@/components/ui";
import { usePatientReports } from "../../queries";
import { ReportCard } from "./report-card";
import { ReportUploadModal } from "./report-upload-modal";
import styles from "./patient-reports.module.scss";

interface PatientReportsProps {
  patientId: number;
}

export function PatientReports({ patientId }: PatientReportsProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const reports = usePatientReports(patientId);

  return (
    <>
      <Card className={styles.card}>
        <SectionHeader
          title="Reports & documents"
          subtitle={
            reports.data
              ? `${reports.data.length} ${reports.data.length === 1 ? "file" : "files"}`
              : "Loading..."
          }
          action={
            <Button
              variant="primary"
              size="small"
              icon={<Plus size={14} />}
              onClick={() => setUploadOpen(true)}
            >
              Upload
            </Button>
          }
        />

        {reports.isLoading ? (
          <PageLoader label="Loading reports..." />
        ) : !reports.data || reports.data.length === 0 ? (
          <div className={styles.emptyWrap}>
            <EmptyState
              icon={<FileText size={32} />}
              title="No reports yet"
              description="Upload X-rays, MRIs, or assessment PDFs to keep them with the patient's record."
              action={
                <Button
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={() => setUploadOpen(true)}
                >
                  Upload first report
                </Button>
              }
            />
          </div>
        ) : (
          <div className={styles.grid}>
            {reports.data.map((r) => (
              <ReportCard key={r.id} patientId={patientId} report={r} />
            ))}
          </div>
        )}
      </Card>

      <ReportUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        patientId={patientId}
      />
    </>
  );
}
