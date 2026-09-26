import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { game, useGame } from "../game/store";
import { ACHIEVEMENTS, levelFromXp, titleFor, xpForLevel } from "../game/achievements";
import { sfx } from "../game/sfx";

export default function HUD({ visible }: { visible: boolean }) {
  const xp = useGame((s) => s.xp);
  const unlocked = useGame((s) => s.unlocked);
  const sound = useGame((s) => s.sound);
  const music = useGame((s) => s.music);
  const [open, setOpen] = useState(false);

  const level = levelFromXp(xp);
  const lo = xpForLevel(level);
  const hi = xpForLevel(level + 1);
  const pct = ((xp - lo) / (hi - lo)) * 100;

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: visible ? 0 : -80 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.3 }}
        className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 pointer-events-none"
      >
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
          <a href="#home" className="panel corner px-3 py-2 font-display font-black text-sm tracking-tight shrink-0" style={{ ["--c" as string]: "#ff2bd6" }}>
            S<span className="text-magenta">.</span>R
          </a>

          <div className="panel flex-1 min-w-0 max-w-md flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 font-mono text-[11px]">
            <div className="shrink-0 text-center leading-none">
              <div className="text-muted text-[9px]">LVL</div>
              <motion.div key={level} initial={{ scale: 1.8, color: "#b6ff3b" }} animate={{ scale: 1, color: "#fff" }} className="text-lg font-bold">
                {level}
              </motion.div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-muted mb-1">
                <span className="truncate hidden sm:inline">{titleFor(level).toUpperCase()}</span>
                <span className="shrink-0 ml-auto">
                  {xp - lo}/{hi - lo} XP
                </span>
              </div>
              <div className="h-2 bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-lime to-cyan shadow-[0_0_12px_#b6ff3b]"
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />
              </div>
            </div>
          </div>

          <div className="ml-auto flex gap-1.5 sm:gap-2 shrink-0">
            <HudBtn label="Achievements" onClick={() => { setOpen(true); sfx.open(); }}>
              <span>🏆</span>
              <span className="hidden sm:inline">
                {unlocked.length}/{ACHIEVEMENTS.length}
              </span>
            </HudBtn>
            <HudBtn label="Open terminal (`)" onClick={() => game.setTerminal(true)}>
              <span className="text-lime">&gt;_</span>
            </HudBtn>
            <HudBtn label={music ? "Stop music" : "Play music"} onClick={() => game.toggleMusic()}>
              <MusicIcon on={music} />
            </HudBtn>
            <HudBtn label={sound ? "Mute sound effects" : "Unmute sound effects"} onClick={() => game.toggleSound()}>
              {sound ? <SoundOn /> : <SoundOff />}
            </HudBtn>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>{open && <AchievementPanel onClose={() => { setOpen(false); sfx.close(); }} />}</AnimatePresence>
    </>
  );
}

function HudBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => sfx.hover()}
      className="panel h-10 min-w-10 px-2.5 sm:px-3 flex items-center justify-center gap-2 font-mono text-xs hover:border-cyan/60 hover:text-cyan transition-colors"
    >
      {children}
    </button>
  );
}

function AchievementPanel({ onClose }: { onClose: () => void }) {
  const unlocked = useGame((s) => s.unlocked);
  const xp = useGame((s) => s.xp);
  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-void/80 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-lenis-prevent
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="panel corner w-full max-w-3xl max-h-[85vh] overflow-auto p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="font-mono text-xs text-lime">// TROPHY ROOM</div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold mt-1">Achievements</h3>
            <p className="text-muted text-sm mt-1">
              {unlocked.length} of {ACHIEVEMENTS.length} unlocked · {xp} XP total
            </p>
          </div>
          <button onClick={onClose} className="font-mono text-muted hover:text-white text-sm">
            [ESC]
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.includes(a.id);
            const hidden = a.secret && !got;
            return (
              <div key={a.id} className={`flex gap-3 items-center p-3 border ${got ? "border-lime/40 bg-lime/5" : "border-white/5 opacity-60"}`}>
                <div className={`text-2xl w-10 h-10 grid place-items-center ${got ? "" : "grayscale"}`}>{hidden ? "❓" : a.icon}</div>
                <div className="min-w-0">
                  <div className="font-bold text-sm">{hidden ? "Secret achievement" : a.title}</div>
                  <div className="text-xs text-muted">{hidden ? "Keep exploring…" : a.desc}</div>
                </div>
                <div className={`ml-auto font-mono text-xs shrink-0 ${got ? "text-lime" : "text-muted"}`}>+{a.xp}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 text-xs text-muted font-mono">
          Hint: try the terminal (press <kbd className="text-lime">`</kbd>) and old-school cheat codes.{" "}
          <button className="underline hover:text-magenta ml-2" onClick={() => game.reset()}>
            reset save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const SoundOn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
  </svg>
);
const MusicIcon = ({ on }: { on: boolean }) => (
  <span className="relative flex items-end gap-[2px] h-4 w-4" aria-hidden>
    {[0.6, 1, 0.4, 0.8].map((h, i) => (
      <span
        key={i}
        className={`w-[3px] ${on ? "bg-magenta" : "bg-current opacity-50"}`}
        style={{ height: on ? undefined : "3px", animation: on ? `eq ${0.5 + i * 0.13}s ease-in-out ${i * 0.07}s infinite alternate` : "none", minHeight: 3, maxHeight: `${h * 100}%` }}
      />
    ))}
  </span>
);

const SoundOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="m23 9-6 6M17 9l6 6" />
  </svg>
);
