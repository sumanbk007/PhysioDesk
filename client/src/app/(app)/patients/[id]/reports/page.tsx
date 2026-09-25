"use client";

import { Card, EmptyState } from "@/components/ui";
import { FileText } from "lucide-react";

export default function Page() {
  return (
    <Card>
      <EmptyState
        icon={<FileText size={32} />}
        title="Reports & documents coming soon"
        description="This tab will be built next. The data is already available via the API."
      />
    </Card>
  );
}
