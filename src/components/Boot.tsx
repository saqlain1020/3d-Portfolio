import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { game } from "../game/store";

const LINES = [
  "SAQLAIN-OS v2.0.26 (c) 2019-2026",
  "Checking memory ............ 7 YEARS OK",
  "Mounting /frontend ......... React 19 ✓",
  "Mounting /backend .......... NestJS ✓",
  "Syncing chains ............. Base · Polygon · Arbitrum ✓",
  "Bridging via LayerZero ..... OFT peers linked ✓",
  "Waking AI agents ........... Google ADK online ✓",
  "Loading skill galaxy ....... 6 planets found",
  "Spawning player ............ READY",
];

export default function Boot({ onStart }: { onStart: () => void }) {
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const done = shown >= LINES.length && progress >= 100;

  useEffect(() => {
    if (shown >= LINES.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 140 + Math.random() * 160);
    return () => clearTimeout(t);
  }, [shown]);

  useEffect(() => {
    if (progress >= 100) return;
    const t = setTimeout(() => setProgress((p) => Math.min(100, p + 3 + Math.random() * 9)), 55);
    return () => clearTimeout(t);
  }, [progress]);

  const start = (withSound: boolean) => {
    if (leaving) return;
    if (withSound) {
      if (!game.get().sound) game.toggleSound();
      if (!game.get().music) game.toggleMusic();
    }
    setLeaving(true);
    setTimeout(() => {
      onStart();
      game.unlock("start");
    }, 750);
  };

  useEffect(() => {
    if (!done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") start(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <AnimatePresence>
      <motion.div
        key="boot"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-void scanlines overflow-hidden"
        animate={leaving ? { scaleY: [1, 0.004, 0.004], scaleX: [1, 1, 0], opacity: [1, 1, 0] } : {}}
        transition={{ duration: 0.7, times: [0, 0.55, 1], ease: "easeIn" }}
      >
        <div className="absolute inset-0 grid-floor opacity-60" />
        <div className="relative w-full max-w-2xl px-5 font-mono text-[13px] sm:text-sm">
          <div className="min-h-[260px] space-y-1 text-lime/90">
            {LINES.slice(0, shown).map((l, i) => (
              <div key={i} className={i === 0 ? "text-cyan mb-3" : ""}>
                <span className="text-muted mr-2">&gt;</span>
                {l}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-muted text-xs mb-2">
              <span>LOADING WORLD</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="h-3 border border-cyan/40 p-[2px]">
              <div
                className="h-full bg-gradient-to-r from-cyan via-violet to-magenta transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="h-44 mt-10 flex flex-col items-center justify-center">
            {done && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div
                  className="font-display text-4xl sm:text-6xl font-black tracking-tight glitch glow-cyan"
                  data-text="PRESS START"
                  style={{ animation: "blink 1.2s steps(1) infinite" }}
                >
                  PRESS START
                </div>
                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => start(true)}
                    className="pixel-btn bg-cyan text-void px-6 py-3 text-sm font-bold hover:shadow-[0_0_30px_#00e5ff]"
                  >
                    ▶ Start with sound
                  </button>
                  <button
                    onClick={() => start(false)}
                    className="pixel-btn border border-white/20 px-6 py-3 text-sm text-white/70 hover:text-white hover:border-white/50"
                  >
                    Start muted
                  </button>
                </div>
                <p className="mt-5 text-muted text-xs">Press ENTER · progress is saved in your browser</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
