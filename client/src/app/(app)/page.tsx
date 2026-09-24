"use client";

import { Card, PageHeader, StatusBadge } from "@/components/ui";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of today at the clinic."
      />

      <Card>
        <div className="space-y-3">
          <div className="text-sm text-slate-500">Status preview</div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="Active" />
            <StatusBadge status="Booked" />
            <StatusBadge status="Due" />
            <StatusBadge status="Paid" />
            <StatusBadge status="Sent" />
            <StatusBadge status="Cancelled" />
          </div>
        </div>
      </Card>
    </div>
  );
}
