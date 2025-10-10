"use client";

import { useEffect, useMemo, useState, type FormEvent, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useLocale, useTranslations, type TranslationValues } from "next-intl";

import { getSupabaseClient, getAccessToken } from "@/lib/supabase/client";

type LoginSchemaInput = {
  readonly email: string;
  readonly password: string;
  readonly remember: boolean;
};

type FormState = {
  readonly status: "idle" | "submitting" | "success" | "error";
  readonly message?: string;
};

type FormErrors = Partial<Record<keyof LoginSchemaInput, string>>;

type InputFocus = {
  email: boolean;
  password: boolean;
};

type TranslateFn = (key: string, values?: TranslationValues) => string;

type SupabaseErrorKey = "invalidCredentials" | "emailNotConfirmed";

const SUPABASE_ERROR_CODE_MAP: Record<string, SupabaseErrorKey> = {
  "Invalid login credentials": "invalidCredentials",
  "Email not confirmed": "emailNotConfirmed",
};

const initialValues: LoginSchemaInput = {
  email: "",
  password: "",
  remember: true,
};

function createLoginSchema(t: TranslateFn) {
  return z.object({
    email: z
      .string()
      .min(1, { message: t("validation.email.required") })
      .min(5, { message: t("validation.email.min") })
      .email({ message: t("validation.email.email") }),
    password: z
      .string()
      .min(1, { message: t("validation.password.required") })
      .min(8, { message: t("validation.password.min") }),
    remember: z.boolean().default(true),
  });
}

function mapSupabaseAuthError(
  message: string,
  lookup: Record<SupabaseErrorKey, string>,
  fallback: string,
): string {
  const key = SUPABASE_ERROR_CODE_MAP[message];
  return key ? lookup[key] : fallback;
}

export function LoginForm(): JSX.Element {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("login.form");
  const [values, setValues] = useState<LoginSchemaInput>(initialValues);
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [inputFocus, setInputFocus] = useState<InputFocus>({
    email: false,
    password: false,
  });
  const [mounted, setMounted] = useState(false);

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const supabaseErrorMessages = useMemo(
    () => ({
      invalidCredentials: t("supabase.invalidCredentials"),
      emailNotConfirmed: t("supabase.emailNotConfirmed"),
    }),
    [t],
  );
  const supabaseFallbackMessage = t("supabase.generic");

  const statusMessages = useMemo(
    () => ({
      default: t("status.default"),
      submitting: t("status.submitting"),
      invalid: t("status.invalid"),
      success: t("status.success"),
      error: t("status.error"),
    }),
    [t],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void router.prefetch(`/${locale}/dashboard`);
  }, [locale, router]);

  useEffect(() => {
    const detectExistingSession = async () => {
      try {
        const token = (await getAccessToken(true)) ?? (await getAccessToken(false));
        if (token) {
          router.replace(`/${locale}/dashboard`);
        }
      } catch (error) {
        console.error('Error detecting existing session:', error);
      }
    };

    void detectExistingSession();
  }, [locale, router]);

  const isSubmitting = formState.status === "submitting";
  const isSuccess = formState.status === "success";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState({ status: "submitting", message: statusMessages.submitting });

    const result = loginSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach((issue) => {
        const [field] = issue.path as Array<keyof LoginSchemaInput | undefined>;
        if (field) {
          fieldErrors[field] = issue.message;
        }
      });

      setFormErrors(fieldErrors);
      setFormState({ status: "error", message: statusMessages.invalid });
      return;
    }

    setFormErrors({});

    try {
      const supabase = getSupabaseClient(values.remember);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setFormState({
          status: "error",
          message: mapSupabaseAuthError(
            error.message,
            supabaseErrorMessages,
            supabaseFallbackMessage,
          ),
        });
        return;
      }

      setFormState({
        status: "success",
        message: statusMessages.success,
      });

      window.setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 400);
    } catch (error) {
      console.error("Supabase login failed", error);
      setFormState({
        status: "error",
        message: statusMessages.error,
      });
    }
  };

  const handleChange = <Field extends keyof LoginSchemaInput>(field: Field) =>
    (value: LoginSchemaInput[Field]) => {
      setValues((previous) => ({
        ...previous,
        [field]: value,
      }));

      if (formErrors[field]) {
        setFormErrors((previous) => ({
          ...previous,
          [field]: undefined,
        }));
      }

      if (formState.status === "error") {
        setFormState({ status: "idle" });
      }
    };

  const statusAccent = useMemo(() => {
    switch (formState.status) {
      case "success":
        return "text-emerald-300";
      case "error":
        return "text-rose-300";
      default:
        return "text-white/70";
    }
  }, [formState.status]);

  return (
    <form
      className={`mt-6 space-y-4 ${mounted ? "animate-fade-up" : "opacity-0"}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="animate-stagger stagger-delay-1">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          {t("fields.email.label")}
          <div
            className={`mt-2 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.email
                ? "border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]"
                : formErrors.email
                  ? "border-rose-400/60 bg-rose-500/10 animate-shake"
                  : "border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15"
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.email ? "text-[#7dcfff] scale-110" : "text-[#7dcfff]/70"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.5 6.75L10.735 11.278c.741.543 1.79.543 2.53 0L19.5 6.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="3.75"
                y="5.25"
                width="16.5"
                height="13.5"
                rx="2.25"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <input
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t("fields.email.placeholder")}
              value={values.email}
              onChange={(event) => handleChange("email")(event.currentTarget.value)}
              onFocus={() => setInputFocus((previous) => ({ ...previous, email: true }))}
              onBlur={() => setInputFocus((previous) => ({ ...previous, email: false }))}
              className="w-full bg-transparent text-[13px] sm:text-sm text-white placeholder:text-white/40 focus:outline-none"
              aria-invalid={Boolean(formErrors.email)}
              aria-describedby={formErrors.email ? "login-email-error" : undefined}
            />
          </div>
          {formErrors.email ? (
            <span id="login-email-error" className="mt-1 block text-[11px] text-rose-200 animate-fade-in">
              {formErrors.email}
            </span>
          ) : null}
        </label>
      </div>
      <div className="animate-stagger stagger-delay-2">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          {t("fields.password.label")}
          <div
            className={`mt-2 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.password
                ? "border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]"
                : formErrors.password
                  ? "border-rose-400/60 bg-rose-500/10 animate-shake"
                  : "border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15"
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.password ? "text-[#7dcfff] scale-110" : "text-[#7dcfff]/70"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3.75"
                y="10.5"
                width="16.5"
                height="9.75"
                rx="2.25"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8.25 10.5V8.25a3.75 3.75 0 0 1 7.5 0V10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              required
              type="password"
              autoComplete="current-password"
              placeholder={t("fields.password.placeholder")}
              value={values.password}
              onChange={(event) => handleChange("password")(event.currentTarget.value)}
              onFocus={() => setInputFocus((previous) => ({ ...previous, password: true }))}
              onBlur={() => setInputFocus((previous) => ({ ...previous, password: false }))}
              className="w-full bg-transparent text-[13px] sm:text-sm text-white placeholder:text-white/40 focus:outline-none"
              aria-invalid={Boolean(formErrors.password)}
              aria-describedby={formErrors.password ? "login-password-error" : undefined}
            />
          </div>
          {formErrors.password ? (
            <span id="login-password-error" className="mt-1 block text-[11px] text-rose-200 animate-fade-in">
              {formErrors.password}
            </span>
          ) : null}
        </label>
      </div>
      <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/70 animate-stagger stagger-delay-3 pt-1">
        <label className="inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={values.remember}
            onChange={(event) => handleChange("remember")(event.currentTarget.checked)}
            className="size-3.5 sm:size-4 rounded border-white/20 bg-transparent text-[#7dcfff] focus:ring-1 focus:ring-[#7dcfff] transition-all duration-200 group-hover:scale-110"
          />
          <span className="transition-colors group-hover:text-white">
            {t("fields.remember")}
          </span>
        </label>
        <Link
          className="font-semibold text-[#7dcfff] transition-all duration-300 hover:text-white hover:translate-x-1 inline-block"
          href="#"
        >
          {t("fields.forgot")}
        </Link>
      </div>
      <button
        type="submit"
        className={`flex w-full items-center justify-center rounded-full px-5 sm:px-6 py-3 sm:py-3.5 text-[13px] sm:text-sm font-semibold transition-all duration-300 animate-stagger stagger-delay-4 mt-5 ${
          isSubmitting
            ? "bg-[#7dcfff]/70 text-[#062444]/80 cursor-wait animate-pulse"
            : isSuccess
              ? "bg-emerald-500 text-white animate-bounce"
              : "bg-gradient-to-r from-[#7dcfff] to-[#5bb5f0] text-[#062444] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(125,207,255,0.5)] hover:from-[#9ae0ff] hover:to-[#7dcfff] active:scale-95"
        } disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={isSubmitting}
      >
        <span className="relative flex items-center gap-2">
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("submit.loading")}
            </>
          ) : isSuccess ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t("submit.success")}
            </>
          ) : (
            <>
              {t("submit.default")}
              <span className="inline-block ml-1.5 px-2 py-0.5 text-[10px] sm:text-xs bg-white/20 rounded-full animate-pulse">
                {t("badges.xp")}
              </span>
            </>
          )}
        </span>
      </button>
      <p className="text-center text-[11px] sm:text-xs text-white/70 animate-fade-up pt-2" style={{ animationDelay: "0.5s" }}>
        {t("links.registerPrompt")} {" "}
        <Link
          className="font-semibold text-[#7dcfff] transition-all duration-300 hover:text-white hover:underline underline-offset-2 inline-block hover:translate-y-[-1px]"
          href={`/${locale}/register`}
        >
          {t("links.registerCta")}
        </Link>
      </p>
      <p
        className={`text-center text-[10px] sm:text-xs font-medium transition-all duration-500 ${statusAccent} ${
          formState.message ? "animate-fade-in" : ""
        } pt-3`}
        aria-live="polite"
      >
        {formState.message ?? (
          <span className="text-glow-muted">{statusMessages.default}</span>
        )}
      </p>
      {isSuccess ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-xs text-emerald-100 animate-scale-in">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("messages.demo")}
          </div>
        </div>
      ) : null}
    </form>
  );
}
