"use client";

import { Card, EmptyState } from "@/components/ui";
import { ClipboardList } from "lucide-react";

export default function Page() {
  return (
    <Card>
      <EmptyState
        icon={<ClipboardList size={32} />}
        title="Clinical notes coming soon"
        description="This tab will be built next. The data is already available via the API."
      />
    </Card>
  );
}
