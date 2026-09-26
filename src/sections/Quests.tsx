import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { npcs, quests, type Quest } from "../lib/data";
import { SectionHeader, Reveal } from "../components/ui";
import { gsap } from "../lib/scroll";
import { game, useGame } from "../game/store";
import { sfx } from "../game/sfx";

export default function Quests() {
  const rail = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const read = useGame((s) => s.quests);

  useEffect(() => {
    const el = rail.current!;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector("[data-progress]"),
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 60%", scrub: 0.6 } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const toggle = (q: Quest) => {
    const next = open === q.id ? null : q.id;
    setOpen(next);
    if (next) {
      sfx.open();
      game.readQuest(q.id, quests.length);
    } else sfx.close();
  };

  return (
    <section id="quests" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader world="2-1" kicker="Quest Log" title="Quests" accent="Completed.">
          Seven years of campaigns, from a graphic-design tutorial level to the current main quest. Open each one to read the
          objectives. <span className="text-muted">({read.length}/{quests.length} read)</span>
        </SectionHeader>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          <div ref={rail} className="relative pl-10 sm:pl-14">
            <div className="absolute left-3 sm:left-5 top-0 bottom-0 w-px bg-white/10" />
            <div data-progress className="absolute left-3 sm:left-5 top-0 bottom-0 w-px bg-gradient-to-b from-lime via-cyan to-magenta origin-top shadow-[0_0_10px_#00e5ff]" />

            <div className="space-y-5">
              {quests.map((q, i) => (
                <QuestCard key={q.id} q={q} index={i} open={open === q.id} read={read.includes(q.id)} onToggle={() => toggle(q)} />
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 self-start">
            <Reveal>
              <NpcDialog />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuestCard({ q, index, open, read, onToggle }: { q: Quest; index: number; open: boolean; read: boolean; onToggle: () => void }) {
  const active = q.status === "ACTIVE";
  return (
    <Reveal delay={index * 0.04}>
      <div className="relative">
        <span
          className={`absolute -left-10 sm:-left-14 top-6 ml-[7px] sm:ml-[15px] w-3 h-3 rotate-45 border-2 ${active ? "bg-lime border-lime shadow-[0_0_14px_#b6ff3b]" : "bg-void border-cyan"}`}
        >
          {active && <span className="absolute inset-[-6px] border border-lime/50 animate-ping" />}
        </span>

        <div className={`panel transition-colors ${open ? "border-cyan/40" : "hover:border-white/20"}`}>
          <button onClick={onToggle} onMouseEnter={() => sfx.hover()} className="w-full text-left p-5 sm:p-6 flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-widest">
                <span className={`px-2 py-0.5 ${q.tier === "MAIN QUEST" ? "bg-amber text-void" : "bg-white/10 text-white/70"}`}>{q.tier}</span>
                <span className={active ? "text-lime" : "text-muted"}>{active ? "▶ IN PROGRESS" : "✓ COMPLETE"}</span>
                {!read && <span className="text-magenta animate-pulse">● NEW</span>}
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold mt-2">{q.title}</h3>
              <div className="text-sm text-muted mt-1">
                {q.org} · <span className="font-mono">{q.period}</span>
              </div>
            </div>
            <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-2xl text-cyan leading-none mt-1 shrink-0">
              +
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                <div className="px-5 sm:px-6 pb-6">
                  <p className="text-white/75">{q.summary}</p>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-muted mt-5 mb-3">OBJECTIVES</div>
                  <ul className="space-y-2">
                    {q.objectives.map((o, i) => (
                      <motion.li key={o} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.09 }} className="flex gap-3 text-sm">
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.09, type: "spring" }}
                          className="mt-0.5 w-4 h-4 shrink-0 grid place-items-center border border-lime text-lime text-[10px]"
                        >
                          ✓
                        </motion.span>
                        <span className="text-white/85">{o}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-muted mt-5 mb-2">REWARDS</div>
                  <div className="flex flex-wrap gap-1.5">
                    {q.rewards.map((r) => (
                      <span key={r} className="font-mono text-[11px] px-2 py-1 bg-amber/10 text-amber border border-amber/30">
                        +{r}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reveal>
  );
}

function NpcDialog() {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);
  const npc = npcs[i];

  useEffect(() => {
    setText("");
    setTyping(true);
    let n = 0;
    const t = setInterval(() => {
      n++;
      setText(npc.line.slice(0, n));
      if (n % 3 === 0) sfx.key();
      if (n >= npc.line.length) {
        clearInterval(t);
        setTyping(false);
        game.talkNpc(i, npcs.length);
      }
    }, 22);
    return () => clearInterval(t);
  }, [i]);

  const next = () => {
    if (typing) {
      setText(npc.line);
      setTyping(false);
      game.talkNpc(i, npcs.length);
      return;
    }
    sfx.click();
    setI((i + 1) % npcs.length);
  };

  return (
    <div>
      <div className="font-mono text-xs tracking-[0.3em] text-muted mb-4">
        <span className="text-lime">◆</span> NPC REVIEWS · FIVERR ★★★★★
      </div>
      <button onClick={next} className="w-full text-left relative border-2 border-white/80 bg-[#0a0a18] p-5 pt-7 shadow-[6px_6px_0_#ff2bd6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0_#ff2bd6] transition-all">
        <div className="absolute -top-4 left-4 bg-white text-void font-mono font-bold text-xs px-3 py-1">
          {npc.name} <span className="text-magenta">[{npc.from}]</span>
        </div>
        <div className="flex gap-1 text-amber text-sm mb-2">★★★★★</div>
        <p className="font-mono text-sm leading-relaxed min-h-[96px] text-white/90">
          “{text}
          {!typing && "”"}
        </p>
        <div className="flex justify-between items-center mt-3 font-mono text-[10px] text-muted">
          <span>
            {i + 1}/{npcs.length}
          </span>
          <span className={typing ? "opacity-0" : "text-white animate-bounce"}>▼ NEXT</span>
        </div>
      </button>
    </div>
  );
}
