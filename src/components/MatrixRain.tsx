import { useEffect, useRef } from "react";

const CHARS = "アカサタナハマヤラワ0123456789ABCDEF<>/{}$#SAQLAIN";

export default function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext("2d")!;
    const w = (c.width = innerWidth);
    const h = (c.height = innerHeight);
    const size = 16;
    const drops = Array.from({ length: Math.ceil(w / size) }, () => Math.random() * -50);
    let raf = 0;
    const loop = () => {
      g.fillStyle = "rgba(5,5,10,0.08)";
      g.fillRect(0, 0, w, h);
      g.font = `${size}px JetBrains Mono, monospace`;
      drops.forEach((y, i) => {
        g.fillStyle = Math.random() > 0.97 ? "#fff" : "#b6ff3b";
        g.fillText(CHARS[(Math.random() * CHARS.length) | 0], i * size, y * size);
        drops[i] = y * size > h && Math.random() > 0.975 ? 0 : y + 1;
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-[84] pointer-events-none opacity-80" />;
}
