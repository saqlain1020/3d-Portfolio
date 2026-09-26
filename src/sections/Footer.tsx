import { profile } from "../lib/data";
import { useGame } from "../game/store";
import { ACHIEVEMENTS, levelFromXp } from "../game/achievements";
import { scrollTo } from "../lib/scroll";

export default function Footer() {
  const xp = useGame((s) => s.xp);
  const unlocked = useGame((s) => s.unlocked.length);
  const pct = Math.round((unlocked / ACHIEVEMENTS.length) * 100);

  return (
    <footer className="relative border-t border-white/5 mt-10 overflow-hidden">
      <div className="py-10 overflow-hidden whitespace-nowrap border-b border-white/5">
        <div className="marquee inline-flex gap-12 font-display font-black text-[clamp(3rem,10vw,8rem)] leading-none">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="inline-flex gap-12">
              <span className="text-outline">THANKS FOR PLAYING</span>
              <span className="text-magenta">✦</span>
              <span>GAME SAVED</span>
              <span className="text-cyan">✦</span>
            </span>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid sm:grid-cols-3 gap-6 items-center font-mono text-xs text-muted">
        <div>
          © {new Date().getFullYear()} {profile.fullName}
          <div className="mt-1">Built with React · Three.js · GSAP. No templates were harmed.</div>
        </div>
        <div className="sm:text-center">
          RUN STATS · LVL {levelFromXp(xp)} · {xp} XP · {pct}% complete
          <div className="h-1 bg-white/5 mt-2 max-w-xs sm:mx-auto">
            <div className="h-full bg-gradient-to-r from-lime to-cyan" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="sm:text-right flex sm:justify-end gap-4">
          <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
          <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a>
          <button onClick={() => scrollTo(0)} className="hover:text-cyan">↑ Top</button>
        </div>
      </div>
    </footer>
  );
}
