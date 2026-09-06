from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path(r"D:\OMI-pro\omi-frontend")

API = ROOT / "src/services/api/scientist-api.ts"
PAGE = ROOT / "src/app/scientist/omi-brain/page.tsx"
COMPONENT = (
    ROOT
    / "src/components/scientist/omi-emergency-control.tsx"
)

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 100)
print("STEP 7A — SCIENTIST EMERGENCY CONTROL FRONTEND")
print("=" * 100)

# ============================================================
# PRECHECK
# ============================================================

for file in [API, PAGE]:

    if not file.exists():
        print(
            "ABORT: Missing",
            file.relative_to(ROOT),
        )
        sys.exit(1)

api_original = API.read_text(
    encoding="utf-8-sig"
)

page_original = PAGE.read_text(
    encoding="utf-8-sig"
)

if (
    "fetchScientistOmiBrain"
    not in api_original
):
    print(
        "ABORT: Existing OMI Brain API "
        "client not found."
    )
    sys.exit(1)

# ============================================================
# BACKUPS
# ============================================================

api_backup = API.with_name(
    f"scientist-api.before_emergency_ui_{stamp}.ts"
)

page_backup = PAGE.with_name(
    f"page.before_emergency_ui_{stamp}.tsx"
)

shutil.copy2(
    API,
    api_backup,
)

shutil.copy2(
    PAGE,
    page_backup,
)

print(
    "API backup  :",
    api_backup,
)

print(
    "Page backup :",
    page_backup,
)

try:

    # ========================================================
    # API CLIENT
    # ========================================================

    api_text = api_original

    if (
        "export type ScientistEmergencyOrderControl"
        not in api_text
    ):

        api_text += r'''


export type ScientistEmergencyOrderControl = {
  version: string;
  new_entries_blocked: boolean;
  new_entries_allowed: boolean;
  changed_at: string | null;
  changed_by: string | null;
  reason: string | null;
};

export type ScientistEmergencyControlPayload = {
  password: string;
  reason?: string | null;
};

export async function fetchScientistEmergencyOrderControl():
  Promise<ScientistEmergencyOrderControl> {

  const response = await axios.get(
    `${API_BASE_URL}/scientist/emergency-order-control`,
    {
      headers: getAuthorizationHeaders(),
      timeout: 5000,
    },
  );

  return response.data.data;
}

export async function stopScientistEmergencyOrderControl(
  payload: ScientistEmergencyControlPayload,
): Promise<ScientistEmergencyOrderControl> {

  const response = await axios.post(
    `${API_BASE_URL}/scientist/emergency-order-control/stop`,
    payload,
    {
      headers: getAuthorizationHeaders(),
      timeout: 15000,
    },
  );

  return response.data.data;
}

export async function startScientistEmergencyOrderControl(
  payload: ScientistEmergencyControlPayload,
): Promise<ScientistEmergencyOrderControl> {

  const response = await axios.post(
    `${API_BASE_URL}/scientist/emergency-order-control/start`,
    payload,
    {
      headers: getAuthorizationHeaders(),
      timeout: 15000,
    },
  );

  return response.data.data;
}
'''

    API.write_text(
        api_text,
        encoding="utf-8",
    )

    print(
        "[OK] Emergency-control API client added"
    )

    # ========================================================
    # COMPONENT
    # ========================================================

    COMPONENT.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    COMPONENT.write_text(
r'''"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  LockKeyhole,
  Play,
  ShieldAlert,
  Square,
  X,
} from "lucide-react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchScientistEmergencyOrderControl,
  startScientistEmergencyOrderControl,
  stopScientistEmergencyOrderControl,
} from "@/services/api/scientist-api";


type ActionMode =
  | "STOP"
  | "START"
  | null;


function getErrorMessage(
  error: unknown,
): string {

  if (
    typeof error === "object"
    && error !== null
    && "response" in error
  ) {

    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      }
    ).response;

    if (
      response?.data?.detail
    ) {
      return response.data.detail;
    }
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return (
    "Unable to change emergency "
    + "order-control state."
  );
}


export function OmiEmergencyControl() {

  const queryClient = useQueryClient();

  const [
    actionMode,
    setActionMode,
  ] = useState<ActionMode>(
    null,
  );

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(
    null,
  );


  const controlQuery = useQuery({
    queryKey: [
      "scientist",
      "emergency-order-control",
    ],

    queryFn:
      fetchScientistEmergencyOrderControl,

    refetchInterval: 2000,

    refetchIntervalInBackground:
      false,

    retry: 1,

    staleTime: 1000,
  });


  const mutation = useMutation({

    mutationFn: async () => {

      const payload = {
        password,
        reason:
          reason.trim()
          || null,
      };

      if (
        actionMode === "STOP"
      ) {
        return (
          stopScientistEmergencyOrderControl(
            payload,
          )
        );
      }

      if (
        actionMode === "START"
      ) {
        return (
          startScientistEmergencyOrderControl(
            payload,
          )
        );
      }

      throw new Error(
        "Emergency action is unavailable.",
      );
    },

    onSuccess: async () => {

      setPassword("");
      setReason("");
      setActionError(null);
      setActionMode(null);

      await queryClient.invalidateQueries({
        queryKey: [
          "scientist",
          "emergency-order-control",
        ],
      });
    },

    onError: (
      error,
    ) => {

      // Password is deliberately NOT
      // logged or stored anywhere.
      setActionError(
        getErrorMessage(
          error,
        ),
      );
    },
  });


  useEffect(
    () => {

      if (
        actionMode === null
      ) {

        setPassword("");
        setReason("");
        setActionError(null);
      }

    },
    [
      actionMode,
    ],
  );


  const state =
    controlQuery.data;

  const blocked =
    state?.new_entries_blocked
    ?? false;

  const unavailable =
    controlQuery.isError
    || !state;


  function submit(
    event: FormEvent,
  ) {

    event.preventDefault();

    setActionError(null);

    if (
      !password.trim()
    ) {

      setActionError(
        "Scientist password is required.",
      );

      return;
    }

    mutation.mutate();
  }


  return (
    <>
      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-800
          bg-[#060b14]
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            p-5
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:p-6
          "
        >
          <div
            className="
              flex
              min-w-0
              items-start
              gap-4
            "
          >
            <div
              className={`
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                ${
                  blocked
                    ? (
                      "border-red-500/30 "
                      + "bg-red-500/10 "
                      + "text-red-400"
                    )
                    : (
                      "border-emerald-500/30 "
                      + "bg-emerald-500/10 "
                      + "text-emerald-400"
                    )
                }
              `}
            >
              {
                blocked
                  ? (
                    <ShieldAlert
                      size={21}
                    />
                  )
                  : (
                    <CheckCircle2
                      size={21}
                    />
                  )
              }
            </div>

            <div
              className="min-w-0"
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <h2
                  className="
                    text-sm
                    font-semibold
                    text-white
                    sm:text-base
                  "
                >
                  OMI Auto-Trade
                  Execution Authority
                </h2>

                {
                  unavailable
                    ? (
                      <span
                        className="
                          rounded-full
                          border
                          border-amber-500/30
                          bg-amber-500/10
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.14em]
                          text-amber-300
                        "
                      >
                        Control unavailable
                      </span>
                    )
                    : blocked
                      ? (
                        <span
                          className="
                            rounded-full
                            border
                            border-red-500/30
                            bg-red-500/10
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.14em]
                            text-red-300
                          "
                        >
                          Emergency stopped
                        </span>
                      )
                      : (
                        <span
                          className="
                            rounded-full
                            border
                            border-emerald-500/30
                            bg-emerald-500/10
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.14em]
                            text-emerald-300
                          "
                        >
                          Running
                        </span>
                      )
                }
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
                {
                  unavailable
                    ? (
                      "Unable to read the secured "
                      + "execution-control state."
                    )
                    : blocked
                      ? (
                        "New automatic OMI entries "
                        + "are blocked. Existing "
                        + "positions remain under "
                        + "normal OMI trailing, TP "
                        + "and exit management."
                      )
                      : (
                        "New automatic OMI entries "
                        + "are allowed. Scientist "
                        + "Emergency Stop can block "
                        + "new entry execution "
                        + "without stopping OMI."
                      )
                }
              </p>

              {
                state?.changed_at
                && (
                  <p
                    className="
                      mt-2
                      text-xs
                      text-slate-600
                    "
                  >
                    Last changed by{" "}
                    <span
                      className="
                        text-slate-400
                      "
                    >
                      {
                        state.changed_by
                        || "unknown"
                      }
                    </span>
                    {" · "}
                    {
                      new Date(
                        state.changed_at,
                      ).toLocaleString()
                    }
                  </p>
                )
              }
            </div>
          </div>

          <div
            className="
              flex
              shrink-0
              flex-wrap
              gap-3
            "
          >
            {
              blocked
                ? (
                  <button
                    type="button"
                    disabled={
                      unavailable
                    }
                    onClick={() =>
                      setActionMode(
                        "START",
                      )
                    }
                    className="
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-emerald-500/30
                      bg-emerald-500/10
                      px-5
                      text-sm
                      font-semibold
                      text-emerald-300
                      transition
                      hover:bg-emerald-500/15
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <Play
                      size={16}
                    />

                    Start Auto Trade
                  </button>
                )
                : (
                  <button
                    type="button"
                    disabled={
                      unavailable
                    }
                    onClick={() =>
                      setActionMode(
                        "STOP",
                      )
                    }
                    className="
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-red-500/30
                      bg-red-500/10
                      px-5
                      text-sm
                      font-semibold
                      text-red-300
                      transition
                      hover:bg-red-500/15
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <Square
                      size={15}
                    />

                    Emergency Stop
                  </button>
                )
            }
          </div>
        </div>

        <div
          className="
            grid
            border-t
            border-slate-800
            sm:grid-cols-3
          "
        >
          <div
            className="
              border-b
              border-slate-800
              px-5
              py-3
              text-xs
              text-slate-500
              sm:border-b-0
              sm:border-r
            "
          >
            New orders
            <span
              className={`
                ml-2
                font-semibold
                ${
                  blocked
                    ? "text-red-400"
                    : "text-emerald-400"
                }
              `}
            >
              {
                blocked
                  ? "BLOCKED"
                  : "ALLOWED"
              }
            </span>
          </div>

          <div
            className="
              border-b
              border-slate-800
              px-5
              py-3
              text-xs
              text-slate-500
              sm:border-b-0
              sm:border-r
            "
          >
            Open positions
            <span
              className="
                ml-2
                font-semibold
                text-sky-400
              "
            >
              MANAGED
            </span>
          </div>

          <div
            className="
              px-5
              py-3
              text-xs
              text-slate-500
            "
          >
            OMI services
            <span
              className="
                ml-2
                font-semibold
                text-sky-400
              "
            >
              RUNNING
            </span>
          </div>
        </div>
      </section>


      {
        actionMode
        && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/75
              p-4
              backdrop-blur-sm
            "
          >
            <div
              className="
                w-full
                max-w-lg
                overflow-hidden
                rounded-2xl
                border
                border-slate-700
                bg-[#080d16]
                shadow-2xl
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  border-b
                  border-slate-800
                  p-5
                "
              >
                <div
                  className="
                    flex
                    gap-3
                  "
                >
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      ${
                        actionMode
                        === "STOP"
                          ? (
                            "bg-red-500/10 "
                            + "text-red-400"
                          )
                          : (
                            "bg-emerald-500/10 "
                            + "text-emerald-400"
                          )
                      }
                    `}
                  >
                    {
                      actionMode
                      === "STOP"
                        ? (
                          <AlertTriangle
                            size={19}
                          />
                        )
                        : (
                          <Play
                            size={19}
                          />
                        )
                    }
                  </div>

                  <div>
                    <h3
                      className="
                        font-semibold
                        text-white
                      "
                    >
                      {
                        actionMode
                        === "STOP"
                          ? (
                            "Confirm Emergency Stop"
                          )
                          : (
                            "Confirm Auto-Trade Start"
                          )
                      }
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-5
                        text-slate-400
                      "
                    >
                      Scientist identity will be
                      re-verified using your
                      password.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    mutation.isPending
                  }
                  onClick={() =>
                    setActionMode(
                      null,
                    )
                  }
                  className="
                    rounded-lg
                    p-2
                    text-slate-500
                    transition
                    hover:bg-slate-800
                    hover:text-white
                  "
                >
                  <X
                    size={17}
                  />
                </button>
              </div>


              <form
                onSubmit={submit}
                className="p-5"
              >
                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Scientist password
                </label>

                <div
                  className="
                    relative
                    mt-2
                  "
                >
                  <LockKeyhole
                    size={16}
                    className="
                      pointer-events-none
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-600
                    "
                  />

                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    disabled={
                      mutation.isPending
                    }
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-700
                      bg-[#050912]
                      pl-10
                      pr-4
                      text-sm
                      text-white
                      outline-none
                      transition
                      placeholder:text-slate-700
                      focus:border-amber-500/50
                    "
                    placeholder="Enter password"
                  />
                </div>


                <label
                  className="
                    mt-5
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Reason
                  <span
                    className="
                      ml-2
                      normal-case
                      tracking-normal
                      text-slate-600
                    "
                  >
                    optional
                  </span>
                </label>

                <textarea
                  value={reason}
                  maxLength={500}
                  disabled={
                    mutation.isPending
                  }
                  onChange={(event) =>
                    setReason(
                      event.target.value,
                    )
                  }
                  placeholder={
                    actionMode
                    === "STOP"
                      ? (
                        "Why are new orders "
                        + "being stopped?"
                      )
                      : (
                        "Reason for restarting "
                        + "auto trade"
                      )
                  }
                  className="
                    mt-2
                    min-h-24
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-700
                    bg-[#050912]
                    p-3.5
                    text-sm
                    leading-5
                    text-white
                    outline-none
                    transition
                    placeholder:text-slate-700
                    focus:border-amber-500/50
                  "
                />


                {
                  actionError
                  && (
                    <div
                      className="
                        mt-4
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-4
                        py-3
                        text-sm
                        text-red-300
                      "
                    >
                      {actionError}
                    </div>
                  )
                }


                <div
                  className="
                    mt-6
                    flex
                    flex-col-reverse
                    gap-3
                    sm:flex-row
                    sm:justify-end
                  "
                >
                  <button
                    type="button"
                    disabled={
                      mutation.isPending
                    }
                    onClick={() =>
                      setActionMode(
                        null,
                      )
                    }
                    className="
                      h-11
                      rounded-xl
                      border
                      border-slate-700
                      px-5
                      text-sm
                      font-medium
                      text-slate-300
                      transition
                      hover:bg-slate-800
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      mutation.isPending
                    }
                    className={`
                      h-11
                      rounded-xl
                      border
                      px-5
                      text-sm
                      font-semibold
                      transition
                      disabled:cursor-wait
                      disabled:opacity-50
                      ${
                        actionMode
                        === "STOP"
                          ? (
                            "border-red-500/30 "
                            + "bg-red-500/15 "
                            + "text-red-300 "
                            + "hover:bg-red-500/20"
                          )
                          : (
                            "border-emerald-500/30 "
                            + "bg-emerald-500/15 "
                            + "text-emerald-300 "
                            + "hover:bg-emerald-500/20"
                          )
                      }
                    `}
                  >
                    {
                      mutation.isPending
                        ? (
                          "Verifying..."
                        )
                        : actionMode
                          === "STOP"
                            ? (
                              "Confirm Emergency Stop"
                            )
                            : (
                              "Confirm Auto-Trade Start"
                            )
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </>
  );
}
''',
        encoding="utf-8",
    )

    print(
        "[OK] Emergency-control component created"
    )

    # ========================================================
    # CONNECT COMPONENT TO OMI BRAIN PAGE
    # ========================================================

    page_text = page_original

    if (
        "OmiEmergencyControl"
        not in page_text
    ):

        # Insert import directly before the existing
        # OMI Brain visualizer import when possible.
        visualizer_import = (
            'import { OmiBrainVisualizer } '
            'from "@/components/scientist/'
            'omi-brain-visualizer";'
        )

        emergency_import = (
            'import { OmiEmergencyControl } '
            'from "@/components/scientist/'
            'omi-emergency-control";'
        )

        if (
            visualizer_import
            in page_text
        ):
            page_text = page_text.replace(
                visualizer_import,
                emergency_import
                + "\n"
                + visualizer_import,
                1,
            )

        else:

            # Safe fallback: place import before
            # the first export/default page function.
            candidates = [
                "export default",
                "export function",
            ]

            inserted = False

            for marker in candidates:

                position = page_text.find(
                    marker
                )

                if position >= 0:

                    page_text = (
                        page_text[:position]
                        + emergency_import
                        + "\n\n"
                        + page_text[position:]
                    )

                    inserted = True
                    break

            if not inserted:
                raise RuntimeError(
                    "Could not safely insert "
                    "Emergency Control import."
                )


        # Put emergency control immediately before
        # neural visualization.
        visualizer_usage = (
            "<OmiBrainVisualizer"
        )

        position = page_text.find(
            visualizer_usage
        )

        if position < 0:
            raise RuntimeError(
                "OmiBrainVisualizer usage "
                "not found."
            )

        # Find indentation from current line.
        line_start = (
            page_text.rfind(
                "\n",
                0,
                position,
            )
            + 1
        )

        indent = (
            page_text[
                line_start:position
            ]
        )

        page_text = (
            page_text[:line_start]
            + indent
            + "<OmiEmergencyControl />\n\n"
            + page_text[line_start:]
        )

    PAGE.write_text(
        page_text,
        encoding="utf-8",
    )

    print(
        "[OK] Emergency control connected to OMI Brain page"
    )

    # ========================================================
    # STRUCTURAL VALIDATION
    # ========================================================

    print()
    print("-" * 100)
    print("STRUCTURAL VALIDATION")
    print("-" * 100)

    final_api = API.read_text(
        encoding="utf-8"
    )

    final_page = PAGE.read_text(
        encoding="utf-8"
    )

    final_component = COMPONENT.read_text(
        encoding="utf-8"
    )

    checks = {
        "GET state API":
            "/scientist/emergency-order-control"
            in final_api,

        "STOP API":
            "/scientist/emergency-order-control/stop"
            in final_api,

        "START API":
            "/scientist/emergency-order-control/start"
            in final_api,

        "Bearer auth reused":
            "getAuthorizationHeaders()"
            in final_api,

        "Password input":
            'type="password"'
            in final_component,

        "Optional reason":
            "maxLength={500}"
            in final_component,

        "STOP confirmation":
            "Confirm Emergency Stop"
            in final_component,

        "START confirmation":
            "Confirm Auto-Trade Start"
            in final_component,

        "Page integration":
            "<OmiEmergencyControl />"
            in final_page,

        "No password logging":
            "console.log(password)"
            not in final_component,
    }

    for name, passed in checks.items():

        if not passed:
            raise RuntimeError(
                f"{name} validation failed."
            )

        print(
            f"[PASS] {name}"
        )

    # ========================================================
    # PRODUCTION BUILD
    # ========================================================

    print()
    print("-" * 100)
    print("PRODUCTION BUILD")
    print("-" * 100)

    result = subprocess.run(
        [
            "npm.cmd",
            "run",
            "build",
        ],
        cwd=ROOT,
    )

    if result.returncode != 0:
        raise RuntimeError(
            "Next.js production build failed."
        )

except Exception as error:

    print()
    print("STEP 7A FAILED")
    print(error)

    shutil.copy2(
        api_backup,
        API,
    )

    shutil.copy2(
        page_backup,
        PAGE,
    )

    COMPONENT.unlink(
        missing_ok=True
    )

    print(
        "Automatic rollback : COMPLETE"
    )

    sys.exit(1)


print()
print("=" * 100)
print("STEP 7A — EMERGENCY FRONTEND COMPLETE")
print("=" * 100)

print("Scientist control card : CREATED")
print("Persistent state UI    : CONNECTED")
print("Emergency STOP modal   : CREATED")
print("Auto-Trade START modal : CREATED")
print("Password required      : YES")
print("Optional reason        : YES")
print("Password stored        : NO")
print("Password logged        : NO")
print("Backend endpoints      : CONNECTED")
print("2-second state polling : ENABLED")
print("Production build       : PASS")
print()
print("OMI backend restarted  : NO")
print("MT5 orders sent        : NO")
print("=" * 100)
