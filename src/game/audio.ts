// Shared WebAudio graph: sfx bus + music bus → master → compressor → speakers.
// The compressor lets us push levels hard without clipping when sounds stack up.
type Graph = { ctx: AudioContext; master: GainNode; sfx: GainNode; music: GainNode };

let graph: Graph | null = null;

export const SFX_LEVEL = 5;
export const MUSIC_LEVEL = 0.55;

export function getAudio(): Graph | null {
  if (graph) return graph;
  try {
    const ctx = new AudioContext();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 8;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;
    const master = ctx.createGain();
    master.gain.value = 1;
    const sfx = ctx.createGain();
    sfx.gain.value = SFX_LEVEL;
    const music = ctx.createGain();
    music.gain.value = 0;
    sfx.connect(master);
    music.connect(master);
    master.connect(comp).connect(ctx.destination);
    graph = { ctx, master, sfx, music };

    // Don't keep a synth running in a background tab.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) ctx.suspend();
      else if (wantsAudio()) ctx.resume();
    });
  } catch {
    graph = null;
  }
  return graph;
}

let wants = () => false;
const wantsAudio = () => wants();
export const setWantsAudio = (fn: () => boolean) => (wants = fn);
