"use client";

import { Card, EmptyState } from "@/components/ui";
import { Receipt } from "lucide-react";

export default function Page() {
  return (
    <Card>
      <EmptyState
        icon={<Receipt size={32} />}
        title="Billing & payments coming soon"
        description="This tab will be built next. The data is already available via the API."
      />
    </Card>
  );
}
