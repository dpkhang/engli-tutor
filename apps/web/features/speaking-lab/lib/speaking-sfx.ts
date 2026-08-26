/** Lightweight UI sounds via Web Audio (no asset files). */

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AC();
  }
  return sharedCtx;
}

async function ensureRunning(ctx: AudioContext) {
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }
}

function tone(
  ctx: AudioContext,
  {
    freq,
    duration,
    type = "sine",
    gain = 0.05,
    when = 0,
    slideTo,
  }: {
    freq: number;
    duration: number;
    type?: OscillatorType;
    gain?: number;
    when?: number;
    slideTo?: number;
  },
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(40, slideTo),
      ctx.currentTime + when + duration,
    );
  }
  g.gain.setValueAtTime(0.0001, ctx.currentTime + when);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + duration + 0.02);
}

export const speakingSfx = {
  async recStart() {
    const ctx = getCtx();
    if (!ctx) return;
    await ensureRunning(ctx);
    tone(ctx, { freq: 280, duration: 0.14, gain: 0.028, type: "sine", slideTo: 360 });
  },
  async recStop() {
    const ctx = getCtx();
    if (!ctx) return;
    await ensureRunning(ctx);
    tone(ctx, { freq: 340, duration: 0.12, gain: 0.024, type: "sine", slideTo: 240 });
  },
  async send() {
    const ctx = getCtx();
    if (!ctx) return;
    await ensureRunning(ctx);
    tone(ctx, { freq: 320, duration: 0.1, gain: 0.022, type: "sine" });
    tone(ctx, { freq: 420, duration: 0.14, gain: 0.018, when: 0.07, type: "sine" });
  },
  async aiReady() {
    const ctx = getCtx();
    if (!ctx) return;
    await ensureRunning(ctx);
    tone(ctx, { freq: 260, duration: 0.18, gain: 0.022, type: "sine", slideTo: 380 });
  },
  async error() {
    const ctx = getCtx();
    if (!ctx) return;
    await ensureRunning(ctx);
    tone(ctx, { freq: 200, duration: 0.16, gain: 0.028, type: "triangle", slideTo: 150 });
  },
};
