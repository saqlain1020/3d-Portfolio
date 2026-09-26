// Procedural synthwave background loop — generated live with WebAudio, no files.
// Lookahead scheduler: a timer queues notes ~150ms ahead on the audio clock so timing stays tight.
import { getAudio, MUSIC_LEVEL } from "./audio";

const BPM = 96;
const STEP = 60 / BPM / 4; // 16th note
const BAR = STEP * 16;
// Am · F · C · G, two bars each (MIDI notes)
const CHORDS = [
  [57, 60, 64],
  [53, 57, 60],
  [48, 52, 55],
  [55, 59, 62],
];
const ARP = [0, 1, 2, 1, 0, 2, 1, 2];
const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);

type Nodes = { pad: GainNode; padFilter: BiquadFilterNode; send: GainNode; noise: AudioBuffer };
let nodes: Nodes | null = null;
let timer: number | null = null;
let step = 0;
let nextTime = 0;
let playing = false;

function build(): Nodes | null {
  const a = getAudio();
  if (!a) return null;
  if (nodes) return nodes;
  const { ctx, music } = a;

  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 900;
  padFilter.Q.value = 0.7;
  const pad = ctx.createGain(); // ducked by the kick for the sidechain "pump"
  padFilter.connect(pad).connect(music);

  // Echo for the arp: dotted-8th feedback delay
  const send = ctx.createGain();
  const delay = ctx.createDelay(1);
  delay.delayTime.value = STEP * 3;
  const fb = ctx.createGain();
  fb.gain.value = 0.38;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2400;
  send.connect(delay).connect(tone).connect(fb).connect(delay);
  tone.connect(music);

  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  nodes = { pad, padFilter, send, noise };
  return nodes;
}

function env(g: GainNode, t: number, peak: number, attack: number, dur: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function voice(type: OscillatorType, freq: number, t: number, dur: number, peak: number, attack: number, dest: AudioNode, detune = 0) {
  const { ctx } = getAudio()!;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  env(g, t, peak, attack, dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
  return g;
}

function playStep(s: number, t: number) {
  const a = getAudio()!;
  const n = nodes!;
  const { ctx, music } = a;
  const bar = Math.floor(s / 16);
  const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length];
  const inBar = s % 16;

  // Pad: detuned saw stack, re-voiced every two bars
  if (s % 32 === 0) {
    for (const m of chord) {
      for (const d of [-9, 9]) voice("sawtooth", mtof(m), t, BAR * 2 + 0.4, 0.035, 0.8, n.padFilter, d);
    }
    voice("sine", mtof(chord[0] - 24), t, BAR * 2, 0.06, 0.6, music); // sub drone
  }
  // Slowly breathing filter over the 8-bar cycle
  if (inBar === 0) {
    const open = 700 + 900 * (0.5 + 0.5 * Math.sin((bar / 8) * Math.PI * 2));
    n.padFilter.frequency.setTargetAtTime(open, t, 1.2);
  }

  // Kick on every beat + sidechain duck on the pad
  if (inBar % 4 === 0) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    env(g, t, 0.55, 0.004, 0.32);
    o.connect(g).connect(music);
    o.start(t);
    o.stop(t + 0.35);
    n.pad.gain.cancelScheduledValues(t);
    n.pad.gain.setValueAtTime(0.35, t);
    n.pad.gain.linearRampToValueAtTime(1, t + STEP * 3.2);
  }

  // Off-beat hats
  if (inBar % 4 === 2) {
    const src = ctx.createBufferSource();
    src.buffer = n.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7500;
    const g = ctx.createGain();
    env(g, t, 0.07, 0.002, 0.05);
    src.connect(hp).connect(g).connect(music);
    src.start(t);
    src.stop(t + 0.08);
  }

  // Bass: driving 8ths on the root, octave pop on the last 8th
  if (s % 2 === 0) {
    const root = chord[0] - 24 + (inBar === 14 ? 12 : 0);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    lp.connect(music);
    voice("sawtooth", mtof(root), t, STEP * 1.7, 0.13, 0.008, lp);
  }

  // Arp (enters after the first 4 bars), into the echo
  if (bar % 16 >= 4) {
    const m = chord[ARP[s % ARP.length]] + 12;
    const g = voice("triangle", mtof(m), t, STEP * 0.9, 0.06, 0.004, music);
    g.connect(n.send);
  }
}

function tick() {
  const a = getAudio();
  if (!a || !nodes) return;
  while (nextTime < a.ctx.currentTime + 0.15) {
    playStep(step, nextTime);
    nextTime += STEP;
    step = (step + 1) % (16 * 32);
  }
}

export function setMusic(on: boolean) {
  const a = getAudio();
  if (!a || !build()) return;
  const { ctx, music } = a;
  const now = ctx.currentTime;
  music.gain.cancelScheduledValues(now);
  music.gain.setValueAtTime(music.gain.value, now);
  if (on) {
    ctx.resume();
    music.gain.linearRampToValueAtTime(MUSIC_LEVEL, now + 2);
    if (!playing) {
      playing = true;
      step = 0;
      nextTime = ctx.currentTime + 0.1;
      timer = window.setInterval(tick, 25);
    }
  } else {
    music.gain.linearRampToValueAtTime(0, now + 0.8);
    window.setTimeout(() => {
      if (music.gain.value < 0.01 && timer !== null) {
        clearInterval(timer);
        timer = null;
        playing = false;
      }
    }, 900);
  }
}
