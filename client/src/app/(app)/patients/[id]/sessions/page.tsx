"use client";

import { Card, EmptyState } from "@/components/ui";
import { Calendar } from "lucide-react";

export default function Page() {
  return (
    <Card>
      <EmptyState
        icon={<Calendar size={32} />}
        title="Session history coming soon"
        description="This tab will be built next. The data is already available via the API."
      />
    </Card>
  );
}
