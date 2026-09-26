import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "../game/store";
import { byId, titleFor } from "../game/achievements";

export default function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="fixed z-[90] bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 flex flex-col gap-2 w-[min(92vw,360px)] pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          if (t.kind === "level") {
            return (
              <motion.div
                key={t.key}
                layout
                initial={{ opacity: 0, scale: 0.6, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, x: 80 }}
                className="panel corner p-4 text-center overflow-hidden"
                style={{ ["--c" as string]: "#b6ff3b" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-lime/20 via-cyan/20 to-magenta/20 animate-pulse" />
                <div className="relative font-mono text-xs text-lime tracking-[0.3em]">LEVEL UP!</div>
                <div className="relative font-display text-3xl font-black mt-1">LVL {t.level}</div>
                <div className="relative text-xs text-muted mt-1">New title: {titleFor(t.level ?? 1)}</div>
              </motion.div>
            );
          }
          const a = byId[t.id];
          return (
            <motion.div
              key={t.key}
              layout
              initial={{ opacity: 0, x: 80, rotateX: 60 }}
              animate={{ opacity: 1, x: 0, rotateX: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="panel flex items-center gap-3 p-3 border-l-4 border-l-amber"
            >
              <motion.div
                initial={{ rotate: -30, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.15, type: "spring" }}
                className="text-3xl w-12 h-12 grid place-items-center bg-amber/10 shrink-0"
              >
                {a.icon}
              </motion.div>
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-amber tracking-widest">ACHIEVEMENT UNLOCKED</div>
                <div className="font-bold">{a.title}</div>
                <div className="text-xs text-muted truncate">{a.desc}</div>
              </div>
              <div className="ml-auto font-mono text-lime text-sm shrink-0">+{a.xp}</div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
