"use client";

import {
  useMemo,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Activity,
  BrainCircuit,
  CircleDot,
  Clock3,
  Cpu,
  Radio,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  WifiOff,
} from "lucide-react";

import {
  fetchScientistOmiBrain,
} from "@/services/api/scientist-api";


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


const outputLabels = [
  "BUY",
  "SELL",
  "WAIT",
];


function normalizeDecision(
  direction: string | null | undefined,
  decision: string | null | undefined,
) {
  const values = [
    direction,
    decision,
  ];

  for (const value of values) {

    const normalized =
      value
        ?.toString()
        .trim()
        .toUpperCase();

    if (
      normalized === "BUY"
      || normalized === "SELL"
      || normalized === "WAIT"
    ) {
      return normalized;
    }
  }

  return null;
}


function formatConfidence(
  value: number | string | null | undefined,
) {
  if (
    value === null
    || value === undefined
    || value === ""
  ) {
    return "—";
  }

  const numeric =
    Number(value);

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  if (
    numeric >= 0
    && numeric <= 1
  ) {
    return `${(numeric * 100).toFixed(1)}%`;
  }

  return numeric.toFixed(2);
}


function formatCycleTime(
  seconds: number | null | undefined,
) {
  if (
    seconds === null
    || seconds === undefined
    || !Number.isFinite(seconds)
  ) {
    return "—";
  }

  if (seconds < 1) {
    return `${Math.round(seconds * 1000)} ms`;
  }

  return `${seconds.toFixed(3)} s`;
}


function NetworkLines({
  from,
  to,
  active,
}: {
  from: BrainNode[];
  to: BrainNode[];
  active: boolean;
}) {
  return (
    <>
      {from.flatMap(
        (source, sourceIndex) =>
          to.map(
            (target, targetIndex) => (
              <line
                key={`${sourceIndex}-${targetIndex}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="currentColor"
                strokeWidth={
                  active
                    ? "1.35"
                    : "1"
                }
                strokeDasharray={
                  active
                    ? "7 10"
                    : undefined
                }
                className={
                  active
                    ? "text-amber-400/45 animate-pulse"
                    : "text-slate-700/60"
                }
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
  selected = false,
  selectedTone = "neutral",
}: {
  node: BrainNode;
  active?: boolean;
  selected?: boolean;
  selectedTone?:
    | "buy"
    | "sell"
    | "wait"
    | "neutral";
}) {

  let outerClass =
    "fill-slate-950 stroke-slate-600";

  let innerClass =
    "fill-slate-600";

  if (active) {
    outerClass =
      "fill-amber-400/15 stroke-amber-400";

    innerClass =
      "fill-amber-400 animate-pulse";
  }

  if (selected) {

    if (selectedTone === "buy") {
      outerClass =
        "fill-emerald-400/15 stroke-emerald-400";

      innerClass =
        "fill-emerald-400 animate-pulse";
    }

    else if (selectedTone === "sell") {
      outerClass =
        "fill-red-400/15 stroke-red-400";

      innerClass =
        "fill-red-400 animate-pulse";
    }

    else {
      outerClass =
        "fill-amber-400/15 stroke-amber-400";

      innerClass =
        "fill-amber-400 animate-pulse";
    }
  }

  return (
    <g>
      <circle
        cx={node.x}
        cy={node.y}
        r="17"
        className={outerClass}
        strokeWidth="2"
      />

      <circle
        cx={node.x}
        cy={node.y}
        r="5"
        className={innerClass}
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

  const query =
    useQuery({
      queryKey: [
        "scientist",
        "omi-brain",
      ],

      queryFn:
        fetchScientistOmiBrain,

      refetchInterval:
        1_000,

      refetchIntervalInBackground:
        false,

      staleTime:
        750,

      retry:
        1,
    });


  const brain =
    query.data;


  const telemetryAgeMs =
    useMemo(
      () => {

        if (!brain?.timestamp) {
          return null;
        }

        const timestamp =
          Date.parse(
            brain.timestamp
          );

        if (
          Number.isNaN(
            timestamp
          )
        ) {
          return null;
        }

        return Math.max(
          0,
          Date.now()
          - timestamp,
        );
      },
      [
        brain?.timestamp,
        query.dataUpdatedAt,
      ],
    );


  const stale =
    telemetryAgeMs !== null
    && telemetryAgeMs > 15_000;


  const connected =
    Boolean(
      brain?.connected
    )
    && !query.isError;


  const live =
    connected
    && !stale
    && brain?.brain_status
      ?.toUpperCase()
      === "ACTIVE";


  const decision =
    normalizeDecision(
      brain?.direction,
      brain?.decision,
    );


  const quality =
    brain?.quality
      ? String(
          brain.quality
        ).toUpperCase()
      : "—";


  const status =
    query.isLoading
      ? "CONNECTING"
      : query.isError
        ? "UNAVAILABLE"
        : stale
          ? "STALE"
          : brain?.brain_status
              ?.toUpperCase()
            || "WAITING";


  const statusSubtitle =
    query.isError
      ? "Unable to read secured telemetry"
      : stale
        ? "No recent OMI cycle received"
        : connected
          ? "Secured OMI telemetry connected"
          : "Waiting for OMI runtime telemetry";


  const telemetryLabel =
    query.isError
      ? "Telemetry unavailable"
      : stale
        ? "Telemetry stale"
        : live
          ? "Live telemetry"
          : connected
            ? "Telemetry connected"
            : "Telemetry waiting";


  const good =
    brain?.learning?.good
    ?? 0;


  const bad =
    brain?.learning?.bad
    ?? 0;


  const improvement =
    brain?.learning
      ?.improvement_percent;


  return (
    <div className="space-y-6">

      <section className="grid gap-4 lg:grid-cols-4">

        <MetricCard
          title="Brain Status"
          value={status}
          subtitle={statusSubtitle}
        />

        <MetricCard
          title="Latest Decision"
          value={
            decision
            ?? "—"
          }
          subtitle={
            quality !== "—"
              ? `Quality: ${quality}`
              : "BUY / SELL / WAIT"
          }
          tone={
            decision === "BUY"
              ? "good"
              : decision === "SELL"
                ? "bad"
                : "neutral"
          }
        />

        <MetricCard
          title="Good Learning"
          value={String(good)}
          subtitle="Verified good outcomes"
          tone="good"
        />

        <MetricCard
          title="Bad Learning"
          value={String(bad)}
          subtitle="Verified bad outcomes"
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
              Read-only visualization of real OMI runtime intelligence
            </p>

          </div>


          <div
            className={
              live
                ? "flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300"
                : query.isError
                  ? "flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300"
                  : "flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300"
            }
          >

            {
              query.isError
                ? (
                  <WifiOff className="h-3.5 w-3.5" />
                )
                : (
                  <CircleDot
                    className={
                      live
                        ? "h-3.5 w-3.5 animate-pulse"
                        : "h-3.5 w-3.5"
                    }
                  />
                )
            }

            {telemetryLabel}

          </div>

        </div>


        <div className="grid min-w-0 2xl:grid-cols-[minmax(0,1fr)_320px]">

          <div className="min-w-0 overflow-hidden p-4 sm:p-5">

            <div className="mx-auto w-full max-w-[920px]">

              <div className="mb-3 grid grid-cols-4 gap-2 px-2 text-center text-[10px] uppercase tracking-[0.14em] text-slate-500 sm:px-6 sm:text-xs sm:tracking-[0.18em]">
                <span>Market Input</span>
                <span>Feature Layer</span>
                <span>Intelligence</span>
                <span>Decision</span>
              </div>


              <svg
                viewBox="0 0 820 430"
                preserveAspectRatio="xMidYMid meet"
                className="block h-auto w-full max-w-full"
              >

                <NetworkLines
                  from={inputNodes}
                  to={hiddenOne}
                  active={live}
                />

                <NetworkLines
                  from={hiddenOne}
                  to={hiddenTwo}
                  active={live}
                />

                <NetworkLines
                  from={hiddenTwo}
                  to={outputNodes}
                  active={live}
                />


                {inputNodes.map(
                  (node, index) => (
                    <NetworkNode
                      key={`input-${index}`}
                      node={node}
                      active={live}
                    />
                  ),
                )}


                {hiddenOne.map(
                  (node, index) => (
                    <NetworkNode
                      key={`hidden-1-${index}`}
                      node={node}
                      active={live}
                    />
                  ),
                )}


                {hiddenTwo.map(
                  (node, index) => (
                    <NetworkNode
                      key={`hidden-2-${index}`}
                      node={node}
                      active={live}
                    />
                  ),
                )}


                {outputNodes.map(
                  (node, index) => {

                    const label =
                      outputLabels[
                        index
                      ];

                    const selected =
                      decision === label;

                    return (
                      <g
                        key={`output-${index}`}
                      >

                        <NetworkNode
                          node={node}
                          active={
                            live
                            && !decision
                          }
                          selected={selected}
                          selectedTone={
                            label === "BUY"
                              ? "buy"
                              : label === "SELL"
                                ? "sell"
                                : "wait"
                          }
                        />

                        <text
                          x={755}
                          y={
                            node.y + 4
                          }
                          className={
                            selected
                              ? (
                                label === "BUY"
                                  ? "fill-emerald-400 text-[12px] font-semibold"
                                  : label === "SELL"
                                    ? "fill-red-400 text-[12px] font-semibold"
                                    : "fill-amber-400 text-[12px] font-semibold"
                              )
                              : "fill-slate-600 text-[12px]"
                          }
                        >
                          {label}
                        </text>

                      </g>
                    );
                  },
                )}


                <text
                  x="35"
                  y="405"
                  className="fill-slate-500 text-[12px]"
                >
                  M1 • M5 • M15 • H1 • H4
                </text>

              </svg>

            </div>

          </div>


          <aside className="min-w-0 border-t border-slate-800 p-5 2xl:border-l 2xl:border-t-0">

            <h3 className="text-sm font-semibold text-white">
              Live Brain State
            </h3>


            <div className="mt-5 space-y-4">

              <StateRow
                icon={Radio}
                label="Input stream"
                value={
                  live
                    ? "Receiving"
                    : connected
                      ? "Waiting"
                      : "Offline"
                }
                valueClass={
                  live
                    ? "text-emerald-400"
                    : "text-slate-300"
                }
              />

              <StateRow
                icon={Cpu}
                label="Inference"
                value={
                  live
                    ? "Active"
                    : "Idle"
                }
              />

              <StateRow
                icon={Activity}
                label="Decision"
                value={
                  decision
                  ?? "—"
                }
              />

              <StateRow
                icon={ShieldCheck}
                label="Quality"
                value={quality}
              />

              <StateRow
                icon={Activity}
                label="Confidence"
                value={
                  formatConfidence(
                    brain?.confidence
                  )
                }
              />

              <StateRow
                icon={Clock3}
                label="Cycle time"
                value={
                  formatCycleTime(
                    brain?.cycle_time_seconds
                  )
                }
              />

              <StateRow
                icon={TrendingUp}
                label="Good outcomes"
                value={String(good)}
                valueClass="text-emerald-400"
              />

              <StateRow
                icon={TrendingDown}
                label="Bad outcomes"
                value={String(bad)}
                valueClass="text-red-400"
              />

            </div>


            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">

              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Learning Improvement
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">

                {
                  improvement === null
                  || improvement === undefined
                    ? "—"
                    : `${improvement.toFixed(2)}%`
                }

              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Candidate improvement will appear only after validated OMI learning results exist.
              </p>

            </div>


            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">

              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Runtime Message
              </p>

              <p className="mt-2 break-words text-sm leading-5 text-slate-300">
                {
                  brain?.message
                  ?? "No runtime message."
                }
              </p>

              <p className="mt-3 text-xs text-slate-600">
                {
                  brain?.timestamp
                    ? `Last cycle: ${new Date(brain.timestamp).toLocaleString()}`
                    : "No OMI cycle received yet."
                }
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

            {
              good > 0
                ? `${good} verified good learning outcome${good === 1 ? "" : "s"} recorded.`
                : "No verified good learning outcomes have been published yet."
            }

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

            {
              bad > 0
                ? `${bad} verified bad learning outcome${bad === 1 ? "" : "s"} recorded for research.`
                : "No verified bad learning outcomes have been published yet."
            }

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
  icon: typeof Activity;
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
        className={`max-w-[150px] truncate text-right text-sm font-medium ${valueClass}`}
        title={value}
      >
        {value}
      </span>

    </div>
  );
}
