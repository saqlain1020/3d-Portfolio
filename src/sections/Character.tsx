import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { perks, profile, stats } from "../lib/data";
import { SectionHeader, Reveal } from "../components/ui";
import { yearsSince } from "../lib/hooks";
import { game } from "../game/store";
import { sfx } from "../game/sfx";

const FACES = ["/img/me1.png", "/img/me2.png", "/img/me3.png", "/img/me4.png"];
const QUIPS = ["Hey!", "That tickles.", "I'm debugging!", "Hire me instead?", "OK you win. 🏆"];

export default function Character() {
  return (
    <section id="character" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 grid-floor opacity-40 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader world="1-2" kicker="Character Sheet" title="Player" accent="Profile." />

        <div className="grid lg:grid-cols-[400px_1fr] gap-10 lg:gap-16 items-start">
          <Reveal>
            <AvatarCard />
          </Reveal>

          <div>
            <Reveal>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl">{profile.bio}</p>
            </Reveal>
            <div className="grid md:grid-cols-[1fr_1fr] gap-8 mt-10 items-center">
              <Reveal>
                <Radar />
              </Reveal>
              <Reveal delay={0.1}>
                <StatBars />
              </Reveal>
            </div>
          </div>
        </div>

        <Reveal className="mt-16">
          <div className="font-mono text-xs tracking-[0.3em] text-muted mb-5">
            <span className="text-magenta">◆</span> PASSIVE PERKS
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {perks.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                onHoverStart={() => sfx.hover()}
                className="panel group p-5 flex gap-4 items-start hover:border-magenta/40 transition-colors"
              >
                <div className="text-3xl w-12 h-12 grid place-items-center bg-white/5 group-hover:bg-magenta/10 group-hover:scale-110 transition-all shrink-0">{p.icon}</div>
                <div>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-sm text-muted mt-1">{p.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AvatarCard() {
  const card = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });
  const [pokes, setPokes] = useState(0);
  const [quip, setQuip] = useState<string | null>(null);

  const onMove = (e: React.PointerEvent) => {
    const r = card.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (0.5 - py) * 18, y: (px - 0.5) * 22, gx: px * 100, gy: py * 100 });
  };

  const poke = () => {
    const n = pokes + 1;
    setPokes(n);
    sfx.click();
    setQuip(QUIPS[Math.min(n - 1, QUIPS.length - 1)]);
    setTimeout(() => setQuip(null), 1400);
    if (n === 5) game.unlock("poke");
  };

  const years = yearsSince(profile.careerStart);

  return (
    <div style={{ perspective: 1000 }}>
      <div
        ref={card}
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0, gx: 50, gy: 50 })}
        className="relative panel corner p-6 transition-transform duration-200 ease-out overflow-hidden"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: "preserve-3d", ["--c" as string]: "#ff2bd6" }}
      >
        <div
          className="absolute inset-0 holo pointer-events-none opacity-70"
          style={{ backgroundPosition: `${tilt.gx}% ${tilt.gy}%` }}
        />
        <div className="flex justify-between font-mono text-[10px] tracking-widest text-muted">
          <span>ID #1020</span>
          <span className="text-lime">● ONLINE</span>
        </div>

        <button onClick={poke} className="relative block mx-auto mt-4 w-52 h-52" style={{ transform: "translateZ(50px)" }} aria-label="Poke the avatar">
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan/30 via-violet/30 to-magenta/30 blur-2xl" />
          <motion.img
            key={pokes % FACES.length}
            src={FACES[pokes % FACES.length]}
            alt="Saqlain's avatar"
            className="relative w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,.6)] floaty"
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            draggable={false}
          />
          {quip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute -top-2 -right-6 bg-white text-void font-bold text-xs px-3 py-1.5 rounded-lg rounded-bl-none whitespace-nowrap"
            >
              {quip}
            </motion.div>
          )}
        </button>

        <div className="text-center mt-4" style={{ transform: "translateZ(30px)" }}>
          <div className="font-display text-2xl font-black">{profile.fullName.toUpperCase()}</div>
          <div className="font-mono text-xs text-magenta mt-1 tracking-widest">
            CLASS: {profile.className.toUpperCase()} · LVL {years * 10 + 3}
          </div>
        </div>

        <div className="mt-6 space-y-2.5 font-mono text-[11px]" style={{ transform: "translateZ(20px)" }}>
          <Bar label="HP" sub="coffee" value={87} color="#ff2bd6" />
          <Bar label="MP" sub="ideas" value={100} color="#00e5ff" />
          <Bar label="XP" sub={`${years}+ years`} value={94} color="#b6ff3b" />
        </div>

        <div className="mt-6 grid grid-cols-3 text-center font-mono text-[10px] text-muted border-t border-white/10 pt-4">
          <div>
            <div className="text-white text-sm font-bold">KHI</div>BASE
          </div>
          <div>
            <div className="text-white text-sm font-bold">Remote</div>MODE
          </div>
          <div>
            <div className="text-white text-sm font-bold">BS SE</div>UBIT
          </div>
        </div>
        <div className="mt-3 text-center font-mono text-[9px] text-muted/60">psst — try poking the avatar</div>
      </div>
    </div>
  );
}

function Bar({ label, sub, value, color }: { label: string; sub: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 font-bold" style={{ color }}>
        {label}
      </span>
      <div className="flex-1 h-2.5 bg-white/5 p-[1px]">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
      <span className="w-20 text-right text-muted">{sub}</span>
    </div>
  );
}

function Radar() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [hover, setHover] = useState<number | null>(null);
  const size = 300;
  const c = size / 2;
  const R = 110;
  const pt = (i: number, v: number) => {
    const a = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
    return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v];
  };
  const poly = (v: (i: number) => number) => stats.map((_, i) => pt(i, v(i)).join(",")).join(" ");

  return (
    <svg ref={ref} viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[380px] mx-auto overflow-visible">
      <defs>
        <radialGradient id="rg">
          <stop offset="0%" stopColor="#ff2bd6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={poly(() => r)} fill="none" stroke="#ffffff14" />
      ))}
      {stats.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#ffffff14" />;
      })}
      <motion.polygon
        points={poly((i) => stats[i].value / 100)}
        fill="url(#rg)"
        stroke="#00e5ff"
        strokeWidth={2}
        style={{ transformOrigin: "50% 50%", filter: "drop-shadow(0 0 12px #00e5ff88)" }}
        initial={{ scale: 0, rotate: -60, opacity: 0 }}
        animate={inView ? { scale: 1, rotate: 0, opacity: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      {stats.map((s, i) => {
        const [x, y] = pt(i, s.value / 100);
        const [lx, ly] = pt(i, 1.24);
        return (
          <g key={s.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} data-hover>
            <motion.circle
              cx={x}
              cy={y}
              r={hover === i ? 7 : 4}
              fill={hover === i ? "#ff2bd6" : "#fff"}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1 + i * 0.08 }}
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="font-mono" fontSize="11" fill={hover === i ? "#ff2bd6" : "#8a8aa3"} letterSpacing="2">
              {s.key}
            </text>
            {hover === i && (
              <text x={lx} y={ly + 14} textAnchor="middle" className="font-mono" fontSize="11" fill="#fff" fontWeight="bold">
                {s.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function StatBars() {
  return (
    <div className="space-y-4">
      {stats.map((s, i) => (
        <div key={s.key}>
          <div className="flex justify-between font-mono text-xs mb-1.5">
            <span>
              <span className="text-cyan">{s.key}</span> <span className="text-muted">· {s.label}</span>
            </span>
            <span className="text-white">{s.value}</span>
          </div>
          <div className="flex gap-[3px]">
            {Array.from({ length: 20 }, (_, j) => (
              <motion.span
                key={j}
                className="h-3 flex-1"
                initial={{ background: "#ffffff0d" }}
                whileInView={{ background: j < s.value / 5 ? (j > 16 ? "#ff2bd6" : j > 12 ? "#8b6bff" : "#00e5ff") : "#ffffff0d" }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + j * 0.03 }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
