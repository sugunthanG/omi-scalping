import {
  Activity,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";

import {
  LoginForm,
} from "@/components/auth/login-form";


export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,164,65,0.13),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(94,162,239,0.10),transparent_30%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] items-center gap-12 px-6 py-12 lg:grid-cols-[1fr_460px] lg:px-10">
        <section className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            OMI Trading AI
          </p>

          <h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-tight">
            Institutional intelligence for XAUUSD scalping.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--foreground-muted)]">
            Monitor OMI signals, MT5 positions, account performance,
            risk protection and AI diagnostics through one protected platform.
          </p>

          <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              {
                icon: BrainCircuit,
                title: "AI Intelligence",
                description:
                  "Live impulse and signal monitoring.",
              },
              {
                icon: ShieldCheck,
                title: "Risk Protection",
                description:
                  "Backend-enforced trading safeguards.",
              },
              {
                icon: Activity,
                title: "MT5 Monitoring",
                description:
                  "Account, positions and system state.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[var(--border)] bg-[rgba(8,13,21,0.65)] p-5 backdrop-blur"
                >
                  <Icon className="h-5 w-5 text-[var(--accent)]" />

                  <h3 className="mt-4 font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <LoginForm />
      </div>
    </main>
  );
}