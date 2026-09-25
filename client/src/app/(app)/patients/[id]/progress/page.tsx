"use client";

import { Card, EmptyState } from "@/components/ui";
import { LineChart } from "lucide-react";

export default function Page() {
  return (
    <Card>
      <EmptyState
        icon={<LineChart size={32} />}
        title="Progress tracking coming soon"
        description="This tab will be built next. The data is already available via the API."
      />
    </Card>
  );
}
