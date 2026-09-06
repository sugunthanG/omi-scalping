"use client";

import {
  Activity,
  BrainCircuit,
  CircleDot,
  Cpu,
  TrendingDown,
  TrendingUp,
} from "lucide-react";


interface BrainNode {
  x: number;
  y: number;
}


const inputNodes: BrainNode[] = [
  { x: 90, y: 80 },
  { x: 90, y: 150 },
  { x: 90, y: 220 },
  { x: 90, y: 290 },
  { x: 90, y: 360 },
];


const hiddenOne: BrainNode[] = [
  { x: 300, y: 65 },
  { x: 300, y: 125 },
  { x: 300, y: 185 },
  { x: 300, y: 245 },
  { x: 300, y: 305 },
  { x: 300, y: 365 },
];


const hiddenTwo: BrainNode[] = [
  { x: 510, y: 95 },
  { x: 510, y: 175 },
  { x: 510, y: 255 },
  { x: 510, y: 335 },
];


const outputNodes: BrainNode[] = [
  { x: 720, y: 135 },
  { x: 720, y: 225 },
  { x: 720, y: 315 },
];


function NetworkLines({
  from,
  to,
}: {
  from: BrainNode[];
  to: BrainNode[];
}) {
  return (
    <>
      {from.flatMap(
        (source, sourceIndex) =>
          to.map(
            (target, targetIndex) => (
              <line
                key={
                  `${sourceIndex}-${targetIndex}`
                }
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-700/60"
              />
            ),
          ),
      )}
    </>
  );
}


function NetworkNode({
  node,
  active = false,
}: {
  node: BrainNode;
  active?: boolean;
}) {
  return (
    <g>
      <circle
        cx={node.x}
        cy={node.y}
        r="17"
        className={
          active
            ? "fill-amber-400/20 stroke-amber-400"
            : "fill-slate-950 stroke-slate-600"
        }
        strokeWidth="2"
      />

      <circle
        cx={node.x}
        cy={node.y}
        r="5"
        className={
          active
            ? "fill-amber-400 animate-pulse"
            : "fill-slate-600"
        }
      />
    </g>
  );
}


function MetricCard({
  title,
  value,
  subtitle,
  tone = "neutral",
}: {
  title: string;
  value: string;
  subtitle: string;
  tone?:
    | "neutral"
    | "good"
    | "bad";
}) {
  const valueClass =
    tone === "good"
      ? "text-emerald-400"
      : tone === "bad"
        ? "text-red-400"
        : "text-white";

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-xl font-semibold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {subtitle}
      </p>
    </article>
  );
}


export function OmiBrainVisualizer() {
  return (
    <div className="space-y-6">

      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          title="Brain Status"
          value="Waiting"
          subtitle="Live telemetry not connected yet"
        />

        <MetricCard
          title="Latest Decision"
          value="—"
          subtitle="BUY / SELL / WAIT"
        />

        <MetricCard
          title="Good Learning"
          value="0"
          subtitle="Profitable / correct outcomes"
          tone="good"
        />

        <MetricCard
          title="Bad Learning"
          value="0"
          subtitle="Loss / adverse outcomes"
          tone="bad"
        />
      </section>


      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-[#070b12]">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-6 py-5">

          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-amber-400" />

              <h2 className="font-semibold text-white">
                OMI Neural Intelligence
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Real-time inference visualization
            </p>
          </div>


          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
            <CircleDot className="h-3.5 w-3.5" />
            Telemetry pending
          </div>

        </div>


        <div className="grid xl:grid-cols-[1fr_300px]">

          <div className="overflow-x-auto p-5">

            <div className="min-w-[820px]">

              <div className="mb-3 grid grid-cols-4 px-8 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>Market Input</span>
                <span>Feature Layer</span>
                <span>Intelligence</span>
                <span>Decision</span>
              </div>


              <svg
                viewBox="0 0 820 430"
                className="h-auto w-full"
              >

                <NetworkLines
                  from={inputNodes}
                  to={hiddenOne}
                />

                <NetworkLines
                  from={hiddenOne}
                  to={hiddenTwo}
                />

                <NetworkLines
                  from={hiddenTwo}
                  to={outputNodes}
                />


                {inputNodes.map(
                  (node, index) => (
                    <NetworkNode
                      key={`input-${index}`}
                      node={node}
                    />
                  ),
                )}

                {hiddenOne.map(
                  (node, index) => (
                    <NetworkNode
                      key={`hidden-1-${index}`}
                      node={node}
                    />
                  ),
                )}

                {hiddenTwo.map(
                  (node, index) => (
                    <NetworkNode
                      key={`hidden-2-${index}`}
                      node={node}
                    />
                  ),
                )}

                {outputNodes.map(
                  (node, index) => (
                    <NetworkNode
                      key={`output-${index}`}
                      node={node}
                    />
                  ),
                )}


                <text
                  x="35"
                  y="405"
                  className="fill-slate-500 text-[12px]"
                >
                  M1 • M5 • M15 • H1 • H4
                </text>

                <text
                  x="660"
                  y="405"
                  className="fill-slate-500 text-[12px]"
                >
                  BUY • SELL • WAIT
                </text>

              </svg>

            </div>

          </div>


          <aside className="border-t border-slate-800 p-5 xl:border-l xl:border-t-0">

            <h3 className="text-sm font-semibold text-white">
              Live Brain State
            </h3>


            <div className="mt-5 space-y-4">

              <StateRow
                icon={Activity}
                label="Input stream"
                value="Waiting"
              />

              <StateRow
                icon={Cpu}
                label="Inference"
                value="Idle"
              />

              <StateRow
                icon={TrendingUp}
                label="Good outcome"
                value="—"
                valueClass="text-emerald-400"
              />

              <StateRow
                icon={TrendingDown}
                label="Bad outcome"
                value="—"
                valueClass="text-red-400"
              />

            </div>


            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">

              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Learning Improvement
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                —
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Will compare candidate intelligence against the protected Pure OMI champion.
              </p>

            </div>

          </aside>

        </div>

      </section>


      <section className="grid gap-4 md:grid-cols-2">

        <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="h-5 w-5" />

            <h3 className="font-semibold">
              Good Learning
            </h3>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Correct or profitable outcomes will appear here in green after real OMI telemetry is connected.
          </p>
        </article>


        <article className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5">
          <div className="flex items-center gap-2 text-red-400">
            <TrendingDown className="h-5 w-5" />

            <h3 className="font-semibold">
              Bad Learning
            </h3>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Incorrect or losing outcomes will appear here in red and remain visible for research.
          </p>
        </article>

      </section>

    </div>
  );
}


function StateRow({
  icon: Icon,
  label,
  value,
  valueClass = "text-slate-300",
}: {
  icon:
    typeof Activity;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />

        <span className="text-sm">
          {label}
        </span>
      </div>

      <span
        className={`text-sm font-medium ${valueClass}`}
      >
        {value}
      </span>

    </div>
  );
}
