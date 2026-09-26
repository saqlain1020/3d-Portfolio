import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { archive, projects, type Project, type Rarity } from "../lib/data";
import { SectionHeader } from "../components/ui";
import { stopScroll } from "../lib/scroll";
import { game, useGame } from "../game/store";
import { sfx } from "../game/sfx";

const FILTERS: ("ALL" | Rarity)[] = ["ALL", "LEGENDARY", "EPIC", "RARE", "UNCOMMON"];
const RARITY_COLOR: Record<Rarity, string> = { LEGENDARY: "#ffb020", EPIC: "#c05cff", RARE: "#00a3ff", UNCOMMON: "#6bdc4a" };

export default function Inventory() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [item, setItem] = useState<Project | null>(null);
  const inspected = useGame((s) => s.items);
  const list = projects.filter((p) => filter === "ALL" || p.rarity === filter);

  const openItem = (p: Project) => {
    sfx.open();
    setItem(p);
    game.inspectItem(p.id, p.rarity === "LEGENDARY");
  };

  return (
    <section id="inventory" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader world="2-2" kicker="Inventory" title="Loot" accent="Collected.">
          Hand-picked builds, sorted by rarity. Hover to see the shine, click to inspect.{" "}
          <span className="text-muted">({inspected.length}/{projects.length} inspected)</span>
        </SectionHeader>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                sfx.click();
              }}
              className={`pixel-btn text-[11px] px-4 py-2 border transition-colors ${filter === f ? "bg-white text-void border-white" : "border-white/15 text-muted hover:text-white hover:border-white/40"}`}
              style={filter === f && f !== "ALL" ? { background: RARITY_COLOR[f], borderColor: RARITY_COLOR[f] } : undefined}
            >
              {f}
              <span className="ml-2 opacity-60">{f === "ALL" ? projects.length : projects.filter((p) => p.rarity === f).length}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 160, damping: 20 }}
                className={p.rarity === "LEGENDARY" && filter === "ALL" ? "sm:col-span-2" : ""}
              >
                <ItemCard p={p} big={p.rarity === "LEGENDARY" && filter === "ALL"} seen={inspected.includes(p.id)} onOpen={() => openItem(p)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <Archive />
      <AnimatePresence>{item && <ItemModal p={item} onClose={() => { setItem(null); sfx.close(); }} />}</AnimatePresence>
    </section>
  );
}

function ItemCard({ p, big, seen, onOpen }: { p: Project; big: boolean; seen: boolean; onOpen: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [t, setT] = useState({ x: 0, y: 0, gx: 50, gy: 50, on: false });
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setT({ x: (0.5 - py) * 12, y: (px - 0.5) * 14, gx: px * 100, gy: py * 100, on: true });
  };
  return (
    <div style={{ perspective: 1200 }} className="h-full">
      <button
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={() => sfx.hover()}
        onPointerLeave={() => setT({ x: 0, y: 0, gx: 50, gy: 50, on: false })}
        onClick={onOpen}
        className={`rarity-${p.rarity} group relative w-full h-full flex flex-col text-left bg-ink border border-[color:var(--r)]/30 overflow-hidden transition-[transform,box-shadow] duration-200 ease-out`}
        style={{
          transform: `rotateX(${t.x}deg) rotateY(${t.y}deg)`,
          boxShadow: t.on ? `0 20px 60px -15px var(--r), inset 0 0 0 1px var(--r)` : "0 0 0 0 transparent",
        }}
      >
        <div className={`relative overflow-hidden grow ${big ? "aspect-[16/8]" : "aspect-[16/10]"}`}>
          <img src={p.images[0]} alt={p.title} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
          <div className="absolute inset-0 holo opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundPosition: `${t.gx}% ${t.gy}%` }} />
          <div className="absolute top-3 left-3 font-mono text-[10px] font-bold tracking-widest px-2 py-1 text-void" style={{ background: "linear-gradient(90deg, var(--r), var(--r2))" }}>
            {p.rarity}
          </div>
          {!seen && <div className="absolute top-3 right-3 font-mono text-[10px] text-magenta bg-void/80 px-2 py-1 animate-pulse">NEW</div>}
        </div>
        <div className="p-5 relative">
          <div className="font-mono text-[10px] tracking-widest text-muted">{p.type.toUpperCase()}</div>
          <div className="flex items-end justify-between gap-3 mt-1">
            <h3 className={`font-display font-bold ${big ? "text-3xl" : "text-xl"}`}>{p.title}</h3>
            <div className="text-right shrink-0">
              <div className="font-mono text-[9px] text-muted">POWER</div>
              <div className="font-display font-black text-xl" style={{ color: "var(--r)" }}>
                {p.power}
              </div>
            </div>
          </div>
          {big && <p className="text-sm text-white/70 mt-3 max-w-xl">{p.desc}</p>}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {p.stack.slice(0, big ? 6 : 3).map((s) => (
              <span key={s} className="font-mono text-[10px] px-2 py-0.5 bg-white/5 text-white/70">
                {s}
              </span>
            ))}
          </div>
        </div>
        <span className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500" style={{ background: "linear-gradient(90deg, var(--r), var(--r2))" }} />
      </button>
    </div>
  );
}

function ItemModal({ p, onClose }: { p: Project; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const color = RARITY_COLOR[p.rarity];
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    stopScroll(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % p.images.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + p.images.length) % p.images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      stopScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [p]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-void/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, rotateX: 20, opacity: 0 }}
        animate={{ scale: 1, rotateX: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto overflow-x-hidden bg-ink border grid lg:grid-cols-[1.5fr_1fr]"
        style={{ borderColor: color + "66", boxShadow: `0 0 80px -20px ${color}` }}
        data-lenis-prevent
      >
        <div className="relative bg-black min-w-0">
          <div className="relative aspect-[16/10]">
            <AnimatePresence mode="wait">
              <motion.img
                key={idx}
                src={p.images[idx]}
                alt={`${p.title} screenshot ${idx + 1}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </AnimatePresence>
            {p.images.length > 1 && (
              <>
                <button onClick={() => setIdx((idx - 1 + p.images.length) % p.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 panel grid place-items-center hover:text-cyan" aria-label="Previous image">
                  ‹
                </button>
                <button onClick={() => setIdx((idx + 1) % p.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 panel grid place-items-center hover:text-cyan" aria-label="Next image">
                  ›
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2 p-3 overflow-x-auto">
            {p.images.map((src, i) => (
              <button key={src} onClick={() => setIdx(i)} className={`shrink-0 w-20 h-12 border-2 overflow-hidden transition-opacity ${i === idx ? "opacity-100" : "opacity-40 hover:opacity-80 border-transparent"}`} style={i === idx ? { borderColor: color } : undefined}>
                <img src={src} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col min-w-0">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 text-void" style={{ background: color }}>
              {p.rarity} ITEM
            </span>
            <button onClick={onClose} className="font-mono text-xs text-muted hover:text-white">
              [ESC]
            </button>
          </div>
          <h3 className="font-display text-3xl sm:text-4xl font-black mt-4">{p.title}</h3>
          <div className="font-mono text-xs text-muted mt-1 tracking-widest">{p.type.toUpperCase()}</div>
          <p className="text-white/75 mt-5 leading-relaxed">{p.desc}</p>

          <div className="mt-6">
            <div className="flex justify-between font-mono text-[10px] text-muted mb-1">
              <span>POWER LEVEL</span>
              <span style={{ color }}>{p.power}</span>
            </div>
            <div className="h-2 bg-white/5">
              <motion.div className="h-full" initial={{ width: 0 }} animate={{ width: `${p.power}%` }} transition={{ duration: 1, delay: 0.2 }} style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
            </div>
          </div>

          <div className="font-mono text-[10px] tracking-[0.3em] text-muted mt-6 mb-2">ENCHANTMENTS</div>
          <div className="flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <span key={s} className="font-mono text-[11px] px-2 py-1 border" style={{ borderColor: color + "55", color }}>
                {s}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-8">
            {p.link ? (
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="pixel-btn inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-void" style={{ background: color }}>
                Visit live ↗
              </a>
            ) : (
              <span className="font-mono text-xs text-muted">🔒 Private build — screenshots only</span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Archive() {
  const row = [...archive, ...archive];
  return (
    <div className="mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 font-mono text-xs tracking-[0.3em] text-muted mb-5">
        <span className="text-violet">◆</span> THE VAULT · EARLY BUILDS
      </div>
      <div className="relative overflow-hidden group [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee flex gap-4 w-max group-hover:[animation-play-state:paused]">
          {row.map((a, i) => {
            const inner = (
              <>
                <img src={a.img} alt={a.title} loading="lazy" className="w-full h-32 object-cover object-top grayscale group-hover/a:grayscale-0 transition-all duration-500" />
                <div className="p-3 flex justify-between font-mono text-xs">
                  <span>{a.title}</span>
                  <span className="text-muted">{a.year}</span>
                </div>
              </>
            );
            return a.link ? (
              <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" className="group/a w-60 shrink-0 panel hover:border-violet/60 transition-colors" onMouseEnter={() => sfx.hover()}>
                {inner}
              </a>
            ) : (
              <div key={i} className="group/a w-60 shrink-0 panel">
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
