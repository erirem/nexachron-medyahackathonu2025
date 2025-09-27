"use client";

import { useEffect, useMemo, useState, type FormEvent, type JSX } from "react";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations, type TranslationValues } from "next-intl";

import { getSupabaseClient, getAccessToken } from "@/lib/supabase/client";

type RegisterSchemaInput = {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly city: string;
  readonly terms: boolean;
};

type FormState = {
  readonly status: "idle" | "submitting" | "success" | "error";
  readonly message?: string;
};

type FormErrors = Partial<Record<keyof RegisterSchemaInput, string>>;

type InputFocus = {
  username: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  city: boolean;
};

type TranslateFn = (key: string, values?: TranslationValues) => string;

type SupabaseErrorKey = "userExists" | "weakPassword";

const SUPABASE_ERROR_CODE_MAP: Record<string, SupabaseErrorKey> = {
  "User already registered": "userExists",
  "Password should be at least 6 characters": "weakPassword",
};

const initialValues: RegisterSchemaInput = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  city: "",
  terms: false,
};

function createRegisterSchema(t: TranslateFn) {
  return z
    .object({
      username: z
        .string()
        .min(1, { message: t("validation.username.required") })
        .min(3, { message: t("validation.username.min") })
        .max(20, { message: t("validation.username.max") })
        .regex(/^[a-zA-Z0-9_]+$/, t("validation.username.pattern")),
      email: z
        .string()
        .min(1, { message: t("validation.email.required") })
        .email({ message: t("validation.email.email") }),
      password: z
        .string()
        .min(1, { message: t("validation.password.required") })
        .min(8, { message: t("validation.password.min") })
        .regex(/[A-Z]/, t("validation.password.uppercase"))
        .regex(/[a-z]/, t("validation.password.lowercase"))
        .regex(/[0-9]/, t("validation.password.digit")),
      confirmPassword: z
        .string()
        .min(1, { message: t("validation.confirmPassword.required") }),
      city: z
        .string()
        .min(1, { message: t("validation.city.required") })
        .refine((value) => value.trim().length > 0, {
          message: t("validation.city.min"),
        }),
      terms: z.boolean().refine((value) => value === true, {
        message: t("validation.terms.accept"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.confirmPassword.match"),
      path: ["confirmPassword"],
    });
}

function mapSupabaseRegisterError(
  message: string,
  lookup: Record<SupabaseErrorKey, string>,
  fallback: string,
): string {
  const key = SUPABASE_ERROR_CODE_MAP[message];
  return key ? lookup[key] : fallback;
}

export function RegisterForm(): JSX.Element {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("register.form");
  const [values, setValues] = useState<RegisterSchemaInput>(initialValues);
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [inputFocus, setInputFocus] = useState<InputFocus>({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    city: false,
  });
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);
  const supabaseErrorMessages = useMemo(
    () => ({
      userExists: t("supabase.exists"),
      weakPassword: t("supabase.weakPassword"),
    }),
    [t],
  );
  const supabaseFallbackMessage = t("supabase.generic");

  const statusMessages = useMemo(
    () => ({
      default: t("status.default"),
      submitting: t("status.submitting"),
      invalid: t("status.invalid"),
      successEmail: t("status.successEmail"),
      successRedirect: t("status.successRedirect"),
      error: t("status.error"),
    }),
    [t],
  );

  const passwordStrengthLabels = useMemo(
    () => ({
      0: "",
      1: t("password.strength.1"),
      2: t("password.strength.2"),
      3: t("password.strength.3"),
      4: t("password.strength.4"),
      5: t("password.strength.5"),
    }),
    [t],
  );

  const cityOptions = useMemo(
    () => t.raw("cities") as string[],
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
      const token = (await getAccessToken(true)) ?? (await getAccessToken(false));
      if (token) {
        router.replace(`/${locale}/dashboard`);
      }
    };

    void detectExistingSession();
  }, [locale, router]);

  useEffect(() => {
    let strength = 0;
    if (values.password.length >= 8) strength++;
    if (/[A-Z]/.test(values.password)) strength++;
    if (/[a-z]/.test(values.password)) strength++;
    if (/[0-9]/.test(values.password)) strength++;
    if (/[^A-Za-z0-9]/.test(values.password)) strength++;
    setPasswordStrength(strength);
  }, [values.password]);

  const isSubmitting = formState.status === "submitting";
  const isSuccess = formState.status === "success";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState({ status: "submitting", message: statusMessages.submitting });

    const result = registerSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach((issue) => {
        const [field] = issue.path as Array<keyof RegisterSchemaInput | undefined>;
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
      const supabase = getSupabaseClient(true);
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            city: values.city,
          },
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/${locale}/dashboard` : undefined,
        },
      });

      if (error) {
        setFormState({
          status: "error",
          message: mapSupabaseRegisterError(
            error.message,
            supabaseErrorMessages,
            supabaseFallbackMessage,
          ),
        });
        return;
      }

      if (!data.session) {
        setFormState({
          status: "success",
          message: statusMessages.successEmail,
        });
        return;
      }

      setFormState({
        status: "success",
        message: statusMessages.successRedirect,
      });

      window.setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 500);
    } catch (error) {
      console.error("Supabase sign up failed", error);
      setFormState({
        status: "error",
        message: statusMessages.error,
      });
    }
  };

  const handleChange = <Field extends keyof RegisterSchemaInput>(field: Field) =>
    (value: RegisterSchemaInput[Field]) => {
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

  const passwordStrengthColor = useMemo(() => {
    if (passwordStrength === 0) return "bg-gray-500";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    if (passwordStrength === 4) return "bg-green-500";
    return "bg-emerald-500";
  }, [passwordStrength]);

  return (
    <form
      className={`mt-6 space-y-3 ${mounted ? "animate-fade-up" : "opacity-0"}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="animate-stagger stagger-delay-1">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          {t("fields.username.label")}
          <div
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.username
                ? "border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]"
                : formErrors.username
                  ? "border-rose-400/60 bg-rose-500/10 animate-shake"
                  : "border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15"
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.username ? "text-[#7dcfff] scale-110" : "text-[#7dcfff]/70"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.5 7.5C16.5 10.2614 14.2614 12.5 11.5 12.5C8.73858 12.5 6.5 10.2614 6.5 7.5C6.5 4.73858 8.73858 2.5 11.5 2.5C14.2614 2.5 16.5 4.73858 16.5 7.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3.5 21.5C3.5 17.0817 7.08172 13.5 11.5 13.5C15.9183 13.5 19.5 17.0817 19.5 21.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              required
              type="text"
              placeholder={t("fields.username.placeholder")}
              value={values.username}
              onChange={(event) => handleChange("username")(event.currentTarget.value)}
              onFocus={() => setInputFocus((previous) => ({ ...previous, username: true }))}
              onBlur={() => setInputFocus((previous) => ({ ...previous, username: false }))}
              className="w-full bg-transparent text-[13px] sm:text-sm text-white placeholder:text-white/40 focus:outline-none"
              aria-invalid={Boolean(formErrors.username)}
              aria-describedby={formErrors.username ? "register-username-error" : undefined}
            />
          </div>
          {formErrors.username ? (
            <span id="register-username-error" className="mt-1 block text-[11px] text-rose-200 animate-fade-in">
              {formErrors.username}
            </span>
          ) : null}
        </label>
      </div>

      <div className="animate-stagger stagger-delay-2">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          {t("fields.email.label")}
          <div
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
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
              aria-describedby={formErrors.email ? "register-email-error" : undefined}
            />
          </div>
          {formErrors.email ? (
            <span id="register-email-error" className="mt-1 block text-[11px] text-rose-200 animate-fade-in">
              {formErrors.email}
            </span>
          ) : null}
        </label>
      </div>

      <div className="animate-stagger stagger-delay-3">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          {t("fields.password.label")}
          <div
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
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
              autoComplete="new-password"
              placeholder={t("fields.password.placeholder")}
              value={values.password}
              onChange={(event) => handleChange("password")(event.currentTarget.value)}
              onFocus={() => setInputFocus((previous) => ({ ...previous, password: true }))}
              onBlur={() => setInputFocus((previous) => ({ ...previous, password: false }))}
              className="w-full bg-transparent text-[13px] sm:text-sm text-white placeholder:text-white/40 focus:outline-none"
              aria-invalid={Boolean(formErrors.password)}
              aria-describedby={formErrors.password ? "register-password-error" : undefined}
            />
          </div>
          {values.password ? (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      index < passwordStrength ? passwordStrengthColor : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-white/60">
                {passwordStrengthLabels[Math.min(passwordStrength, 5) as keyof typeof passwordStrengthLabels]}
              </span>
            </div>
          ) : null}
          {formErrors.password ? (
            <span id="register-password-error" className="mt-1 block text-[11px] text-rose-200 animate-fade-in">
              {formErrors.password}
            </span>
          ) : null}
        </label>
      </div>

      <div className="animate-stagger stagger-delay-4">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          {t("fields.confirmPassword.label")}
          <div
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.confirmPassword
                ? "border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]"
                : formErrors.confirmPassword
                  ? "border-rose-400/60 bg-rose-500/10 animate-shake"
                  : "border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15"
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.confirmPassword ? "text-[#7dcfff] scale-110" : "text-[#7dcfff]/70"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              required
              type="password"
              autoComplete="new-password"
              placeholder={t("fields.confirmPassword.placeholder")}
              value={values.confirmPassword}
              onChange={(event) => handleChange("confirmPassword")(event.currentTarget.value)}
              onFocus={() => setInputFocus((previous) => ({ ...previous, confirmPassword: true }))}
              onBlur={() => setInputFocus((previous) => ({ ...previous, confirmPassword: false }))}
              className="w-full bg-transparent text-[13px] sm:text-sm text-white placeholder:text-white/40 focus:outline-none"
              aria-invalid={Boolean(formErrors.confirmPassword)}
              aria-describedby={formErrors.confirmPassword ? "register-confirmPassword-error" : undefined}
            />
          </div>
          {formErrors.confirmPassword ? (
            <span id="register-confirmPassword-error" className="mt-1 block text-[11px] text-rose-200 animate-fade-in">
              {formErrors.confirmPassword}
            </span>
          ) : null}
        </label>
      </div>

      <div className="animate-stagger stagger-delay-5">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          {t("fields.city.label")}
          <div
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.city
                ? "border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]"
                : formErrors.city
                  ? "border-rose-400/60 bg-rose-500/10 animate-shake"
                  : "border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15"
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.city ? "text-[#7dcfff] scale-110" : "text-[#7dcfff]/70"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.75c4.556 0 8.25-3.694 8.25-8.25S16.556 5.25 12 5.25 3.75 8.944 3.75 13.5 7.444 21.75 12 21.75z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 9.75a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <select
              required
              value={values.city}
              onChange={(event) => handleChange("city")(event.currentTarget.value)}
              onFocus={() => setInputFocus((previous) => ({ ...previous, city: true }))}
              onBlur={() => setInputFocus((previous) => ({ ...previous, city: false }))}
              className="w-full appearance-none bg-transparent text-[13px] sm:text-sm text-white placeholder:text-white/40 focus:outline-none"
            >
              <option value="" className="text-[#020817]">
                {t("fields.city.placeholder")}
              </option>
              {cityOptions.map((city) => (
                <option key={city} value={city} className="text-[#020817]">
                  {city}
                </option>
              ))}
            </select>
          </div>
          {formErrors.city ? (
            <span id="register-city-error" className="mt-1 block text-[11px] text-rose-200 animate-fade-in">
              {formErrors.city}
            </span>
          ) : null}
        </label>
      </div>

      <div className="flex items-start gap-2 text-[11px] sm:text-xs text-white/70 animate-stagger stagger-delay-6 pt-1">
        <input
          type="checkbox"
          checked={values.terms}
          onChange={(event) => handleChange("terms")(event.currentTarget.checked)}
          className="size-3.5 sm:size-4 rounded border-white/20 bg-transparent text-[#7dcfff] focus:ring-1 focus:ring-[#7dcfff] transition-all duration-200 mt-0.5"
        />
        <span className="flex-1">
          {t.rich("fields.terms.agreement", {
            terms: (chunks) => (
              <Link href="#" className="text-[#7dcfff] hover:text-white transition-colors">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="#" className="text-[#7dcfff] hover:text-white transition-colors">
                {chunks}
              </Link>
            ),
          })}
        </span>
      </div>
      {formErrors.terms ? (
        <span className="text-[11px] text-rose-200 animate-fade-in">
          {formErrors.terms}
        </span>
      ) : null}

      <button
        type="submit"
        className={`flex w-full items-center justify-center rounded-full px-5 sm:px-6 py-3 sm:py-3.5 text-[13px] sm:text-sm font-semibold transition-all duration-300 animate-stagger stagger-delay-7 mt-5 ${
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
                {t("submit.badge")}
              </span>
            </>
          )}
        </span>
      </button>

      <p className="text-center text-[11px] sm:text-xs text-white/70 animate-fade-up pt-2" style={{ animationDelay: "0.8s" }}>
        {t("links.loginPrompt")} {" "}
        <Link
          className="font-semibold text-[#7dcfff] transition-all duration-300 hover:text-white hover:underline underline-offset-2 inline-block hover:translate-y-[-1px]"
          href={`/${locale}`}
        >
          {t("links.loginCta")}
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
            {t("messages.successCard")}
          </div>
        </div>
      ) : null}
    </form>
  );
}
