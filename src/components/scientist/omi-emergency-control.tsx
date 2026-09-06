"use client";

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
