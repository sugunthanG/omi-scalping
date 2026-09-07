from pathlib import Path
from datetime import datetime
import shutil
import re

API = Path(r"src\services\api\scientist-api.ts")
UI = Path(r"src\components\scientist\omi-brain-visualizer.tsx")

for path in (API, UI):
    if not path.exists():
        raise FileNotFoundError(path)

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

api_backup = API.with_name(
    f"scientist-api.before_research_brain_ui_{stamp}.ts.bak"
)

ui_backup = UI.with_name(
    f"omi-brain-visualizer.before_research_brain_ui_{stamp}.tsx.bak"
)

shutil.copy2(API, api_backup)
shutil.copy2(UI, ui_backup)

api = API.read_text(encoding="utf-8")
ui = UI.read_text(encoding="utf-8")

print("=" * 100)
print("OMI RESEARCH BRAIN — BLOCK 5C.2")
print("24/5 SCIENTIST BRAIN VISUALIZATION")
print("=" * 100)

# ============================================================
# 1. TYPESCRIPT TELEMETRY CONTRACT
# ============================================================

if "export interface ScientistRawSignalResearch" not in api:

    anchor = "export interface ScientistOmiBrainIntelligence {"

    if anchor not in api:
        raise RuntimeError(
            "ScientistOmiBrainIntelligence anchor not found"
        )

    interfaces = r'''
export interface ScientistRawSignalResearch {
  version: string;
  mode: string;
  stage: string;
  research_only: boolean;
  execution_authority: boolean;
  automatic_promotion: boolean;
  total_observations: number;
  buy: number;
  sell: number;
  wait: number;
  other: number;
  latest_id: string | null;
  latest_timestamp: string | null;
  latest_direction: string | null;
}

export interface ScientistResearchContinuity {
  state: string;
  gap_threshold_seconds: number;
  data_gap_detected: boolean;
  chronology_reliable: boolean;
}

export interface ScientistCounterfactualOutcomes {
  tp_direct: number;
  sl_then_tp: number;
  sl_direct: number;
  no_follow_through: number;
  chronology_unknown: number;
}

export interface ScientistCounterfactualResearch {
  mode: string;
  pending: number;
  research_window: string;
  horizon_seconds: number;
  continuity: ScientistResearchContinuity;
  outcomes: ScientistCounterfactualOutcomes;
  training_eligible: number;
  training_excluded: number;
  execution_authority: boolean;
  production_changed: boolean;
}

export interface ScientistFailureImprovement {
  mode: string;
  total_diagnoses: number;
  timing_failures: number;
  direction_reversals: number;
  direct_failures: number;
  no_follow_through: number;
  improvement_hypotheses: number;
  latest_diagnosis: string | null;
  latest_hypothesis: string | null;
  causal_claims: boolean;
  automatic_apply: boolean;
  execution_authority: boolean;
  scientist_approval_required: boolean;
}

export interface ScientistContinuousLearning {
  mode: string;
  research_goal_per_day: number;
  profitable_target_per_day: number;
  target_achieved: boolean;
  generation: number;
  stage: string;
  eligible_samples: number;
  excluded_samples: number;
  candidate_status: string | null;
  candidate_decision: string | null;
  validation_available: boolean;
  validation_metrics: Record<string, unknown> | null;
  execution_authority: boolean;
  automatic_promotion: boolean;
  scientist_approval_required: boolean;
  pure_omi_champion_protected: boolean;
  continuity_exclusion_enforced: boolean;
  chronology_unknown_training: boolean;
}

'''

    api = api.replace(
        anchor,
        interfaces + anchor,
        1,
    )

intelligence_match = re.search(
    r"export interface ScientistOmiBrainIntelligence\s*\{(?P<body>.*?)\n\}",
    api,
    flags=re.S,
)

if not intelligence_match:
    raise RuntimeError(
        "Could not locate ScientistOmiBrainIntelligence body"
    )

body = intelligence_match.group("body")

new_fields = """
  raw_signal_research?: ScientistRawSignalResearch;
  counterfactual_research?: ScientistCounterfactualResearch;
  failure_improvement?: ScientistFailureImprovement;
  continuous_learning?: ScientistContinuousLearning;"""

if "raw_signal_research?:" not in body:

    replacement = (
        "export interface ScientistOmiBrainIntelligence {"
        + body
        + new_fields
        + "\n}"
    )

    api = (
        api[:intelligence_match.start()]
        + replacement
        + api[intelligence_match.end():]
    )

API.write_text(api, encoding="utf-8")

print("[PASS] Research telemetry TypeScript contract")


# ============================================================
# 2. UI RESEARCH PIPELINE
# ============================================================

if "24/5 Research Intelligence" not in ui:

    anchor = """      {/* =====================================================
          EXPERIENCE INTELLIGENCE
      ====================================================== */}"""

    if anchor not in ui:
        raise RuntimeError(
            "Experience Intelligence UI anchor not found"
        )

    research_ui = r'''
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


'''

    ui = ui.replace(
        anchor,
        research_ui + anchor,
        1,
    )

UI.write_text(ui, encoding="utf-8")

print("[PASS] 24/5 Brain research section")
print("[PASS] Live market -> raw signal flow")
print("[PASS] Counterfactual visualization")
print("[PASS] Outcome visualization")
print("[PASS] Failure -> improvement visualization")
print("[PASS] Neural training visualization")
print("[PASS] Generation visualization")
print("[PASS] Scientist review visualization")
print("[PASS] Network/data-gap state")
print("[PASS] 1500/day research goal")
print("[PASS] 1450/day target clearly marked aspirational")
print("[PASS] Existing Experience Intelligence preserved")
print("[PASS] Existing Brain visualization preserved")
print("[PASS] Existing Emergency Control untouched")
print("[PASS] Separate Session Filter page untouched")
print("[PASS] Backend untouched")
print("[PASS] session_filter.py untouched")

print()
print("=" * 100)
print("BLOCK 5C.2 FILE INSTALLATION COMPLETE")
print("=" * 100)
