"use client";

import { useMemo, useState, useEffect, type FormEvent, type JSX } from "react";
import { z } from "zod";
import Link from "next/link";

const RegisterSchema = z.object({
  username: z
    .string({ error: "Kullanıcı adı zorunlu" })
    .min(3, "Kullanıcı adı en az 3 karakter olmalı")
    .max(20, "Kullanıcı adı en fazla 20 karakter olabilir")
    .regex(/^[a-zA-Z0-9_]+$/, "Sadece harf, rakam ve alt çizgi kullanılabilir"),
  email: z
    .string({ error: "E-posta zorunlu" })
    .email("Geçerli bir e-posta girin"),
  password: z
    .string({ error: "Şifre zorunlu" })
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(/[A-Z]/, "En az bir büyük harf içermeli")
    .regex(/[a-z]/, "En az bir küçük harf içermeli")
    .regex(/[0-9]/, "En az bir rakam içermeli"),
  confirmPassword: z
    .string({ error: "Şifre tekrarı zorunlu" }),
  city: z
    .string({ error: "Şehir seçimi zorunlu" })
    .min(1, "Lütfen bir şehir seçin"),
  terms: z
    .boolean()
    .refine((val) => val === true, "Kullanım koşullarını kabul etmelisiniz"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type RegisterSchemaInput = z.infer<typeof RegisterSchema>;

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

const initialValues: RegisterSchemaInput = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  city: "",
  terms: false,
};

const cities = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", 
  "Adana", "Konya", "Gaziantep", "Mersin", "Diyarbakır",
  "Kayseri", "Samsun", "Denizli", "Eskişehir", "Trabzon"
];

export function RegisterForm(): JSX.Element {
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Calculate password strength
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState({ status: "submitting", message: "Kayıt işlemi başlatılıyor..." });

    const result = RegisterSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach((issue) => {
        const [field] = issue.path as [keyof RegisterSchemaInput?];
        if (field) {
          fieldErrors[field] = issue.message;
        }
      });

      setFormErrors(fieldErrors);
      setFormState({ status: "error", message: "Lütfen tüm alanları kontrol edin" });
      return;
    }

    setFormErrors({});

    const fakeLatencyMs = 1500;

    window.setTimeout(() => {
      setFormState({
        status: "success",
        message: "Başarıyla kaydoldun! 🎉 +50 XP kazandın!",
      });
    }, fakeLatencyMs);
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-500";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    if (passwordStrength === 4) return "bg-green-500";
    return "bg-emerald-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Çok Zayıf";
    if (passwordStrength === 2) return "Zayıf";
    if (passwordStrength === 3) return "Orta";
    if (passwordStrength === 4) return "Güçlü";
    return "Çok Güçlü";
  };

  return (
    <form 
      className={`mt-6 space-y-3 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} 
      onSubmit={handleSubmit} 
      noValidate
    >
      {/* Username Field */}
      <div className="animate-stagger stagger-delay-1">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          Kullanıcı Adı
          <div 
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.username
                ? 'border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]'
                : formErrors.username 
                ? 'border-rose-400/60 bg-rose-500/10 animate-shake' 
                : 'border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15'
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.username ? 'text-[#7dcfff] scale-110' : 'text-[#7dcfff]/70'
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
              placeholder="nexauser"
              value={values.username}
              onChange={(event) => handleChange("username")(event.currentTarget.value)}
              onFocus={() => setInputFocus(prev => ({ ...prev, username: true }))}
              onBlur={() => setInputFocus(prev => ({ ...prev, username: false }))}
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

      {/* Email Field */}
      <div className="animate-stagger stagger-delay-2">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          E-posta
          <div 
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.email
                ? 'border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]'
                : formErrors.email 
                ? 'border-rose-400/60 bg-rose-500/10 animate-shake' 
                : 'border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15'
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.email ? 'text-[#7dcfff] scale-110' : 'text-[#7dcfff]/70'
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
              placeholder="ornek@aa.com.tr"
              value={values.email}
              onChange={(event) => handleChange("email")(event.currentTarget.value)}
              onFocus={() => setInputFocus(prev => ({ ...prev, email: true }))}
              onBlur={() => setInputFocus(prev => ({ ...prev, email: false }))}
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

      {/* Password Field */}
      <div className="animate-stagger stagger-delay-3">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          Şifre
          <div 
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.password
                ? 'border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]'
                : formErrors.password 
                ? 'border-rose-400/60 bg-rose-500/10 animate-shake' 
                : 'border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15'
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.password ? 'text-[#7dcfff] scale-110' : 'text-[#7dcfff]/70'
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
              placeholder="••••••••"
              value={values.password}
              onChange={(event) => handleChange("password")(event.currentTarget.value)}
              onFocus={() => setInputFocus(prev => ({ ...prev, password: true }))}
              onBlur={() => setInputFocus(prev => ({ ...prev, password: false }))}
              className="w-full bg-transparent text-[13px] sm:text-sm text-white placeholder:text-white/40 focus:outline-none"
              aria-invalid={Boolean(formErrors.password)}
              aria-describedby={formErrors.password ? "register-password-error" : undefined}
            />
          </div>
          {values.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < passwordStrength ? getPasswordStrengthColor() : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-white/60">{getPasswordStrengthText()}</span>
            </div>
          )}
          {formErrors.password ? (
            <span id="register-password-error" className="mt-1 block text-[11px] text-rose-200 animate-fade-in">
              {formErrors.password}
            </span>
          ) : null}
        </label>
      </div>

      {/* Confirm Password Field */}
      <div className="animate-stagger stagger-delay-4">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          Şifre Tekrar
          <div 
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.confirmPassword
                ? 'border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]'
                : formErrors.confirmPassword 
                ? 'border-rose-400/60 bg-rose-500/10 animate-shake' 
                : 'border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15'
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.confirmPassword ? 'text-[#7dcfff] scale-110' : 'text-[#7dcfff]/70'
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
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={(event) => handleChange("confirmPassword")(event.currentTarget.value)}
              onFocus={() => setInputFocus(prev => ({ ...prev, confirmPassword: true }))}
              onBlur={() => setInputFocus(prev => ({ ...prev, confirmPassword: false }))}
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

      {/* City Selection */}
      <div className="animate-stagger stagger-delay-5">
        <label className="block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">
          Şehir
          <div 
            className={`mt-1.5 flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 ${
              inputFocus.city
                ? 'border-[#7dcfff] bg-white/20 shadow-[0_0_20px_rgba(125,207,255,0.3)]'
                : formErrors.city 
                ? 'border-rose-400/60 bg-rose-500/10 animate-shake' 
                : 'border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15'
            }`}
          >
            <svg
              aria-hidden
              className={`size-3.5 sm:size-4 flex-shrink-0 transition-all duration-300 ${
                inputFocus.city ? 'text-[#7dcfff] scale-110' : 'text-[#7dcfff]/70'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <select
              required
              value={values.city}
              onChange={(event) => handleChange("city")(event.currentTarget.value)}
              onFocus={() => setInputFocus(prev => ({ ...prev, city: true }))}
              onBlur={() => setInputFocus(prev => ({ ...prev, city: false }))}
              className="w-full bg-transparent text-[13px] sm:text-sm text-white placeholder:text-white/40 focus:outline-none cursor-pointer"
              aria-invalid={Boolean(formErrors.city)}
              aria-describedby={formErrors.city ? "register-city-error" : undefined}
            >
              <option value="" className="bg-[#0a2141] text-white">Şehir seçin</option>
              {cities.map(city => (
                <option key={city} value={city} className="bg-[#0a2141] text-white">
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

      {/* Terms Checkbox */}
      <div className="flex items-start gap-2 text-[11px] sm:text-xs text-white/70 animate-stagger stagger-delay-6 pt-1">
        <input
          type="checkbox"
          checked={values.terms}
          onChange={(event) => handleChange("terms")(event.currentTarget.checked)}
          className="size-3.5 sm:size-4 rounded border-white/20 bg-transparent text-[#7dcfff] focus:ring-1 focus:ring-[#7dcfff] transition-all duration-200 mt-0.5"
        />
        <label className="flex-1">
          <Link href="#" className="text-[#7dcfff] hover:text-white transition-colors">
            Kullanım koşullarını
          </Link> ve{' '}
          <Link href="#" className="text-[#7dcfff] hover:text-white transition-colors">
            gizlilik politikasını
          </Link> okudum ve kabul ediyorum.
        </label>
      </div>
      {formErrors.terms ? (
        <span className="text-[11px] text-rose-200 animate-fade-in">
          {formErrors.terms}
        </span>
      ) : null}

      {/* Submit Button */}
      <button
        type="submit"
        className={`flex w-full items-center justify-center rounded-full px-5 sm:px-6 py-3 sm:py-3.5 text-[13px] sm:text-sm font-semibold transition-all duration-300 animate-stagger stagger-delay-7 mt-5 ${
          isSubmitting 
            ? 'bg-[#7dcfff]/70 text-[#062444]/80 cursor-wait animate-pulse' 
            : isSuccess
            ? 'bg-emerald-500 text-white animate-bounce'
            : 'bg-gradient-to-r from-[#7dcfff] to-[#5bb5f0] text-[#062444] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(125,207,255,0.5)] hover:from-[#9ae0ff] hover:to-[#7dcfff] active:scale-95'
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
              Kayıt yapılıyor...
            </>
          ) : isSuccess ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Başarıyla kaydoldun!
            </>
          ) : (
            <>
              Kaydol ve başla
              <span className="inline-block ml-1.5 px-2 py-0.5 text-[10px] sm:text-xs bg-white/20 rounded-full animate-pulse">
                +50 XP
              </span>
            </>
          )}
        </span>
      </button>

      <p className="text-center text-[11px] sm:text-xs text-white/70 animate-fade-up pt-2" style={{ animationDelay: '0.8s' }}>
        Zaten hesabın var mı?{' '}
        <Link 
          className="font-semibold text-[#7dcfff] transition-all duration-300 hover:text-white hover:underline underline-offset-2 inline-block hover:translate-y-[-1px]" 
          href="/"
        >
          Giriş yap
        </Link>
      </p>
      
      <p 
        className={`text-center text-[10px] sm:text-xs font-medium transition-all duration-500 ${statusAccent} ${
          formState.message ? 'animate-fade-in' : ''
        } pt-3`} 
        aria-live="polite"
      >
        {formState.message ?? (
          <span className="animate-shimmer bg-clip-text text-transparent bg-gradient-to-r from-white/50 via-[#7dcfff] to-white/50">
            Nexachron&apos;a katıl, haberleri oyunlaştırılmış deneyimle yaşa
          </span>
        )}
      </p>
      
      {isSuccess ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-xs text-emerald-100 animate-scale-in">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hoşgeldin! Hesabın başarıyla oluşturuldu. +50 XP ile başlıyorsun! 🎉
          </div>
        </div>
      ) : null}
    </form>
  );
}
