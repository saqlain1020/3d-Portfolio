import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeader, Reveal } from "../components/ui";
import { useInView } from "../lib/hooks";
import { game, useGame } from "../game/store";
import { sfx } from "../game/sfx";
import type { StackerApi, Status } from "../three/Stacker";

const Stacker = lazy(() => import("../three/Stacker"));

const hash = () => "0x" + Array.from({ length: 10 }, () => "0123456789abcdef"[(Math.random() * 16) | 0]).join("");

export default function Arcade() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const [mountRef, mount] = useInView<HTMLDivElement>("600px", true);
  const api = useRef<StackerApi | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [pop, setPop] = useState<{ k: number; text: string } | null>(null);
  const [blockHash, setBlockHash] = useState("0x0000000000");
  const high = useGame((s) => s.highScore);
  const scoreRef = useRef(0);

  const start = () => {
    setScore(0);
    scoreRef.current = 0;
    api.current?.start();
    sfx.click();
  };

  const onStatus = (s: Status) => {
    setStatus(s);
    if (s === "over") {
      sfx.fail();
      game.score(scoreRef.current);
      if (scoreRef.current > 0) game.addXp(Math.min(scoreRef.current * 2, 60));
    }
  };

  const onScore = (n: number, perfect: boolean, combo: number) => {
    setScore(n);
    scoreRef.current = n;
    setBlockHash(hash());
    if (n === 1) game.unlock("miner");
    if (perfect) {
      sfx.perfect(Math.min(combo, 10));
      game.unlock("perfect");
      setPop({ k: Date.now(), text: combo > 1 ? `PERFECT ×${combo}` : "PERFECT" });
    } else sfx.drop(Math.min(n, 20));
  };

  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || (e.target instanceof Element && e.target.closest("input, textarea, button"))) return;
      e.preventDefault();
      if (status === "playing") api.current?.drop();
      else start();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, status]);

  return (
    <section id="arcade" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader world="3-1" kicker="Arcade" title="Mine the" accent="Chain.">
          A tiny 3D mini-game about the thing I do all day: stacking blocks on a chain. Tap or press <kbd className="text-lime font-mono">SPACE</kbd> to drop.
          Land perfect drops to grow your block back.
        </SectionHeader>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <Reveal>
            <div ref={mountRef} className="relative p-3 sm:p-4 bg-gradient-to-b from-[#1a1030] to-[#0b0b14] border border-violet/30 rounded-[28px] shadow-[0_0_80px_-30px_#8b6bff]">
              <div className="text-center py-2 mb-3 rounded-t-2xl bg-gradient-to-r from-magenta via-violet to-cyan">
                <span className="font-display font-black tracking-[0.2em] text-void text-sm sm:text-base">★ MINE THE CHAIN ★</span>
              </div>
              <div ref={ref} className="relative aspect-[4/5] sm:aspect-[16/11] rounded-xl overflow-hidden border-4 border-black scanlines select-none" data-hover>
                {mount && (
                  <Suspense fallback={<div className="absolute inset-0 grid place-items-center font-mono text-muted text-sm">Booting cabinet…</div>}>
                    <Stacker api={api} active={inView} onStatus={onStatus} onScore={onScore} />
                  </Suspense>
                )}

                <div className="absolute top-3 inset-x-3 flex justify-between font-mono pointer-events-none">
                  <div>
                    <div className="text-[10px] text-muted tracking-widest">BLOCKS</div>
                    <motion.div key={score} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="font-display text-3xl sm:text-4xl font-black origin-left">
                      {score}
                    </motion.div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted tracking-widest">HI-SCORE</div>
                    <div className="font-display text-xl text-amber font-bold">{Math.max(high, score)}</div>
                    <div className="text-[10px] text-lime/80 mt-1">#{score} {blockHash}</div>
                  </div>
                </div>

                <AnimatePresence>
                  {pop && (
                    <motion.div
                      key={pop.k}
                      initial={{ opacity: 0, y: 20, scale: 0.6 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: -40 }}
                      onAnimationComplete={() => setTimeout(() => setPop((p) => (p?.k === pop.k ? null : p)), 400)}
                      className="absolute top-1/4 inset-x-0 text-center font-display font-black text-2xl sm:text-3xl text-white glow-magenta pointer-events-none"
                    >
                      {pop.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {status !== "playing" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 grid place-items-center bg-void/55 backdrop-blur-[2px]"
                    >
                      <div className="text-center px-4">
                        {status === "over" ? (
                          <>
                            <div className="font-mono text-xs text-magenta tracking-[0.3em]">CHAIN HALTED</div>
                            <div className="font-display text-5xl sm:text-6xl font-black mt-2">{score}</div>
                            <div className="font-mono text-xs text-muted mt-1">blocks mined {score >= high && score > 0 ? "· NEW RECORD! 🎉" : ""}</div>
                          </>
                        ) : (
                          <div className="font-display text-3xl sm:text-5xl font-black glow-cyan" style={{ animation: "blink 1.2s steps(1) infinite" }}>
                            INSERT COIN
                          </div>
                        )}
                        <button onClick={start} className="pixel-btn mt-6 bg-lime text-void px-7 py-3 text-sm font-bold hover:shadow-[0_0_30px_#b6ff3b]">
                          {status === "over" ? "↻ Mine again" : "▶ Start mining"}
                        </button>
                        <div className="font-mono text-[10px] text-muted mt-3">TAP / CLICK / SPACE to drop</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <span className="w-10 h-10 rounded-full bg-magenta shadow-[inset_0_-4px_0_#0005,0_0_20px_#ff2bd688]" />
                <span className="w-10 h-10 rounded-full bg-cyan shadow-[inset_0_-4px_0_#0005,0_0_20px_#00e5ff88]" />
                <span className="w-10 h-10 rounded-full bg-lime shadow-[inset_0_-4px_0_#0005,0_0_20px_#b6ff3b88]" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-4">
              <div className="panel p-5">
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted mb-3">HOW TO PLAY</div>
                <ol className="space-y-2 text-sm text-white/80">
                  <li>
                    <span className="text-cyan font-mono">01</span> A block slides across the chain.
                  </li>
                  <li>
                    <span className="text-cyan font-mono">02</span> Drop it on the one below. Overhang gets sliced off.
                  </li>
                  <li>
                    <span className="text-cyan font-mono">03</span> Three perfect drops in a row grow it back.
                  </li>
                </ol>
              </div>
              <div className="panel p-5">
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted mb-3">BOUNTIES</div>
                {[
                  ["⛏️", "Mine 1 block", 1],
                  ["⛓️", "Mine 10 blocks", 10],
                  ["🐋", "Mine 25 blocks", 25],
                ].map(([icon, label, n]) => {
                  const done = high >= (n as number);
                  return (
                    <div key={label as string} className={`flex items-center gap-3 py-2 text-sm ${done ? "text-lime" : "text-white/70"}`}>
                      <span className={done ? "" : "grayscale opacity-60"}>{icon}</span>
                      <span className="flex-1">{label}</span>
                      <span className="font-mono text-xs">{done ? "✓" : `${Math.min(high, n as number)}/${n}`}</span>
                    </div>
                  );
                })}
              </div>
              <div className="panel p-5 font-mono text-xs text-muted leading-relaxed">
                <span className="text-amber">FUN FACT:</span> in real life I've shipped batch-withdrawal contracts and cross-chain tokens. Much less forgiving than this game.
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
