"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import {
  fetchScientistNeuralSessionAdvisor,
  fetchScientistSessionPolicy,
  fetchScientistSessionPolicyAudit,
  fetchScientistSessionPolicyStatus,
  resetScientistSessionPolicy,
  updateScientistSessionPolicy,
} from "@/services/api/scientist-session-policy-api";

type AnyRecord = Record<string, any>;

const SESSION_ORDER = [
  "ASIAN",
  "ASIAN_LONDON_OVERLAP",
  "LONDON",
  "LONDON_NEWYORK_OVERLAP",
  "NEWYORK",
];

const QUALITIES = [
  "GOOD",
  "STRONG",
  "ELITE",
];

function unwrap(value: any): any {
  if (
    value &&
    typeof value === "object" &&
    "data" in value
  ) {
    return value.data;
  }

  return value;
}

function firstValue(
  source: AnyRecord | null | undefined,
  keys: string[],
  fallback: any = undefined,
) {
  if (!source) {
    return fallback;
  }

  for (const key of keys) {
    if (
      source[key] !== undefined &&
      source[key] !== null
    ) {
      return source[key];
    }
  }

  return fallback;
}

function displaySession(value: unknown) {
  return String(value ?? "UNKNOWN")
    .replaceAll("_", " ");
}

function displayValue(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "YES" : "NO";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function permissionText(value: any) {
  if (value === true) return "ALLOW";
  if (value === false) return "BLOCK";

  const normalized = String(
    value ?? "",
  ).toUpperCase();

  if (
    normalized.includes("ALLOW") ||
    normalized === "GOOD" ||
    normalized === "STRONG" ||
    normalized === "ELITE"
  ) {
    return "ALLOW";
  }

  if (
    normalized.includes("BLOCK") ||
    normalized === "WEAK" ||
    normalized === "NO TRADE"
  ) {
    return "BLOCK";
  }

  return normalized || "—";
}

function StatusPill({
  children,
  good = false,
  danger = false,
}: {
  children: React.ReactNode;
  good?: boolean;
  danger?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1",
        "text-[11px] font-semibold tracking-wide",
        good
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : danger
            ? "border-red-500/30 bg-red-500/10 text-red-300"
            : "border-white/10 bg-white/[0.04] text-zinc-300",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 shadow-2xl shadow-black/10">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white">
          {title}
        </h2>

        {subtitle ? (
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {subtitle}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

export function OmiSessionIntelligence() {
  const [policy, setPolicy] = useState<AnyRecord>({});
  const [status, setStatus] = useState<AnyRecord>({});
  const [advisor, setAdvisor] = useState<AnyRecord>({});
  const [audit, setAudit] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const [session, setSession] = useState("LONDON");
  const [quality, setQuality] = useState("STRONG");
  const [allowed, setAllowed] = useState(true);
  const [entryLimit, setEntryLimit] = useState("1");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");

  const [resetPassword, setResetPassword] = useState("");
  const [verification, setVerification] = useState("");
  const [resetReason, setResetReason] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      fetchScientistSessionPolicy(),
      fetchScientistSessionPolicyStatus(),
      fetchScientistNeuralSessionAdvisor(),
      fetchScientistSessionPolicyAudit(),
    ]);

    const [
      policyResult,
      statusResult,
      advisorResult,
      auditResult,
    ] = results;

    if (policyResult.status === "fulfilled") {
      setPolicy(
        unwrap(policyResult.value) ?? {},
      );
    }

    if (statusResult.status === "fulfilled") {
      setStatus(
        unwrap(statusResult.value) ?? {},
      );
    }

    if (advisorResult.status === "fulfilled") {
      setAdvisor(
        unwrap(advisorResult.value) ?? {},
      );
    }

    if (auditResult.status === "fulfilled") {
      const value = unwrap(
        auditResult.value,
      );

      setAudit(
        Array.isArray(value)
          ? value
          : Array.isArray(value?.items)
            ? value.items
            : Array.isArray(value?.audit)
              ? value.audit
              : [],
      );
    }

    if (
      policyResult.status === "rejected" &&
      statusResult.status === "rejected"
    ) {
      setError(
        "Unable to load Scientist session policy.",
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();

    const timer = window.setInterval(
      () => void refresh(),
      15000,
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [refresh]);

  const currentSession = firstValue(
    status,
    [
      "current_session",
      "session",
      "session_name",
    ],
    firstValue(
      policy,
      [
        "current_session",
        "session",
      ],
      "UNKNOWN",
    ),
  );

  const policyMode = firstValue(
    status,
    [
      "mode",
      "policy_mode",
    ],
    firstValue(
      policy,
      [
        "mode",
        "policy_mode",
      ],
      "OMI_DEFAULT",
    ),
  );

  const scientistOverride = Boolean(
    firstValue(
      status,
      [
        "scientist_override",
        "override_active",
        "has_override",
      ],
      firstValue(
        policy,
        [
          "scientist_override",
          "override_active",
        ],
        false,
      ),
    ),
  );

  const reducedWindow =
    Boolean(
      status?.reduced_window_active ??
      status?.reduced_window?.active ??
      false
    );

  const recommendations = useMemo(() => {
    const candidates = [
      advisor?.recommendations,
      advisor?.suggestions,
      advisor?.actionable_suggestions,
      advisor?.items,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }

    return [];
  }, [advisor]);

  const researchRows =
    advisor?.research?.usable_rows ??
    0;

  const evidenceBuckets =
    advisor?.research?.buckets_with_minimum_evidence ??
    0;

  const advisorStage = firstValue(
    advisor,
    [
      "stage",
      "status",
    ],
    "OBSERVING",
  );

  async function saveOverride() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const basePolicy =
        policy?.effective_policy ??
        policy?.state?.policy ??
        policy?.default_policy;

      if (!basePolicy) {
        throw new Error(
          "Effective OMI session policy is unavailable.",
        );
      }

      const nextPolicy =
        structuredClone(basePolicy);

      let container: AnyRecord;

      if (
        session === "REDUCED_14_18_IST"
      ) {
        container =
          nextPolicy.reduced_window;
      } else {
        container =
          nextPolicy.sessions?.[session];
      }

      if (!container) {
        throw new Error(
          "Selected session policy is unavailable.",
        );
      }

      const limit =
        allowed && entryLimit
          ? Number(entryLimit)
          : null;

      if (
        allowed &&
        (
          !Number.isInteger(limit) ||
          Number(limit) < 1 ||
          Number(limit) > 5
        )
      ) {
        throw new Error(
          "Entry limit must be between 1 and 5.",
        );
      }

      if (quality === "GOOD") {
        container.GOOD = {
          ...(container.GOOD ?? {}),
          normal_allowed:
            allowed,
          exceptional_allowed:
            allowed,
          entry_limit:
            limit,
        };
      } else {
        container[quality] = {
          ...(container[quality] ?? {}),
          allowed:
            allowed,
          entry_limit:
            limit,
        };
      }

      await updateScientistSessionPolicy({
        password,
        reason:
          reason || null,
        policy:
          nextPolicy,
      });

      setPassword("");
      setReason("");
      setEditorOpen(false);

      setMessage(
        "Scientist session policy updated.",
      );

      await refresh();

    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.message ??
          "Unable to update session policy.",
      );

    } finally {
      setSaving(false);
    }
  }


  async function resetPolicy() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await resetScientistSessionPolicy({
        password: resetPassword,
        verification_number: verification,
        reason: resetReason || null,
      });

      setResetPassword("");
      setVerification("");
      setResetReason("");
      setResetOpen(false);

      setMessage(
        "Original OMI V9.2 session policy restored.",
      );

      await refresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.message ??
          "Unable to reset session policy.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openRecommendation(item: AnyRecord) {
    setSession(
      String(
        firstValue(
          item,
          ["session", "session_name"],
          currentSession,
        ),
      ),
    );

    setQuality(
      String(
        firstValue(
          item,
          ["quality", "trade_quality"],
          "STRONG",
        ),
      ),
    );

    const action = String(
      item?.recommendation?.action ??
      "ALLOW"
    ).toUpperCase();

    setAllowed(
      item?.suggested?.allowed ??
      !action.includes("BLOCK")
    );

    setEntryLimit(
      String(
        item?.suggested?.entry_limit ??
        1
      ),
    );

    setEditorOpen(true);
  }

  const sessionPolicies =
    policy?.effective_policy?.sessions ??
    policy?.state?.policy?.sessions ??
    policy?.default_policy?.sessions ??
    policy?.sessions ??
    {};

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.08] via-zinc-950 to-zinc-950 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusPill good>
              PURE OMI · LIVE AUTHORITY
            </StatusPill>

            <StatusPill>
              BRAIN · ADVISORY ONLY
            </StatusPill>
          </div>

          <h2 className="text-xl font-semibold text-white">
            Session Intelligence Control
          </h2>

          <p className="mt-1 max-w-3xl text-sm text-zinc-400">
            Monitor every OMI session, review neural research,
            and apply Scientist-approved session permissions
            without giving the neural candidate automatic
            trading authority.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 hover:bg-white/[0.08]"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={() => setEditorOpen(true)}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-400"
          >
            Edit Policy
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Current Session">
          <div className="flex items-center gap-3">
            <Clock3 className="h-6 w-6 text-cyan-300" />
            <div>
              <div className="text-lg font-semibold text-white">
                {displaySession(currentSession)}
              </div>
              <div className="text-xs text-zinc-500">
                Live OMI session
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Policy Mode">
          <div className="text-lg font-semibold text-white">
            {displayValue(policyMode)}
          </div>

          <div className="mt-2">
            <StatusPill good={!scientistOverride}>
              {scientistOverride
                ? "SCIENTIST OVERRIDE"
                : "ORIGINAL OMI DEFAULT"}
            </StatusPill>
          </div>
        </Panel>

        <Panel title="14:00–18:00 IST">
          <div className="text-lg font-semibold text-white">
            {reducedWindow ? "ACTIVE" : "INACTIVE"}
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            Original OMI V9.2 restricted window remains
            the immutable default.
          </p>
        </Panel>

        <Panel title="Neural Research">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-violet-300" />

            <div className="text-lg font-semibold text-white">
              {displayValue(advisorStage)}
            </div>
          </div>

          <div className="mt-2 text-xs text-zinc-500">
            {displayValue(researchRows)} usable rows
          </div>
        </Panel>
      </div>

      <Panel
        title="OMI Session Permission Matrix"
        subtitle="Effective Scientist-visible session policy. Original OMI remains the fallback/default authority."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                <th className="pb-3">Session</th>

                {QUALITIES.map((item) => (
                  <th
                    key={item}
                    className="pb-3"
                  >
                    {item}
                  </th>
                ))}

                <th className="pb-3">
                  Current
                </th>
              </tr>
            </thead>

            <tbody>
              {SESSION_ORDER.map((sessionName) => {
                const row =
                  sessionPolicies?.[sessionName] ??
                  {};

                return (
                  <tr
                    key={sessionName}
                    className="border-b border-white/[0.06]"
                  >
                    <td className="py-4 font-medium text-zinc-200">
                      {displaySession(sessionName)}
                    </td>

                    {QUALITIES.map((q) => {
                      const item =
                        row?.[q] ??
                        row?.[q.toLowerCase()] ??
                        "—";

                      const permission =
                        typeof item === "object"
                          ? firstValue(
                              item,
                              [
                                "allowed",
                                "permission",
                                "decision",
                              ],
                              "—",
                            )
                          : item;

                      const limit =
                        typeof item === "object"
                          ? firstValue(
                              item,
                              [
                                "entry_limit",
                                "limit",
                                "trade_limit",
                              ],
                              null,
                            )
                          : null;

                      const text =
                        permissionText(permission);

                      const isAllowed =
                        text === "ALLOW";

                      return (
                        <td
                          key={q}
                          className="py-4"
                        >
                          <div className="flex items-center gap-2">
                            {isAllowed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : text === "BLOCK" ? (
                              <XCircle className="h-4 w-4 text-red-400" />
                            ) : null}

                            <span className="text-zinc-300">
                              {text}

                              {isAllowed &&
                              limit !== null
                                ? ` ×${limit}`
                                : ""}
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-4">
                      {String(currentSession) ===
                      sessionName ? (
                        <StatusPill good>
                          LIVE
                        </StatusPill>
                      ) : (
                        <span className="text-zinc-600">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="OMI Brain Session Advisor"
          subtitle="Recommendations are research only. The Brain cannot apply session changes automatically."
        >
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs text-zinc-500">
                Stage
              </div>

              <div className="mt-1 font-semibold text-white">
                {displayValue(advisorStage)}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs text-zinc-500">
                Evidence Buckets
              </div>

              <div className="mt-1 font-semibold text-white">
                {displayValue(evidenceBuckets)}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs text-zinc-500">
                Research Rows
              </div>

              <div className="mt-1 font-semibold text-white">
                {displayValue(researchRows)}
              </div>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-violet-300" />

              <div className="mt-3 text-sm font-medium text-zinc-300">
                No evidence-ready recommendation yet
              </div>

              <div className="mt-1 text-xs text-zinc-500">
                OMI Brain remains in observation mode until
                sufficient session-quality evidence exists.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map(
                (item: AnyRecord, index: number) => {
                  const recommendation =
                    item?.recommendation?.action ??
                    "REVIEW";

                  const confidence =
                    item?.recommendation?.confidence_percent ??
                    "—";

                  const evidence =
                    item?.evidence?.total_samples ??
                    "—";

                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {displaySession(
                              firstValue(
                                item,
                                [
                                  "session",
                                  "session_name",
                                ],
                                "SESSION",
                              ),
                            )}
                            {" · "}
                            {displayValue(
                              firstValue(
                                item,
                                [
                                  "quality",
                                  "trade_quality",
                                ],
                                "QUALITY",
                              ),
                            )}
                          </div>

                          <div className="mt-1 text-xs text-zinc-400">
                            Brain:{" "}
                            {displayValue(
                              recommendation,
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            openRecommendation(item)
                          }
                          className="rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-400/20"
                        >
                          Review
                        </button>
                      </div>

                      <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                        <span>
                          Confidence:{" "}
                          {displayValue(confidence)}
                        </span>

                        <span>
                          Evidence:{" "}
                          {displayValue(evidence)}
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </Panel>

        <Panel
          title="Authority & Safety"
          subtitle="Scientist controls session permission only. Core trading authority remains separated."
        >
          <div className="space-y-3">
            {[
              [
                "BUY / SELL direction",
                "OMI",
              ],
              [
                "Entry / SL / TP",
                "OMI",
              ],
              [
                "Lot / financial risk",
                "ADMIN / OMI",
              ],
              [
                "Session override",
                "SCIENTIST",
              ],
              [
                "Neural policy application",
                "APPROVAL REQUIRED",
              ],
            ].map(([name, authority]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3"
              >
                <span className="text-sm text-zinc-400">
                  {name}
                </span>

                <span className="text-xs font-semibold text-zinc-200">
                  {authority}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setResetOpen(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/15"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Original OMI Default
          </button>
        </Panel>
      </div>

      <Panel
        title="Scientist Policy Audit"
        subtitle="Session-policy changes and resets. Password and verification number are never displayed."
      >
        {audit.length === 0 ? (
          <div className="text-sm text-zinc-500">
            No session-policy audit records available.
          </div>
        ) : (
          <div className="space-y-2">
            {audit
              .slice()
              .reverse()
              .slice(0, 12)
              .map(
                (
                  item: AnyRecord,
                  index: number,
                ) => (
                  <div
                    key={index}
                    className="grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs md:grid-cols-4"
                  >
                    <span className="text-zinc-300">
                      {displayValue(
                        firstValue(
                          item,
                          [
                            "action",
                            "event",
                          ],
                          "POLICY",
                        ),
                      )}
                    </span>

                    <span className="text-zinc-500">
                      {displayValue(
                        firstValue(
                          item,
                          [
                            "actor_username",
                            "actor",
                          ],
                          "Scientist",
                        ),
                      )}
                    </span>

                    <span className="text-zinc-500">
                      {displayValue(
                        firstValue(
                          item,
                          [
                            "reason",
                          ],
                          "—",
                        ),
                      )}
                    </span>

                    <span className="text-zinc-600">
                      {displayValue(
                        firstValue(
                          item,
                          [
                            "timestamp",
                            "changed_at",
                            "created_at",
                          ],
                          "—",
                        ),
                      )}
                    </span>
                  </div>
                ),
              )}
          </div>
        )}
      </Panel>

      {editorOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-cyan-300" />

              <div>
                <h3 className="font-semibold text-white">
                  Scientist Session Override
                </h3>

                <p className="text-xs text-zinc-500">
                  Requires Scientist password verification.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs text-zinc-500">
                  Session
                </span>

                <select
                  value={session}
                  onChange={(event) =>
                    setSession(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white"
                >
                  {SESSION_ORDER.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {displaySession(item)}
                    </option>
                  ))}

                  <option value="REDUCED_14_18_IST">
                    14:00–18:00 IST
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs text-zinc-500">
                  Quality
                </span>

                <select
                  value={quality}
                  onChange={(event) =>
                    setQuality(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white"
                >
                  {QUALITIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAllowed(true)}
                  className={[
                    "rounded-xl border px-3 py-2.5 text-sm",
                    allowed
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      : "border-white/10 text-zinc-500",
                  ].join(" ")}
                >
                  ALLOW
                </button>

                <button
                  onClick={() => setAllowed(false)}
                  className={[
                    "rounded-xl border px-3 py-2.5 text-sm",
                    !allowed
                      ? "border-red-500/40 bg-red-500/15 text-red-300"
                      : "border-white/10 text-zinc-500",
                  ].join(" ")}
                >
                  BLOCK
                </button>
              </div>

              {allowed ? (
                <label className="block">
                  <span className="mb-1.5 block text-xs text-zinc-500">
                    Maximum Entries
                  </span>

                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={entryLimit}
                    onChange={(event) =>
                      setEntryLimit(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-1.5 block text-xs text-zinc-500">
                  Reason · optional
                </span>

                <input
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white"
                  placeholder="Why is this policy being changed?"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs text-zinc-500">
                  Scientist Password
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditorOpen(false);
                  setPassword("");
                }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400"
              >
                Cancel
              </button>

              <button
                disabled={
                  saving ||
                  !password ||
                  (allowed &&
                    (!entryLimit ||
                      Number(entryLimit) < 1))
                }
                onClick={() =>
                  void saveOverride()
                }
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
              >
                {saving
                  ? "Applying..."
                  : "Verify & Apply"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {resetOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-6 w-6 text-red-300" />

              <div>
                <h3 className="font-semibold text-white">
                  Reset to Original OMI Default
                </h3>

                <p className="text-xs text-zinc-500">
                  Removes all Scientist session overrides.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-3 text-xs leading-5 text-amber-200">
              This restores the immutable OMI V9.2
              session policy. It does not change BUY/SELL,
              SL/TP, lot size, or existing positions.
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs text-zinc-500">
                  Scientist Password
                </span>

                <input
                  type="password"
                  value={resetPassword}
                  onChange={(event) =>
                    setResetPassword(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs text-zinc-500">
                  Verification Number
                </span>

                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={verification}
                  onChange={(event) =>
                    setVerification(
                      event.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm tracking-[0.4em] text-white"
                  placeholder="••••"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs text-zinc-500">
                  Reason · optional
                </span>

                <input
                  value={resetReason}
                  onChange={(event) =>
                    setResetReason(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setResetOpen(false);
                  setResetPassword("");
                  setVerification("");
                }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400"
              >
                Cancel
              </button>

              <button
                disabled={
                  saving ||
                  !resetPassword ||
                  verification.length !== 4
                }
                onClick={() =>
                  void resetPolicy()
                }
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {saving
                  ? "Resetting..."
                  : "Verify & Reset"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          Synchronizing Scientist session intelligence…
        </div>
      ) : null}
    </div>
  );
}

export default OmiSessionIntelligence;
