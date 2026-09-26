import { useEffect, useRef } from "react";
import { gsap } from "../lib/scroll";
import { sfx } from "../game/sfx";

// "WORLD 1-1" style heading with a scrambled-text reveal on scroll.
export function SectionHeader({ world, kicker, title, accent, children }: { world: string; kicker: string; title: string; accent?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll("[data-reveal]"), {
        yPercent: 110,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 80%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className="mb-12 sm:mb-16">
      <div className="overflow-hidden">
        <div data-reveal className="font-mono text-xs sm:text-sm tracking-[0.3em] text-muted flex items-center gap-3">
          <span className="text-cyan">WORLD {world}</span>
          <span className="h-px w-10 bg-white/20" />
          <Scramble text={kicker.toUpperCase()} />
        </div>
      </div>
      <h2 className="font-display font-black text-[clamp(2.4rem,8vw,6.5rem)] leading-[0.95] tracking-tight mt-4">
        <span className="block overflow-hidden pb-2">
          <span data-reveal className="block">
            {title}
          </span>
        </span>
        {accent && (
          <span className="block overflow-hidden pb-2">
            <span data-reveal className="block text-outline">
              {accent}
            </span>
          </span>
        )}
      </h2>
      {children && (
        <div className="overflow-hidden">
          <div data-reveal className="max-w-2xl text-muted text-base sm:text-lg mt-5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";

export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    let frame = 0;
    let raf = 0;
    const run = () => {
      frame = 0;
      const tick = () => {
        const progress = frame / 24;
        el.textContent = text
          .split("")
          .map((c, i) => (c === " " || i / text.length < progress ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join("");
        if (frame++ < 24) raf = requestAnimationFrame(tick);
        else el.textContent = text;
      };
      tick();
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && run(), { threshold: 1 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

// Button that leans toward the cursor.
export function Magnetic({ children, className = "", strength = 0.35, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { strength?: number; as?: "a" }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.4, ease: "power3.out" });
  };
  const onLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
  return (
    <a
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => sfx.hover()}
      className={`inline-flex items-center gap-2 ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

// Reveal children on scroll.
export function Reveal({ children, className = "", y = 60, delay = 0 }: { children: React.ReactNode; className?: string; y?: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    // revert() (not kill()) restores the original styles on cleanup; otherwise StrictMode's
    // double-mount leaves the element stuck at opacity 0 and the second from() animates 0 → 0.
    const ctx = gsap.context(() => {
      gsap.from(el, { y, opacity: 0, duration: 1.1, delay, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    }, el);
    return () => ctx.revert();
  }, [y, delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
