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



      {/* =====================================================
          24/5 RESEARCH INTELLIGENCE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#080d16]">

        <div className="border-b border-slate-800 px-5 py-4">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-violet-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                  24/5 Research Intelligence
                </p>
              </div>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
                Every available raw OMI market decision can be observed in research mode,
                followed counterfactually, diagnosed, converted into improvement evidence,
                and evaluated by isolated neural candidates.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                {
                  brain?.intelligence
                    ?.raw_signal_research
                    ?.mode
                  ?? "24_5_RESEARCH"
                }
              </span>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                Champion Protected
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Authority OFF
              </span>

            </div>

          </div>

        </div>


        <div className="p-5">

          {/* LIVE FLOW */}

          <div className="overflow-x-auto pb-2">

            <div className="flex min-w-[1080px] items-stretch gap-2">

              {[
                {
                  title: "Live Market",
                  value:
                    brain?.connected
                      ? "CONNECTED"
                      : "WAITING",
                  detail:
                    brain?.direction
                    ?? "Awaiting cycle",
                },
                {
                  title: "Raw OMI Signal",
                  value:
                    brain?.intelligence
                      ?.raw_signal_research
                      ?.latest_direction
                    ?? brain?.direction
                    ?? "WAITING",
                  detail:
                    `${
                      brain?.intelligence
                        ?.raw_signal_research
                        ?.total_observations
                      ?? 0
                    } observations`,
                },
                {
                  title: "Counterfactual",
                  value:
                    `${
                      brain?.intelligence
                        ?.counterfactual_research
                        ?.pending
                      ?? 0
                    } ACTIVE`,
                  detail: "30-minute forward path",
                },
                {
                  title: "Outcome",
                  value:
                    `${
                      (
                        brain?.intelligence
                          ?.counterfactual_research
                          ?.outcomes?.tp_direct
                        ?? 0
                      )
                      +
                      (
                        brain?.intelligence
                          ?.counterfactual_research
                          ?.outcomes?.sl_then_tp
                        ?? 0
                      )
                      +
                      (
                        brain?.intelligence
                          ?.counterfactual_research
                          ?.outcomes?.sl_direct
                        ?? 0
                      )
                      +
                      (
                        brain?.intelligence
                          ?.counterfactual_research
                          ?.outcomes?.no_follow_through
                        ?? 0
                      )
                    } LABELED`,
                  detail: "Good / bad chronology",
                },
                {
                  title: "Failure Analysis",
                  value:
                    `${
                      brain?.intelligence
                        ?.failure_improvement
                        ?.total_diagnoses
                      ?? 0
                    } DIAGNOSES`,
                  detail:
                    `${
                      brain?.intelligence
                        ?.failure_improvement
                        ?.improvement_hypotheses
                      ?? 0
                    } improvements`,
                },
                {
                  title: "Neural Training",
                  value:
                    brain?.intelligence
                      ?.continuous_learning
                      ?.stage
                    ?? "COLLECTING",
                  detail:
                    `${
                      brain?.intelligence
                        ?.continuous_learning
                        ?.eligible_samples
                      ?? 0
                    } eligible`,
                },
                {
                  title: "Generation",
                  value:
                    `GEN ${
                      brain?.intelligence
                        ?.continuous_learning
                        ?.generation
                      ?? 0
                    }`,
                  detail:
                    brain?.intelligence
                      ?.continuous_learning
                      ?.candidate_decision
                    ?? "No validated candidate",
                },
                {
                  title: "Scientist",
                  value:
                    brain?.intelligence
                      ?.continuous_learning
                      ?.scientist_approval_required
                      ? "REVIEW"
                      : "WAITING",
                  detail: "Final authority",
                },
              ].map((node, index, nodes) => (

                <div
                  key={node.title}
                  className="flex flex-1 items-center"
                >

                  <div className="relative min-h-[122px] min-w-[120px] flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 p-4">

                    <div
                      className={`
                        absolute
                        left-0
                        top-0
                        h-[2px]
                        w-full
                        ${
                          brain?.connected
                            ? "animate-pulse bg-violet-400/70"
                            : "bg-slate-800"
                        }
                      `}
                    />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                      {node.title}
                    </p>

                    <p className="mt-4 break-words text-sm font-semibold text-white">
                      {node.value}
                    </p>

                    <p className="mt-2 text-[10px] leading-4 text-slate-600">
                      {node.detail}
                    </p>

                  </div>

                  {
                    index < nodes.length - 1
                      ? (
                        <div className="relative mx-1 h-px w-5 overflow-hidden bg-slate-800">

                          <div
                            className={`
                              absolute
                              inset-y-0
                              left-0
                              w-2
                              ${
                                brain?.connected
                                  ? "animate-pulse bg-violet-400"
                                  : "bg-slate-700"
                              }
                            `}
                          />

                        </div>
                      )
                      : null
                  }

                </div>

              ))}

            </div>

          </div>


          {/* CONTINUITY */}

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

              <p className="text-[10px] uppercase tracking-[0.13em] text-slate-600">
                Raw Observations
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {
                  brain?.intelligence
                    ?.raw_signal_research
                    ?.total_observations
                  ?? 0
                }
              </p>

              <p className="mt-2 text-xs text-slate-500">
                BUY {
                  brain?.intelligence
                    ?.raw_signal_research
                    ?.buy
                  ?? 0
                }
                {" · "}
                SELL {
                  brain?.intelligence
                    ?.raw_signal_research
                    ?.sell
                  ?? 0
                }
                {" · "}
                WAIT {
                  brain?.intelligence
                    ?.raw_signal_research
                    ?.wait
                  ?? 0
                }
              </p>

            </div>


            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

              <p className="text-[10px] uppercase tracking-[0.13em] text-slate-600">
                Market Continuity
              </p>

              <p
                className={`
                  mt-2
                  text-lg
                  font-semibold
                  ${
                    brain?.intelligence
                      ?.counterfactual_research
                      ?.continuity
                      ?.data_gap_detected
                      ? "text-amber-300"
                      : "text-emerald-400"
                  }
                `}
              >
                {
                  brain?.intelligence
                    ?.counterfactual_research
                    ?.continuity
                    ?.data_gap_detected
                    ? "DATA GAP / PAUSED"
                    : (
                        brain?.intelligence
                          ?.counterfactual_research
                          ?.continuity?.state
                        ?? "WAITING"
                      )
                }
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Gap threshold: {
                  brain?.intelligence
                    ?.counterfactual_research
                    ?.continuity
                    ?.gap_threshold_seconds
                  ?? 15
                } sec
              </p>

            </div>


            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

              <p className="text-[10px] uppercase tracking-[0.13em] text-slate-600">
                Training Evidence
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {
                  brain?.intelligence
                    ?.continuous_learning
                    ?.eligible_samples
                  ?? 0
                }
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Excluded {
                  brain?.intelligence
                    ?.continuous_learning
                    ?.excluded_samples
                  ?? 0
                }
              </p>

            </div>


            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

              <p className="text-[10px] uppercase tracking-[0.13em] text-slate-600">
                Neural Generation
              </p>

              <p className="mt-2 text-2xl font-semibold text-violet-300">
                GEN {
                  brain?.intelligence
                    ?.continuous_learning
                    ?.generation
                  ?? 0
                }
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {
                  brain?.intelligence
                    ?.continuous_learning
                    ?.candidate_status
                  ?? "Collecting evidence"
                }
              </p>

            </div>

          </div>


          {/* OUTCOME INTELLIGENCE */}

          <div className="mt-5 grid gap-4 xl:grid-cols-2">

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Counterfactual Outcome Intelligence
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">

                {[
                  [
                    "TP Direct",
                    brain?.intelligence
                      ?.counterfactual_research
                      ?.outcomes?.tp_direct
                    ?? 0,
                    "text-emerald-400",
                  ],
                  [
                    "SL → TP",
                    brain?.intelligence
                      ?.counterfactual_research
                      ?.outcomes?.sl_then_tp
                    ?? 0,
                    "text-amber-300",
                  ],
                  [
                    "SL Direct",
                    brain?.intelligence
                      ?.counterfactual_research
                      ?.outcomes?.sl_direct
                    ?? 0,
                    "text-red-400",
                  ],
                  [
                    "No Follow",
                    brain?.intelligence
                      ?.counterfactual_research
                      ?.outcomes
                      ?.no_follow_through
                    ?? 0,
                    "text-orange-300",
                  ],
                  [
                    "Unknown",
                    brain?.intelligence
                      ?.counterfactual_research
                      ?.outcomes
                      ?.chronology_unknown
                    ?? 0,
                    "text-slate-400",
                  ],
                ].map(([label, value, valueClass]) => (

                  <div
                    key={String(label)}
                    className="rounded-lg border border-slate-800 bg-slate-900/40 p-3"
                  >

                    <p className={`text-xl font-semibold ${String(valueClass)}`}>
                      {String(value)}
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-slate-600">
                      {String(label)}
                    </p>

                  </div>

                ))}

              </div>

            </div>


            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Failure → Improvement Intelligence
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">

                <div className="rounded-lg border border-red-500/10 bg-red-500/[0.03] p-3">
                  <p className="text-xl font-semibold text-red-400">
                    {
                      brain?.intelligence
                        ?.failure_improvement
                        ?.timing_failures
                      ?? 0
                    }
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-slate-600">
                    Timing failures
                  </p>
                </div>

                <div className="rounded-lg border border-violet-500/10 bg-violet-500/[0.03] p-3">
                  <p className="text-xl font-semibold text-violet-300">
                    {
                      brain?.intelligence
                        ?.failure_improvement
                        ?.improvement_hypotheses
                      ?? 0
                    }
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-slate-600">
                    Improvement ideas
                  </p>
                </div>

              </div>

              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/30 p-3">

                <p className="text-[10px] uppercase tracking-[0.1em] text-slate-600">
                  Latest research hypothesis
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-300">
                  {
                    brain?.intelligence
                      ?.failure_improvement
                      ?.latest_hypothesis
                    ?? "Waiting for sufficient failure evidence."
                  }
                </p>

              </div>

            </div>

          </div>


          {/* GOAL / GOVERNANCE */}

          <div className="mt-5 grid gap-4 lg:grid-cols-3">

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.03] p-5">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400">
                Research Goal
              </p>

              <p className="mt-3 text-3xl font-semibold text-white">
                {
                  brain?.intelligence
                    ?.continuous_learning
                    ?.research_goal_per_day
                  ?? 1500
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                opportunities / day
              </p>

            </div>


            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
                Aspirational Profitable Target
              </p>

              <p className="mt-3 text-3xl font-semibold text-white">
                {
                  brain?.intelligence
                    ?.continuous_learning
                    ?.profitable_target_per_day
                  ?? 1450
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                profitable / day — not claimed achieved
              </p>

            </div>


            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-300">
                Scientist Governance
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                {
                  brain?.intelligence
                    ?.continuous_learning
                    ?.validation_available
                    ? "VALIDATION AVAILABLE"
                    : "COLLECTING EVIDENCE"
                }
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Neural intelligence cannot enter the running execution agents automatically.
                Validated candidates remain isolated until Scientist review and approval.
              </p>

            </div>

          </div>


          <div className="mt-4 flex flex-wrap gap-2">

            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              Auto Promotion OFF
            </span>

            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              Execution Authority OFF
            </span>

            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              Chronology Guard ON
            </span>

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-400">
              Pure OMI Champion Protected
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          EXPERIENCE INTELLIGENCE
      ====================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-800
          bg-[#080d16]
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            border-b
            border-slate-800
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <BrainCircuit
                className="
                  h-4
                  w-4
                  text-sky-400
                "
              />

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-sky-400
                "
              >
                Experience Intelligence
              </p>
            </div>

            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-slate-400
              "
            >
              Completed OMI trade groups become durable
              experiences. Similar future setups can be
              researched without changing Pure OMI execution.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <span
              className="
                rounded-full
                border
                border-sky-500/20
                bg-sky-500/10
                px-3
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-sky-300
              "
            >
              {
                brain?.intelligence
                  ?.advisory?.mode
                ?? "SHADOW"
              }
            </span>

            <span
              className="
                rounded-full
                border
                border-slate-700
                bg-slate-900
                px-3
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-slate-400
              "
            >
              Authority{" "}
              {
                brain?.intelligence
                  ?.advisory?.authority
                  ? "ON"
                  : "OFF"
              }
            </span>
          </div>
        </div>


        <div
          className="
            grid
            lg:grid-cols-2
          "
        >
          {/* EXPERIENCE MEMORY */}

          <div
            className="
              border-b
              border-slate-800
              p-5
              lg:border-b-0
              lg:border-r
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Experience Memory
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  Real completed group outcomes
                </p>
              </div>

              <div className="text-right">
                <p
                  className="
                    text-3xl
                    font-semibold
                    text-white
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience?.total
                    ?? 0
                  }
                </p>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Total
                </p>
              </div>
            </div>


            <div
              className="
                mt-5
                grid
                grid-cols-3
                gap-3
              "
            >
              <div
                className="
                  rounded-xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/[0.04]
                  p-4
                "
              >
                <TrendingUp
                  className="
                    h-4
                    w-4
                    text-emerald-400
                  "
                />

                <p
                  className="
                    mt-3
                    text-2xl
                    font-semibold
                    text-emerald-400
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience?.good
                    ?? good
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Good
                </p>
              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/[0.04]
                  p-4
                "
              >
                <TrendingDown
                  className="
                    h-4
                    w-4
                    text-red-400
                  "
                />

                <p
                  className="
                    mt-3
                    text-2xl
                    font-semibold
                    text-red-400
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience?.bad
                    ?? bad
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Bad
                </p>
              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900/40
                  p-4
                "
              >
                <CircleDot
                  className="
                    h-4
                    w-4
                    text-slate-400
                  "
                />

                <p
                  className="
                    mt-3
                    text-2xl
                    font-semibold
                    text-slate-300
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience?.neutral
                    ?? 0
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Neutral
                </p>
              </div>
            </div>


            <div
              className="
                mt-4
                rounded-xl
                border
                border-slate-800
                bg-slate-950/60
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Current memory advice
                </span>

                <span
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    text-amber-300
                  "
                >
                  {
                    brain?.intelligence
                      ?.advisory?.current
                    ?? "NEUTRAL"
                  }
                </span>
              </div>

              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Latest outcome
                </span>

                <span
                  className="
                    text-xs
                    font-medium
                    text-slate-300
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience
                      ?.latest_outcome
                    ?? "NONE"
                  }
                </span>
              </div>
            </div>
          </div>


          {/* NEURAL CANDIDATE */}

          <div className="p-5">
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Cpu
                    className="
                      h-4
                      w-4
                      text-amber-400
                    "
                  />

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-slate-400
                    "
                  >
                    Neural Candidate
                  </p>
                </div>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  Research candidate remains isolated
                  from live execution until governed
                  validation succeeds.
                </p>
              </div>

              <span
                className="
                  rounded-full
                  border
                  border-amber-500/20
                  bg-amber-500/10
                  px-3
                  py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-amber-300
                "
              >
                {
                  brain?.intelligence
                    ?.neural?.stage
                  ?? "OBSERVING"
                }
              </span>
            </div>


            <div className="mt-5">
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  text-xs
                "
              >
                <span className="text-slate-500">
                  Research experiences
                </span>

                <span
                  className="
                    font-semibold
                    text-slate-300
                  "
                >
                  {
                    brain?.intelligence
                      ?.neural
                      ?.usable_experiences
                    ?? 0
                  }
                  {" / "}
                  {
                    brain?.intelligence
                      ?.neural
                      ?.minimum_research_experiences
                    ?? 200
                  }
                </span>
              </div>


              <div
                className="
                  mt-2
                  h-2
                  overflow-hidden
                  rounded-full
                  bg-slate-800
                "
              >
                <div
                  className="
                    h-full
                    rounded-full
                    bg-sky-500
                    transition-[width]
                    duration-500
                  "
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (
                          (
                            brain?.intelligence
                              ?.neural
                              ?.usable_experiences
                            ?? 0
                          )
                          /
                          Math.max(
                            1,
                            brain?.intelligence
                              ?.neural
                              ?.minimum_research_experiences
                            ?? 200,
                          )
                        ) * 100,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>


            <div
              className="
                mt-5
                divide-y
                divide-slate-800
                rounded-xl
                border
                border-slate-800
                bg-slate-950/50
                px-4
              "
            >
              <StateRow
                icon={Activity}
                label="Dataset"
                value={
                  brain?.intelligence
                    ?.neural?.data_ready
                    ? "READY"
                    : "COLLECTING"
                }
              />

              <div className="py-3">
                <StateRow
                  icon={BrainCircuit}
                  label="Candidate"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.candidate_created
                      ? "CREATED"
                      : "NONE"
                  }
                />
              </div>

              <div className="py-3">
                <StateRow
                  icon={Cpu}
                  label="Model"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.model_trained
                      ? "TRAINED"
                      : "NOT TRAINED"
                  }
                />
              </div>

              <div className="py-3">
                <StateRow
                  icon={ShieldCheck}
                  label="Execution authority"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.execution_authority
                      ? "ACTIVE"
                      : "OFF"
                  }
                />
              </div>

              <div className="py-3">
                <StateRow
                  icon={Radio}
                  label="Auto promotion"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.automatic_promotion
                      ? "ON"
                      : "OFF"
                  }
                />
              </div>

              <div className="py-3">
                <StateRow
                  icon={ShieldCheck}
                  label="Pure OMI champion"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.pure_omi_champion_protected
                      ? "PROTECTED"
                      : "CHECK"
                  }
                  valueClass={
                    brain?.intelligence
                      ?.neural
                      ?.pure_omi_champion_protected
                      ? "text-emerald-400"
                      : "text-amber-300"
                  }
                />
              </div>
            </div>


            <p
              className="
                mt-4
                text-xs
                leading-5
                text-slate-600
              "
            >
              No candidate improvement is claimed
              until chronological validation produces
              a verified result.
            </p>
          </div>
        </div>
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
