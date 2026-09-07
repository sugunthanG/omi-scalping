"use client";

import {
  Filter,
  ShieldCheck,
} from "lucide-react";

import OmiSessionIntelligence from "@/components/scientist/omi-session-intelligence";


export default function ScientistSessionFilterPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
              <Filter className="h-6 w-6 text-cyan-300" />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  SCIENTIST CONTROL
                </span>

                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300">
                  OMI BRAIN ADVISORY
                </span>
              </div>

              <h1 className="text-2xl font-semibold text-white">
                OMI Session Filter
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">
                View every OMI market session, inspect the active
                permission and exposure policy, apply authenticated
                Scientist overrides, and review OMI Brain
                recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />

            Original OMI session logic remains protected.
          </div>
        </div>
      </section>

      <OmiSessionIntelligence />
    </main>
  );
}
