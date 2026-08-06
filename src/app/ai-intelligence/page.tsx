import {
  BrainCircuit,
} from "lucide-react";

import { AiIntelligenceDashboard } from "@/components/ai-intelligence/ai-intelligence-dashboard";
import { AiIntelligenceDiagnostics } from "@/components/ai-intelligence/ai-intelligence-diagnostics";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

export default function AiIntelligencePage() {
  return (
    <div className="mx-auto max-w-[1800px]">
      <PageHeader
        eyebrow="Impulse intelligence"
        title="AI Intelligence"
        description="Understand OMI’s latest impulse direction, confidence, trade quality, trend alignment and execution state."
        icon={BrainCircuit}
        actions={
          <>
            <StatusBadge tone="success">
              Impulse engine
            </StatusBadge>

            <StatusBadge tone="accent">
              XAUUSD M1
            </StatusBadge>
          </>
        }
      />

      <div className="space-y-6">
        <AiIntelligenceDashboard />

        <AiIntelligenceDiagnostics />
      </div>
    </div>
  );
}