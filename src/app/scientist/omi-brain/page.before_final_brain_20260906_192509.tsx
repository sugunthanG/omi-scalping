import {
  BrainCircuit,
} from "lucide-react";

import {
  RolePageGuard,
} from "@/components/auth/role-page-guard";

import {
  OmiBrainVisualizer,
} from "@/components/scientist/omi-brain-visualizer";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


import { OmiEmergencyControl } from "@/components/scientist/omi-emergency-control";

export default function OmiBrainPage() {
  return (
    <RolePageGuard
      allowedRoles={[
        "DEVELOPER",
      ]}
    >
      <div className="mx-auto max-w-[1800px]">

        <PageHeader
          eyebrow="Scientist intelligence laboratory"
          title="OMI Brain"
          description="Observe OMI intelligence, neural activity, decisions, learning outcomes and improvement without affecting trading latency."
          icon={BrainCircuit}
          actions={
            <>
              <StatusBadge tone="success">
                Pure OMI protected
              </StatusBadge>

              <StatusBadge tone="accent">
                Read-only telemetry
              </StatusBadge>
            </>
          }
        />


        <OmiEmergencyControl />

        <OmiBrainVisualizer />

      </div>
    </RolePageGuard>
  );
}
