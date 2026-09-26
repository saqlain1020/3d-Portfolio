import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { gsap } from "../lib/scroll";
import { archive, planets, profile, projects } from "../lib/data";
import { useInView, useMediaQuery, yearsSince } from "../lib/hooks";
import { Magnetic } from "../components/ui";
import { scrollTo } from "../lib/scroll";
import { game } from "../game/store";

const HeroScene = lazy(() => import("../three/HeroScene"));

const ROLES = ["Full-Stack Engineer", "Web3 Architect", "AI Agent Builder", "Chrome Extension Crafter", "Smart Contract Dev"];

export default function Hero({ ready }: { ready: boolean }) {
  const [ref, inView] = useInView<HTMLElement>("100px");
  const mobile = useMediaQuery("(max-width: 768px)");
  const title = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setRole((r) => (r + 1) % ROLES.length), 2400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-letter]", { yPercent: 120, rotate: 8, duration: 1.4, stagger: 0.05 })
        .from("[data-fade]", { y: 30, opacity: 0, duration: 1, stagger: 0.1 }, "-=1")
        .from("[data-line]", { scaleX: 0, duration: 1.2 }, "-=1.1");
      gsap.to("[data-parallax]", {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: true },
      });
    }, title);
    return () => ctx.revert();
  }, [ready]);

  const years = yearsSince(profile.careerStart);
  const skillCount = planets.reduce((n, p) => n + p.skills.length, 0);

  return (
    <section id="home" ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <div className="absolute inset-0">
        <Suspense fallback={null}>{ready && <HeroScene active={inView} mobile={mobile} />}</Suspense>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-void via-void/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent pointer-events-none" />

      <div ref={title} className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-6 flex flex-col pointer-events-none">
        <div data-parallax className="flex-1 flex flex-col justify-end sm:justify-center pb-6">
          <div data-fade className="font-mono text-xs sm:text-sm text-lime tracking-[0.35em] mb-5 flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-lime animate-pulse" /> PLAYER ONE · READY
          </div>

          <h1 className="font-display font-black leading-[0.86] tracking-tighter text-[clamp(3.4rem,min(15vw,21vh),12rem)]">
            <span className="flex overflow-hidden">
              {"SAQLAIN".split("").map((c, i) => (
                <span key={i} data-letter className="inline-block">
                  {c}
                </span>
              ))}
            </span>
            <span className="flex overflow-hidden text-outline text-[0.55em] mt-2 tracking-tight">
              {"RIAZ".split("").map((c, i) => (
                <span key={i} data-letter className="inline-block">
                  {c}
                </span>
              ))}
              <span data-letter className="inline-block text-magenta" style={{ WebkitTextStroke: 0 }}>
                .
              </span>
            </span>
          </h1>

          <div data-line className="h-px w-full max-w-xl bg-gradient-to-r from-cyan via-magenta to-transparent mt-8 origin-left" />

          <div data-fade className="mt-6 flex items-center gap-3 font-mono text-sm sm:text-base">
            <span className="text-muted">class:</span>
            <span className="text-cyan glow-cyan">
              <RoleText text={ROLES[role]} />
            </span>
          </div>
          <p data-fade className="mt-4 max-w-lg text-white/70 text-base sm:text-lg">
            {profile.tagline} Explore my skills like a game — earn XP, unlock achievements, find the secrets.
          </p>

          <div data-fade className="mt-8 flex flex-wrap gap-3 pointer-events-auto">
            <Magnetic
              href="#galaxy"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#galaxy");
              }}
              className="pixel-btn bg-cyan text-void px-6 py-3.5 text-sm font-bold hover:shadow-[0_0_40px_#00e5ff]"
            >
              ▶ Start exploring
            </Magnetic>
            <Magnetic
              href={profile.cv}
              download
              onClick={() => game.unlock("cv")}
              className="pixel-btn border border-white/25 px-6 py-3.5 text-sm hover:border-magenta hover:text-magenta"
            >
              ↓ Download CV
            </Magnetic>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div data-fade className="grid grid-cols-4 gap-3 sm:flex sm:gap-8 font-mono w-full sm:w-auto">
            {[
              [`${years}+`, "Years XP"],
              [`${projects.length + archive.length}`, "Items looted"],
              [`${skillCount}`, "Skills unlocked"],
              ["5", "Chains mastered"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-xl sm:text-3xl font-bold">{n}</div>
                <div className="text-[9px] sm:text-[10px] text-muted tracking-wider sm:tracking-widest uppercase leading-tight">{l}</div>
              </div>
            ))}
          </div>
          <div className="hidden sm:flex flex-col items-center gap-2 font-mono text-[10px] text-muted tracking-widest">
            SCROLL
            <span className="w-px h-10 bg-gradient-to-b from-cyan to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleText({ text }: { text: string }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setOut(text.slice(0, i) + (i < text.length ? "▋" : ""));
      if (i >= text.length) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, [text]);
  return <>{out}</>;
}
