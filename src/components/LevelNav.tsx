import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sections } from "../lib/data";
import { scrollTo } from "../lib/scroll";
import { sfx } from "../game/sfx";

// Right-edge level select: a vertical "world map" of the page.
export default function LevelNav({ visible }: { visible: boolean }) {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const idx = sections.findIndex((s) => s.id === active);

  return (
    <motion.nav
      initial={{ x: 80 }}
      animate={{ x: visible ? 0 : 80 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100, damping: 18 }}
      className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-4"
      aria-label="Level select"
    >
      <div className="absolute right-[5px] top-2 bottom-2 w-px bg-white/10" />
      <motion.div
        className="absolute right-[5px] top-2 w-px bg-gradient-to-b from-cyan to-magenta"
        animate={{ height: `${(idx / (sections.length - 1)) * 100}%` }}
      />
      {sections.map((s, i) => {
        const on = s.id === active;
        const passed = i <= idx;
        return (
          <button
            key={s.id}
            onClick={() => {
              sfx.click();
              scrollTo(`#${s.id}`);
            }}
            onMouseEnter={() => sfx.hover()}
            className="group relative flex items-center gap-3"
          >
            <span className={`font-mono text-[10px] tracking-widest transition-all opacity-0 group-hover:opacity-100 ${on ? "text-white" : "text-muted"}`}>
              <span className="text-cyan">{s.world}</span> {s.label.toUpperCase()}
            </span>
            <span
              className={`relative w-[11px] h-[11px] rotate-45 border transition-all ${on ? "bg-magenta border-magenta shadow-[0_0_14px_#ff2bd6] scale-125" : passed ? "bg-cyan/70 border-cyan" : "bg-void border-white/30"}`}
            />
          </button>
        );
      })}
    </motion.nav>
  );
}
