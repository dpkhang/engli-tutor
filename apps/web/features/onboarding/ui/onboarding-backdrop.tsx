export function OnboardingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,hsl(var(--primary)/0.22),transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_80%,hsl(200_90%_60%/0.16),transparent_42%)]" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      <div className="onboarding-orb absolute -top-24 -left-16 size-[28rem] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.38),transparent_64%)] blur-2xl" />
      <div className="onboarding-orb-alt absolute top-[18%] -right-24 size-[26rem] rounded-full bg-[radial-gradient(circle,hsl(200_92%_62%/0.32),transparent_62%)] blur-2xl" />
      <div className="onboarding-orb-pulse absolute bottom-[-8rem] left-1/3 size-[22rem] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.28),transparent_66%)] blur-3xl" />
      <div className="onboarding-orb absolute bottom-10 right-[12%] size-40 rounded-full border border-primary/20 bg-primary/10" />
      <div className="onboarding-orb-alt absolute top-28 left-[12%] size-24 rounded-full border border-white/30 bg-white/20 dark:border-white/10 dark:bg-white/5" />
    </div>
  );
}
