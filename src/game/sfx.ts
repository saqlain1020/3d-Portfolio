// Tiny WebAudio synth — every sound is generated, no audio files shipped.
import { getAudio } from "./audio";

let enabled = false;

export const setSoundEnabled = (on: boolean) => {
  enabled = on;
  if (on) getAudio()?.ctx.resume();
};

type Tone = { f: number; to?: number; d: number; type?: OscillatorType; v?: number; delay?: number };

const play = (tones: Tone[]) => {
  const a = enabled ? getAudio() : null;
  if (!a) return;
  const { ctx } = a;
  const now = ctx.currentTime;
  for (const t of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + (t.delay ?? 0);
    osc.type = t.type ?? "square";
    osc.frequency.setValueAtTime(t.f, start);
    if (t.to) osc.frequency.exponentialRampToValueAtTime(t.to, start + t.d);
    // Tiny attack avoids clicks now that levels are hotter.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(t.v ?? 0.05, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + t.d);
    osc.connect(gain).connect(a.sfx);
    osc.start(start);
    osc.stop(start + t.d + 0.03);
  }
};

export const sfx = {
  hover: () => play([{ f: 880, d: 0.04, type: "sine", v: 0.02 }]),
  click: () => play([{ f: 520, to: 260, d: 0.08, type: "square", v: 0.04 }]),
  open: () => play([{ f: 300, to: 900, d: 0.18, type: "sawtooth", v: 0.03 }]),
  close: () => play([{ f: 900, to: 250, d: 0.15, type: "sawtooth", v: 0.03 }]),
  xp: () =>
    play([
      { f: 660, d: 0.08, type: "square", v: 0.04 },
      { f: 990, d: 0.12, type: "square", v: 0.04, delay: 0.07 },
    ]),
  achievement: () =>
    play([
      { f: 523, d: 0.1, v: 0.05 },
      { f: 659, d: 0.1, v: 0.05, delay: 0.1 },
      { f: 784, d: 0.1, v: 0.05, delay: 0.2 },
      { f: 1047, d: 0.35, v: 0.05, delay: 0.3, type: "triangle" },
    ]),
  levelUp: () =>
    play([
      { f: 392, d: 0.12, v: 0.05 },
      { f: 523, d: 0.12, v: 0.05, delay: 0.12 },
      { f: 659, d: 0.12, v: 0.05, delay: 0.24 },
      { f: 784, d: 0.12, v: 0.05, delay: 0.36 },
      { f: 1047, d: 0.5, v: 0.06, delay: 0.48, type: "triangle" },
    ]),
  drop: (pitch = 0) => play([{ f: 220 + pitch * 18, to: 110 + pitch * 9, d: 0.12, type: "triangle", v: 0.08 }]),
  perfect: (pitch = 0) =>
    play([
      { f: 700 + pitch * 30, d: 0.08, type: "sine", v: 0.06 },
      { f: 1050 + pitch * 30, d: 0.16, type: "sine", v: 0.05, delay: 0.06 },
    ]),
  fail: () =>
    play([
      { f: 300, to: 60, d: 0.6, type: "sawtooth", v: 0.05 },
      { f: 200, to: 40, d: 0.7, type: "square", v: 0.03, delay: 0.05 },
    ]),
  key: () => play([{ f: 1200 + Math.random() * 400, d: 0.015, type: "square", v: 0.012 }]),
  warp: () => play([{ f: 80, to: 1600, d: 0.9, type: "sawtooth", v: 0.035 }]),
};
