"use client";

import { memo, useState, type FormEvent } from "react";
import Link from "next/link";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Mic2,
  ShieldCheck,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { BrandLogo, Button, Input, SegmentedSwitch } from "@engli-tutor/ui";
import { AnimatePresence, motion } from "motion/react";
import type { AuthFormValues } from "../../model/auth-schema";
import { SocialAuthButtons } from "../social-auth-buttons";
import { useMarketingI18n } from "@/features/i18n";
import { isLocale, type Locale } from "@engli-tutor/i18n";
import { usePathname } from "next/navigation";

export type AuthMode = "login" | "register";
type Props = {
  mode: AuthMode;
  pending: boolean;
  error: string | null;
  register: UseFormRegister<AuthFormValues>;
  errors: FieldErrors<AuthFormValues>;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function FieldMessage({ id, message }: { id: string; message?: string }) {
  return (
    <p
      id={id}
      className="min-h-4 pt-1 text-xs leading-4 text-rose-500"
      role={message ? "alert" : undefined}
    >
      {message ?? ""}
    </p>
  );
}

export const AuthPageView = memo(function AuthPageView({
  mode,
  pending,
  error,
  register,
  errors,
  onModeChange,
  onSubmit,
}: Props) {
  const t = useMarketingI18n();
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale: Locale = isLocale(segment) ? segment : "en";
  const localize = (href: string) => href.startsWith("/") ? `/${locale}${href}` : href;
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";
  const inputClass =
    "h-12 rounded-xl border-slate-200 bg-white/80 pl-11 shadow-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20";

  return (
    <main className="relative min-h-svh overflow-hidden bg-slate-950 font-sans">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,.38),transparent_35%),radial-gradient(circle_at_88%_88%,rgba(14,165,233,.24),transparent_35%),linear-gradient(135deg,#080b18_0%,#111735_48%,#080b18_100%)]"
      />
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 h-80 w-184 -translate-x-1/2 rounded-full bg-violet-500/15 blur-[110px]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] bg-size-[56px_56px] opacity-[0.035] mask-[linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <header className="marketing-container absolute inset-x-0 top-0 z-20 flex items-center justify-between py-5 sm:py-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 text-sm font-semibold tracking-wide text-white"
        >
          <BrandLogo size={32} wordmarkClassName="text-white" />
        </Link>
        <Link
          href="/"
          className="hidden text-sm text-white/55 transition-colors hover:text-white sm:block"
        >
          {t("auth.backHome")}
        </Link>
      </header>

      <div className="marketing-container marketing-page relative z-10 grid min-h-svh items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-10">
        <motion.section
          className="hidden min-w-0 lg:block"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-xl">
            <WandSparkles className="size-3.5" /> {t("auth.coach")}
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.07] tracking-[-0.045em] text-white xl:text-6xl">
            {t("auth.heroTitle")}{" "}
            <span className="bg-linear-to-r from-indigo-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">
              {t("auth.heroHighlight")}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300/75">
            {t("auth.heroDescription")}
          </p>

          <div className="relative mt-10 max-w-xl rounded-[1.6rem] border border-white/10 bg-white/6 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="rounded-[1.15rem] border border-white/10 bg-[#0d1227]/90 p-5">
              <div className="mb-5 flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-linear-to-br from-violet-400 to-indigo-600">
                    <Sparkles className="size-4 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{t("auth.dailySession")}</p>
                    <p className="text-xs text-white/40">{t("auth.workplace")}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  {t("auth.live")}
                </span>
              </div>
              <div className="space-y-3">
                <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-white/7 px-4 py-3 text-sm leading-6 text-white/75">
                  How would you introduce your idea in tomorrow&apos;s meeting?
                </div>
                <div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-md bg-indigo-500 px-4 py-3 text-sm leading-6 text-white">
                  I&apos;d start by explaining the problem our customers face...
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
                <button
                  type="button"
                  tabIndex={-1}
                  className="grid size-9 place-items-center rounded-full bg-white text-indigo-600"
                >
                  <Mic2 className="size-4" />
                </button>
                <div className="flex flex-1 items-center gap-1">
                  {[3, 6, 9, 5, 12, 8, 4, 10, 6, 3, 7, 4].map((height, index) => (
                    <span
                      key={index}
                      className="w-1 rounded-full bg-indigo-300/60"
                      style={{ height }}
                    />
                  ))}
                </div>
                <span className="text-xs text-white/35">{t("workspace.tapToSpeak")}</span>
              </div>
            </div>
            <motion.div
              className="absolute -right-7 -bottom-7 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/95 px-4 py-3 shadow-2xl shadow-black/25"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="grid size-8 place-items-center rounded-full bg-emerald-100">
                <ShieldCheck className="size-4 text-emerald-600" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-900">{t("auth.clarity")}</p>
                <p className="text-[11px] text-slate-500">{t("auth.pronunciation")}</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="mx-auto w-full min-w-0 max-w-124 rounded-[1.75rem] border border-white/40 bg-white/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,.4)] backdrop-blur-2xl sm:p-8 dark:border-white/10 dark:bg-slate-950/80"
          initial={{ opacity: 0, y: 20, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.48, delay: 0.08 }}
        >
          <div className="mb-5 sm:mb-6">
            <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-indigo-600 uppercase dark:text-indigo-300">
              {isLogin ? t("auth.welcomeBack") : t("auth.getStarted")}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white">
              {isLogin ? t("auth.signInTitle") : t("auth.createTitle")}
            </h2>
            <p className="mt-2.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {isLogin ? t("auth.continueWhereLeft") : t("auth.startConfidently")}
            </p>
          </div>

          <SegmentedSwitch
            value={mode}
            onChange={onModeChange}
            disabled={pending}
            ariaLabel={t("auth.modeLabel")}
            className="mb-5"
            options={[
              { id: "login", label: t("auth.signIn") },
              { id: "register", label: t("auth.signUp") },
            ]}
          />

          <SocialAuthButtons mode={mode} disabled={pending} />
          <div className="my-5 flex items-center gap-3 text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <span>{t("auth.orEmail")}</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <form className="space-y-0.5" onSubmit={onSubmit} noValidate aria-busy={pending}>
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.label
                  className="block overflow-hidden text-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
                    {t("auth.fullName")}
                  </span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder={t("auth.fullNamePlaceholder")}
                      autoComplete="name"
                      disabled={pending}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby="name-error"
                      className={inputClass}
                      {...register("name")}
                    />
                  </div>
                  <FieldMessage id="name-error" message={errors.name?.message ? t(errors.name.message) : undefined} />
                </motion.label>
              )}
            </AnimatePresence>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
                {t("auth.email")}
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={pending}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby="email-error"
                  className={inputClass}
                  {...register("email")}
                />
              </div>
              <FieldMessage id="email-error" message={errors.email?.message ? t(errors.email.message) : undefined} />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
                {t("auth.password")}
              </span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  disabled={pending}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby="password-error"
                  className={`${inputClass} pr-20`}
                  clearButtonClassName="right-11"
                  {...register("password")}
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldMessage id="password-error" message={errors.password?.message ? t(errors.password.message) : undefined} />
            </label>

            <p
              className="min-h-5 text-sm leading-5 text-rose-500"
              role={error ? "alert" : undefined}
            >
              {error ?? ""}
            </p>
            <Button
              type="submit"
              className="mt-2 h-12 w-full rounded-xl border-0 bg-linear-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110"
              size="lg"
              disabled={pending}
            >
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  <span>{isLogin ? t("auth.signingIn") : t("auth.creatingAccount")}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? t("auth.continue") : t("auth.createAccount")}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
            <span className="sr-only" aria-live="polite">
              {pending ? t("auth.requestProcessing") : ""}
            </span>
          </form>
          <div className="mt-6 space-y-2 text-center text-[11px] leading-5 text-slate-400 dark:text-slate-500">
            <p className="inline-flex items-center justify-center gap-2">
              <ShieldCheck className="size-3.5" />
              {t("auth.secureAuth")}
            </p>
            <p>
              <Link
                href={localize("/policy")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {t("auth.privacy")}
              </Link>
              {" · "}
              <Link
                href={localize("/policy/cookies")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {t("auth.cookies")}
              </Link>
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
});
