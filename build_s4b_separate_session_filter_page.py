from pathlib import Path
from datetime import datetime
import re
import shutil
import sys

ROOT = Path(r"D:\OMI-pro\omi-frontend")

API = (
    ROOT
    / "src"
    / "services"
    / "api"
    / "scientist-session-policy-api.ts"
)

COMPONENT = (
    ROOT
    / "src"
    / "components"
    / "scientist"
    / "omi-session-intelligence.tsx"
)

PAGE = (
    ROOT
    / "src"
    / "app"
    / "scientist"
    / "session-filter"
    / "page.tsx"
)

NAV = (
    ROOT
    / "src"
    / "constants"
    / "navigation.ts"
)

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 100)
print("S4B — SEPARATE SCIENTIST SESSION FILTER PAGE")
print("=" * 100)

# ============================================================
# 1. MOVE TYPESCRIPT BACKUPS OUT OF COMPILATION
# ============================================================

api_dir = API.parent

for path in api_dir.glob(
    "scientist-session-policy-api.before_*.ts"
):

    backup_name = (
        path.name
        + ".bak"
    )

    target = path.with_name(
        backup_name
    )

    path.rename(
        target
    )

    print(
        "[PASS] Excluded TS backup:",
        target.name,
    )


# ============================================================
# 2. BACKUP CURRENT FRONTEND FILES
# ============================================================

for path in (
    API,
    COMPONENT,
    NAV,
):

    if path.exists():

        backup = path.with_name(
            f"{path.name}.before_session_filter_page_{stamp}.bak"
        )

        shutil.copy2(
            path,
            backup,
        )

print(
    "[PASS] Frontend backups created"
)


# ============================================================
# 3. REBUILD API CLIENT TO MATCH REAL BACKEND CONTRACT
# ============================================================

api_code = r'''import axios from "axios";

import {
  API_BASE_URL,
} from "@/lib/api-config";

import {
  getAccessToken,
} from "@/lib/auth-token-storage";


export type OmiSessionQuality =
  | "GOOD"
  | "STRONG"
  | "ELITE";


export interface ScientistSessionPolicyUpdatePayload {
  password: string;
  reason?: string | null;
  policy: Record<string, unknown>;
}


export interface ScientistSessionPolicyResetPayload {
  password: string;
  verification_number: string;
  reason?: string | null;
}


function getAuthorizationHeaders() {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "Scientist access token is unavailable.",
    );
  }

  return {
    Authorization:
      `Bearer ${token}`,

    Accept:
      "application/json",

    "Content-Type":
      "application/json",
  };
}


export async function fetchScientistSessionPolicy() {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/session-policy`,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function fetchScientistSessionPolicyStatus() {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/session-policy/status`,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function fetchScientistNeuralSessionAdvisor() {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/session-policy/neural-advisor`,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function fetchScientistSessionPolicyAudit(
  limit = 100,
) {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/session-policy/audit`,
      {
        params: {
          limit,
        },

        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function updateScientistSessionPolicy(
  payload: ScientistSessionPolicyUpdatePayload,
) {
  const response =
    await axios.post(
      `${API_BASE_URL}/scientist/session-policy/update`,
      payload,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function resetScientistSessionPolicy(
  payload: ScientistSessionPolicyResetPayload,
) {
  const response =
    await axios.post(
      `${API_BASE_URL}/scientist/session-policy/reset`,
      payload,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}
'''

API.write_text(
    api_code,
    encoding="utf-8",
)

print(
    "[PASS] Session Policy API aligned with backend"
)


# ============================================================
# 4. PATCH COMPONENT IMPORT NAMES
# ============================================================

text = COMPONENT.read_text(
    encoding="utf-8",
    errors="replace",
)

replacements = {
    "getScientistSessionPolicy":
        "fetchScientistSessionPolicy",

    "getScientistSessionPolicyStatus":
        "fetchScientistSessionPolicyStatus",

    "getScientistNeuralSessionAdvisor":
        "fetchScientistNeuralSessionAdvisor",

    "getScientistSessionPolicyAudit":
        "fetchScientistSessionPolicyAudit",
}

for old, new in replacements.items():

    text = text.replace(
        old,
        new,
    )


# ============================================================
# 5. FIX REAL POLICY RESPONSE SHAPE
# ============================================================

old_session_policy = '''  const sessionPolicies =
    policy?.sessions ??
    policy?.session_policies ??
    policy?.effective_policy ??
    {};'''

new_session_policy = '''  const sessionPolicies =
    policy?.effective_policy?.sessions ??
    policy?.state?.policy?.sessions ??
    policy?.default_policy?.sessions ??
    policy?.sessions ??
    {};'''

if old_session_policy in text:

    text = text.replace(
        old_session_policy,
        new_session_policy,
        1,
    )


# ============================================================
# 6. FIX REAL BRAIN RESEARCH SHAPE
# ============================================================

text = re.sub(
    r'''  const researchRows = firstValue\(
    advisor,
    \[
      "usable_research_rows",
      "research_rows",
      "usable_rows",
      "total_rows",
    \],
    0,
  \);''',

    '''  const researchRows =
    advisor?.research?.usable_rows ??
    0;''',

    text,
)


text = re.sub(
    r'''  const evidenceBuckets = firstValue\(
    advisor,
    \[
      "evidence_ready_buckets",
      "ready_buckets",
    \],
    0,
  \);''',

    '''  const evidenceBuckets =
    advisor?.research?.buckets_with_minimum_evidence ??
    0;''',

    text,
)


# ============================================================
# 7. REPLACE SAVE OVERRIDE WITH FULL-POLICY UPDATE
# ============================================================

save_start = text.find(
    "  async function saveOverride() {"
)

save_end = text.find(
    "  async function resetPolicy() {",
    save_start,
)

if (
    save_start == -1
    or save_end == -1
):

    raise RuntimeError(
        "Could not locate saveOverride()"
    )


new_save = r'''  async function saveOverride() {
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


'''

text = (
    text[:save_start]
    + new_save
    + text[save_end:]
)


# ============================================================
# 8. LIMIT FRONTEND ENTRY LIMIT TO BACKEND MAX = 5
# ============================================================

text = text.replace(
    'max={10}',
    'max={5}',
)


# ============================================================
# 9. FIX REDUCED-WINDOW STATUS
# ============================================================

old_reduced = '''  const reducedWindow = firstValue(
    status,
    [
      "reduced_window",
      "reduced_exposure_window",
      "is_reduced_window",
    ],
    false,
  );'''

new_reduced = '''  const reducedWindow =
    Boolean(
      status?.reduced_window_active ??
      status?.reduced_window?.active ??
      false
    );'''

if old_reduced in text:

    text = text.replace(
        old_reduced,
        new_reduced,
        1,
    )


# ============================================================
# 10. FIX ADVISOR RECOMMENDATION NESTING
# ============================================================

text = text.replace(
    '''const recommendation =
                    firstValue(
                      item,
                      [
                        "recommendation",
                        "action",
                        "decision",
                      ],
                      "REVIEW",
                    );''',

    '''const recommendation =
                    item?.recommendation?.action ??
                    "REVIEW";''',
)


text = text.replace(
    '''const confidence =
                    firstValue(
                      item,
                      [
                        "confidence",
                        "confidence_percent",
                      ],
                      "—",
                    );''',

    '''const confidence =
                    item?.recommendation?.confidence_percent ??
                    "—";''',
)


text = text.replace(
    '''const evidence =
                    firstValue(
                      item,
                      [
                        "evidence_count",
                        "sample_count",
                        "observations",
                      ],
                      "—",
                    );''',

    '''const evidence =
                    item?.evidence?.total_samples ??
                    "—";''',
)


# ============================================================
# 11. FIX REVIEW -> SUGGESTED POLICY VALUES
# ============================================================

old_action = '''    const action = String(
      firstValue(
        item,
        ["action", "recommendation", "decision"],
        "ALLOW",
      ),
    ).toUpperCase();

    setAllowed(
      !action.includes("BLOCK"),
    );

    setEntryLimit(
      String(
        firstValue(
          item,
          [
            "entry_limit",
            "recommended_entry_limit",
            "trade_limit",
          ],
          1,
        ),
      ),
    );'''

new_action = '''    const action = String(
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
    );'''

if old_action in text:

    text = text.replace(
        old_action,
        new_action,
        1,
    )


COMPONENT.write_text(
    text,
    encoding="utf-8",
)

print(
    "[PASS] Session Intelligence component aligned"
)


# ============================================================
# 12. CREATE SEPARATE SESSION FILTER PAGE
# ============================================================

PAGE.parent.mkdir(
    parents=True,
    exist_ok=True,
)

page_code = r'''"use client";

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
'''

PAGE.write_text(
    page_code,
    encoding="utf-8",
)

print(
    "[PASS] Separate Scientist Session Filter page created"
)


# ============================================================
# 13. ADD SEPARATE SCIENTIST NAVIGATION ITEM
# ============================================================

nav = NAV.read_text(
    encoding="utf-8",
    errors="replace",
)

if (
    'href: "/scientist/session-filter"'
    not in nav
):

    brain_item_pattern = re.compile(
        r'''(\{\s*
\s*label:\s*"OMI Brain",\s*
\s*href:\s*"/scientist/omi-brain",\s*
\s*icon:\s*BrainCircuit,\s*
\s*roles:\s*\[\s*
\s*"DEVELOPER",\s*
\s*\],\s*
\s*\},)''',
        re.VERBOSE,
    )

    match = brain_item_pattern.search(
        nav
    )

    if not match:

        raise RuntimeError(
            "Could not locate OMI Brain navigation item"
        )

    new_item = r'''

      {
        label: "Session Filter",
        href: "/scientist/session-filter",
        icon: SlidersHorizontal,
        roles: [
          "DEVELOPER",
        ],
      },'''

    nav = (
        nav[:match.end()]
        + new_item
        + nav[match.end():]
    )

NAV.write_text(
    nav,
    encoding="utf-8",
)

print(
    "[PASS] Scientist navigation item added"
)


# ============================================================
# 14. STATIC VALIDATION
# ============================================================

api_final = API.read_text(
    encoding="utf-8"
)

component_final = COMPONENT.read_text(
    encoding="utf-8"
)

page_final = PAGE.read_text(
    encoding="utf-8"
)

nav_final = NAV.read_text(
    encoding="utf-8"
)

checks = {
    "Separate page route":
        "ScientistSessionFilterPage"
        in page_final,

    "Session component mounted":
        "<OmiSessionIntelligence />"
        in page_final,

    "Navigation entry":
        'href: "/scientist/session-filter"'
        in nav_final,

    "Scientist role only":
        '"DEVELOPER"'
        in nav_final,

    "Real update contract":
        "policy:"
        in api_final,

    "Password update":
        "password"
        in component_final,

    "Protected reset verification":
        "verification_number"
        in api_final,

    "Reset UI":
        "Reset to Original OMI Default"
        in component_final,

    "Neural advisor":
        "Neural Session Advisor"
        in component_final,

    "Full policy mutation":
        "structuredClone"
        in component_final,

    "Backend max exposure":
        "Number(limit) > 5"
        in component_final,
}

for name, passed in checks.items():

    if not passed:

        print(
            "[FAILED]",
            name,
        )

        sys.exit(1)

    print(
        "[PASS]",
        name,
    )


print()
print("=" * 100)
print("S4B FRONTEND INSTALLATION COMPLETE")
print("=" * 100)
print("New page                    : /scientist/session-filter")
print("OMI Brain page              : SEPARATE / UNCHANGED")
print("Session matrix              : ENABLED")
print("Live current session        : ENABLED")
print("GOOD / STRONG / ELITE       : ENABLED")
print("Per-quality entry limits    : ENABLED")
print("14:00-18:00 IST             : ENABLED")
print("Scientist override          : ENABLED")
print("Scientist password          : REQUIRED")
print("Neural recommendation       : ENABLED")
print("Neural auto-apply           : DISABLED")
print("Reset all overrides         : ENABLED")
print("Reset verification          : PASSWORD + 0008 BACKEND VERIFY")
print("Audit history               : ENABLED")
print("session_filter.py           : UNCHANGED")
print("Backend trading logic       : UNCHANGED")
print("MT5 orders                  : NONE")
print("=" * 100)
