import { useSyncExternalStore } from "react";
import { byId, levelFromXp } from "./achievements";
import { setSoundEnabled, sfx } from "./sfx";
import { setMusic } from "./music";
import { setWantsAudio } from "./audio";
import { track } from "../lib/analytics";

type State = {
  xp: number;
  unlocked: string[];
  planets: string[];
  quests: string[];
  items: string[];
  npcs: number[];
  highScore: number;
  sound: boolean;
  music: boolean;
  godMode: boolean;
  terminalOpen: boolean;
  toasts: { key: number; id: string; kind: "achievement" | "level"; level?: number }[];
};

const KEY = "saqlain-portfolio-save-v2";

const load = (): Partial<State> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

const saved = load();

let state: State = {
  xp: saved.xp ?? 0,
  unlocked: saved.unlocked ?? [],
  planets: saved.planets ?? [],
  quests: saved.quests ?? [],
  items: saved.items ?? [],
  npcs: saved.npcs ?? [],
  highScore: saved.highScore ?? 0,
  sound: false,
  music: false,
  godMode: false,
  terminalOpen: false,
  toasts: [],
};

const listeners = new Set<() => void>();
let toastKey = 0;

const persist = () => {
  try {
    const { xp, unlocked, planets, quests, items, npcs, highScore } = state;
    localStorage.setItem(KEY, JSON.stringify({ xp, unlocked, planets, quests, items, npcs, highScore }));
  } catch {
    /* storage blocked — progress just won't persist */
  }
};

const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
};

const pushToast = (t: Omit<State["toasts"][number], "key">) => {
  const key = ++toastKey;
  set({ toasts: [...state.toasts, { ...t, key }] });
  setTimeout(() => set({ toasts: state.toasts.filter((x) => x.key !== key) }), 4200);
};

export const game = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  addXp(amount: number) {
    const before = levelFromXp(state.xp);
    set({ xp: state.xp + amount });
    const after = levelFromXp(state.xp);
    if (after > before) {
      sfx.levelUp();
      pushToast({ id: "level", kind: "level", level: after });
    } else {
      sfx.xp();
    }
  },

  unlock(id: string) {
    if (state.unlocked.includes(id) || !byId[id]) return;
    set({ unlocked: [...state.unlocked, id] });
    sfx.achievement();
    pushToast({ id, kind: "achievement" });
    track("achievement", id);
    setTimeout(() => game.addXp(byId[id].xp), 350);
  },

  visitPlanet(id: string, total: number) {
    if (state.planets.includes(id)) return;
    set({ planets: [...state.planets, id] });
    game.addXp(15);
    game.unlock("planet");
    if (state.planets.length >= total) game.unlock("cartographer");
  },

  readQuest(id: string, total: number) {
    if (state.quests.includes(id)) return;
    set({ quests: [...state.quests, id] });
    game.addXp(10);
    if (state.quests.length >= total) game.unlock("quests-all");
  },

  inspectItem(id: string, legendary: boolean) {
    if (legendary) game.unlock("loot");
    if (state.items.includes(id)) return;
    set({ items: [...state.items, id] });
    game.addXp(10);
    if (state.items.length >= 5) game.unlock("hoarder");
  },

  talkNpc(i: number, total: number) {
    if (state.npcs.includes(i)) return;
    set({ npcs: [...state.npcs, i] });
    if (state.npcs.length >= total) game.unlock("npc");
  },

  score(n: number) {
    if (n > state.highScore) set({ highScore: n });
    if (n >= 1) game.unlock("miner");
    if (n >= 10) game.unlock("miner-10");
    if (n >= 25) game.unlock("miner-25");
  },

  toggleSound() {
    const sound = !state.sound;
    setSoundEnabled(sound);
    set({ sound });
    if (sound) {
      sfx.click();
      game.unlock("sound");
    }
  },

  toggleMusic() {
    const music = !state.music;
    set({ music });
    setMusic(music);
    if (music) game.unlock("dj");
  },

  setGodMode(on: boolean) {
    set({ godMode: on });
    document.documentElement.classList.toggle("god-mode", on);
  },

  setTerminal(open: boolean) {
    set({ terminalOpen: open });
    if (open) {
      sfx.open();
      game.unlock("terminal");
    } else sfx.close();
  },

  reset() {
    set({ xp: 0, unlocked: [], planets: [], quests: [], items: [], npcs: [], highScore: 0 });
  },
};

setWantsAudio(() => state.sound || state.music);

export function useGame<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(game.subscribe, () => selector(state));
}
