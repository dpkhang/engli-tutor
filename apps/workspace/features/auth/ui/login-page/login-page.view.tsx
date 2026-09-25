"use client";

import { memo, useState, type FormEvent } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Eye,
  EyeOff,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { BrandLogo, Button, Input, SegmentedSwitch } from "@engli-tutor/ui";
import type { LoginFormValues } from "../../model/login-schema";

export type AuthMode = "login" | "register";
export type LoginPageViewProps = {
  mode: AuthMode;
  pending: boolean;
  error: string | null;
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  policyHref: string;
  cookiesHref: string;
  homeHref: string;
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

export const LoginPageView = memo(function LoginPageView({
  mode,
  pending,
  error,
  register,
  errors,
  policyHref,
  cookiesHref,
  homeHref,
  onModeChange,
  onSubmit,
}: LoginPageViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";
  const inputClass =
    "h-12 rounded-xl border-slate-200 bg-white/80 pl-10 shadow-none transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-primary focus-visible:ring-primary/15 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20";

  return (
    <main className="relative flex h-svh flex-col overflow-hidden bg-slate-950">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,hsl(var(--primary)/0.35),transparent_36%),radial-gradient(circle_at_92%_92%,hsl(var(--primary)/0.12),transparent_34%),linear-gradient(160deg,#070a15_0%,#111633_52%,#080b18_100%)]"
      />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
        <a href={homeHref} className="group inline-flex items-center gap-2.5 text-white">
          <BrandLogo size={28} wordmarkClassName="text-white" />
          <span className="text-sm font-normal text-white/45">Workspace</span>
        </a>
        <span className="hidden items-center gap-2 text-xs text-white/45 sm:flex">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          All systems operational
        </span>
      </header>

      <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-7xl flex-1 items-center gap-6 px-5 py-3 sm:px-8 lg:grid-cols-[minmax(0,1fr)_30rem] lg:gap-8 lg:px-10">
        <section className="auth-enter-panel hidden max-h-full min-h-0 overflow-hidden pr-2 lg:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-indigo-200">
            <LayoutDashboard className="size-3.5" />
            Everything you need, in one place
          </div>
          <h1 className="max-w-2xl text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.045em] text-white">
            Your learning.
            <br />
            <span className="bg-linear-to-r from-primary via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Beautifully organized.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300/70">
            Plan lessons, continue practice, and see your English improve—all from one focused
            workspace.
          </p>

          <div className="relative mt-6 max-w-2xl rounded-[1.45rem] border border-white/10 bg-white/6 p-3 shadow-2xl shadow-black/35">
            <div className="overflow-hidden rounded-[1.15rem] border border-white/10 bg-[#0d1227]/95">
              <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3">
                <span className="size-2.5 rounded-full bg-rose-400/80" />
                <span className="size-2.5 rounded-full bg-amber-300/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-[11px] text-white/30">app.english-tutor.ai</span>
              </div>
              <div className="grid grid-cols-[3.5rem_1fr]">
                <div className="flex flex-col items-center gap-4 border-r border-white/8 py-4 text-white/35">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </span>
                  <LayoutDashboard className="size-4 text-white" />
                  <BookOpen className="size-4" />
                  <BarChart3 className="size-4" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-white/35">Good morning, Alex</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    Ready for today&apos;s practice?
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2.5">
                    {[
                      {
                        label: "Day streak",
                        value: "12",
                        color: "from-orange-400/20 to-orange-400/5",
                      },
                      {
                        label: "Words learned",
                        value: "348",
                        color: "from-primary/25 to-primary/5",
                      },
                      { label: "CEFR level", value: "B1", color: "from-cyan-400/20 to-cyan-400/5" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-xl border border-white/8 bg-linear-to-br ${item.color} p-3`}
                      >
                        <p className="text-[10px] text-white/40">{item.label}</p>
                        <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-primary/20">
                      <BookOpen className="size-4 text-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white">Workplace English</p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-white/8">
                        <div className="h-full w-[68%] rounded-full bg-primary" />
                      </div>
                    </div>
                    <span className="text-[10px] text-white/35">68%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-enter mx-auto w-full max-w-lg rounded-3xl border border-white/40 bg-white/97 px-6 py-8 shadow-[0_24px_70px_rgba(0,0,0,.42)] sm:px-8 lg:max-w-none dark:border-white/10 dark:bg-slate-950/90">
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              {isLogin ? "Welcome back" : "Join the workspace"}
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white">
              {isLogin ? "Sign in to continue" : "Create your account"}
            </h2>
            <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-slate-400">
              {isLogin
                ? "Your workspace is ready when you are."
                : "Set up your personal learning workspace."}
            </p>
          </div>

          <SegmentedSwitch
            value={mode}
            onChange={onModeChange}
            disabled={pending}
            ariaLabel="Authentication mode"
            className="mb-6"
            options={[
              { id: "login", label: "Sign in" },
              { id: "register", label: "Sign up" },
            ]}
          />

          <form className="space-y-0.5" onSubmit={onSubmit} noValidate aria-busy={pending}>
            <div className="auth-field-reveal" data-open={!isLogin || undefined}>
              <div>
                <label className="block pb-0.5 text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
                    Full name
                  </span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Your full name"
                      autoComplete="name"
                      disabled={pending || isLogin}
                      tabIndex={isLogin ? -1 : undefined}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby="workspace-name-error"
                      className={inputClass}
                      {...register("name")}
                    />
                  </div>
                  <FieldMessage id="workspace-name-error" message={errors.name?.message} />
                </label>
              </div>
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
                Email address
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={pending}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby="workspace-email-error"
                  className={inputClass}
                  {...register("email")}
                />
              </div>
              <FieldMessage id="workspace-email-error" message={errors.email?.message} />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
                Password
              </span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  disabled={pending}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby="workspace-password-error"
                  className={`${inputClass} pr-11`}
                  {...register("password")}
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldMessage id="workspace-password-error" message={errors.password?.message} />
            </label>
            <p
              className="min-h-5 text-sm leading-5 text-rose-500"
              role={error ? "alert" : undefined}
            >
              {error ?? ""}
            </p>
            <Button
              type="submit"
              className="mt-2 h-12 w-full rounded-xl border-0 bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              size="lg"
              disabled={pending}
            >
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  <span>{isLogin ? "Opening workspace…" : "Creating workspace…"}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Open workspace" : "Create account"}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
            <span className="sr-only" aria-live="polite">
              {pending ? "Your request is being processed" : ""}
            </span>
          </form>
          <p className="mt-6 text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
            {isLogin ? "Secure authentication · Your data stays private." : "By creating an account you agree to our policies."}{" "}
            <a
              href={policyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Privacy Policy
            </a>
            {" · "}
            <a
              href={cookiesHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cookie Policy
            </a>
          </p>
        </section>
      </div>
    </main>
  );
});
