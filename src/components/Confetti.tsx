import { useEffect, useRef } from "react";

const COLORS = ["#00e5ff", "#ff2bd6", "#b6ff3b", "#ffb020", "#8b6bff", "#ffffff"];

export default function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext("2d")!;
    const w = (c.width = c.offsetWidth * devicePixelRatio);
    const h = (c.height = c.offsetHeight * devicePixelRatio);
    const parts = Array.from({ length: 160 }, () => ({
      x: w / 2,
      y: h / 2,
      vx: (Math.random() - 0.5) * 22,
      vy: -Math.random() * 20 - 4,
      s: (Math.random() * 6 + 3) * devicePixelRatio,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      c: COLORS[(Math.random() * COLORS.length) | 0],
    }));
    let raf = 0;
    let frames = 0;
    const loop = () => {
      g.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.vy += 0.6;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.c;
        g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        g.restore();
      }
      if (frames++ < 240) raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="absolute inset-[-40%] w-[180%] h-[180%] pointer-events-none" />;
}
