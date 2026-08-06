"use client";

import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import axios from "axios";

import {
  useForm,
} from "react-hook-form";

import {
  useAuth,
} from "@/context/auth-context";

import {
  cn,
} from "@/lib/cn";

import type {
  LoginRequest,
} from "@/types/auth";


export function LoginForm() {
  const router =
    useRouter();

  const {
    login,
  } = useAuth();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    serverError,
    setServerError,
  ] = useState<
    string
    | null
  >(null);


  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginRequest>({
    defaultValues: {
      username: "",
      password: "",
    },
  });


  const onSubmit =
    async (
      values:
        LoginRequest,
    ) => {
      setServerError(
        null,
      );

      try {
        await login({
          username:
            values.username
              .trim()
              .toLowerCase(),

          password:
            values.password,
        });

        router.replace(
          "/",
        );
      } catch (error) {
        if (
          axios.isAxiosError(
            error,
          )
        ) {
          const detail =
            error.response
              ?.data
              ?.detail;

          if (
            typeof detail
            === "string"
          ) {
            setServerError(
              detail,
            );

            return;
          }
        }

        setServerError(
          "Unable to sign in. Check the backend connection and try again.",
        );
      }
    };


  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-[var(--border)] bg-[rgba(8,13,21,0.94)] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:rgba(217,164,65,0.32)] bg-[var(--accent-muted)] text-[var(--accent)]">
          <LockKeyhole className="h-6 w-6" />
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Secure OMI access
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Sign in
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
            Access the OMI institutional trading, monitoring and management platform.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit(
              onSubmit,
            )
          }
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="username"
              className="text-sm font-semibold"
            >
              Username
            </label>

            <div className="relative mt-2">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />

              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                {...register(
                  "username",
                  {
                    required:
                      "Username is required.",

                    minLength: {
                      value: 3,
                      message:
                        "Username must contain at least three characters.",
                    },
                  },
                )}
                className={cn(
                  "h-12 w-full rounded-xl border bg-[var(--surface-elevated)] pl-11 pr-4 text-sm outline-none transition",
                  errors.username
                    ? "border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--accent)]",
                )}
              />
            </div>

            {errors.username ? (
              <p className="mt-2 text-xs text-[var(--danger)]">
                {errors.username.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold"
            >
              Password
            </label>

            <div className="relative mt-2">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register(
                  "password",
                  {
                    required:
                      "Password is required.",
                  },
                )}
                className={cn(
                  "h-12 w-full rounded-xl border bg-[var(--surface-elevated)] pl-11 pr-12 text-sm outline-none transition",
                  errors.password
                    ? "border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--accent)]",
                )}
              />

              <button
                type="button"
                onClick={() => {
                  setShowPassword(
                    (
                      current,
                    ) => !current,
                  );
                }}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] transition hover:text-[var(--foreground)]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {errors.password ? (
              <p className="mt-2 text-xs text-[var(--danger)]">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {serverError ? (
            <div className="rounded-xl border border-[color:rgba(239,98,98,0.28)] bg-[color:rgba(239,98,98,0.07)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--danger)]">
                Sign-in failed
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                {serverError}
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-bold text-[#0a0e14] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />

                Signing in
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />

                Sign in securely
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
          <p className="text-xs text-[var(--foreground-subtle)]">
            Protected founder and user access
          </p>

          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}