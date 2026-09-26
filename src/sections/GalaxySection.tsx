import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { planets } from "../lib/data";
import { useInView, useMediaQuery } from "../lib/hooks";
import { SectionHeader } from "../components/ui";
import { game, useGame } from "../game/store";
import { sfx } from "../game/sfx";

const Galaxy = lazy(() => import("../three/Galaxy"));

export default function GalaxySection() {
  const [ref, inView] = useInView<HTMLDivElement>("200px");
  const [mountRef, shouldMount] = useInView<HTMLDivElement>("800px", true);
  const mobile = useMediaQuery("(max-width: 768px)");
  const [selected, setSelected] = useState<string | null>(null);
  const visited = useGame((s) => s.planets);
  const planet = planets.find((p) => p.id === selected);

  const select = (id: string | null) => {
    if (id === selected) return;
    setSelected(id);
    if (id) {
      sfx.warp();
      game.visitPlanet(id, planets.length);
    } else sfx.close();
  };

  return (
    <section id="galaxy" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader world="1-1" kicker="Skill Galaxy" title="Six worlds." accent="One universe.">
          Every skill domain is a planet. <span className="text-white">Drag to rotate, click a planet to land</span> and see
          the skills in its orbit. Land on all six to unlock <span className="text-amber">Cartographer</span>.
        </SectionHeader>
      </div>

      <div ref={mountRef} className="relative">
        <div ref={ref} className="relative h-[88svh] min-h-[560px] border-y border-white/5 overflow-hidden" data-hover>
          {shouldMount && (
            <Suspense fallback={<div className="absolute inset-0 grid place-items-center font-mono text-muted text-sm">Charting galaxy…</div>}>
              <Galaxy planets={planets} selected={selected} onSelect={select} active={inView} mobile={mobile} />
            </Suspense>
          )}

          {/* mission tracker */}
          <div className={`absolute z-20 top-20 left-4 sm:top-24 sm:left-8 panel px-4 py-3 font-mono text-xs pointer-events-none ${planet ? "hidden sm:block" : ""}`}>
            <div className="text-muted tracking-widest text-[10px]">MISSION</div>
            <div className="mt-1">
              Planets charted <span className="text-lime">{visited.length}</span>/{planets.length}
            </div>
            <div className="flex gap-1 mt-2">
              {planets.map((p) => (
                <span
                  key={p.id}
                  className="w-4 h-1.5"
                  style={{ background: visited.includes(p.id) ? p.color : "#ffffff1a", boxShadow: visited.includes(p.id) ? `0 0 8px ${p.color}` : "none" }}
                />
              ))}
            </div>
          </div>

          {/* planet dossier */}
          <AnimatePresence mode="wait">
            {planet && (
              <motion.aside
                key={planet.id}
                initial={{ opacity: 0, x: mobile ? 0 : 40, y: mobile ? 40 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: mobile ? 0 : 40, y: mobile ? 40 : 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
                className="absolute z-30 panel corner p-5 sm:p-6 bottom-20 inset-x-3 sm:inset-x-auto sm:bottom-auto sm:top-20 sm:right-8 md:right-16 sm:w-[380px] max-h-[46%] sm:max-h-[calc(100%-10rem)] overflow-y-auto overflow-x-hidden"
                style={{ ["--c" as string]: planet.color }}
                data-lenis-prevent
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.3em]" style={{ color: planet.color }}>
                      {planet.domain.toUpperCase()}
                    </div>
                    <h3 className="font-display text-2xl font-bold mt-1">{planet.name}</h3>
                  </div>
                  <button onClick={() => select(null)} className="font-mono text-xs text-muted hover:text-white shrink-0" aria-label="Back to orbit">
                    ✕ ORBIT
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between font-mono text-[10px] text-muted mb-1">
                    <span>MASTERY</span>
                    <span style={{ color: planet.color }}>{planet.mastery}/100</span>
                  </div>
                  <div className="h-2 bg-white/5">
                    <motion.div
                      className="h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${planet.mastery}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ background: planet.color, boxShadow: `0 0 12px ${planet.color}` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-white/70 mt-4">{planet.lore}</p>

                <div className="mt-4 p-3 border border-amber/30 bg-amber/5">
                  <div className="font-mono text-[10px] text-amber tracking-widest">⚔ BOSS DEFEATED</div>
                  <p className="text-sm mt-1 text-white/85">{planet.boss}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {planet.skills.map((s, i) => (
                    <motion.span
                      key={s}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.025 }}
                      className="font-mono text-[11px] px-2 py-1 border"
                      style={{ borderColor: planet.color + "55", color: planet.color }}
                    >
                      {s}
                    </motion.span>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* planet selector */}
          <div className="absolute z-20 bottom-4 inset-x-0 flex justify-center px-3">
            <div className="panel flex gap-1 p-1 overflow-x-auto max-w-full" data-lenis-prevent>
              {planets.map((p) => {
                const on = selected === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => select(on ? null : p.id)}
                    onMouseEnter={() => sfx.hover()}
                    className={`shrink-0 flex items-center gap-2 px-3 py-2 font-mono text-[11px] transition-colors ${on ? "bg-white/10 text-white" : "text-muted hover:text-white"}`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                    {p.domain}
                    {visited.includes(p.id) && <span className="text-lime">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
