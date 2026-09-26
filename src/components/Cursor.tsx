import { useEffect, useRef } from "react";
import { isTouch } from "../lib/hooks";

const g2 = (pos: string, size: string) => `linear-gradient(currentColor, currentColor) ${pos} / ${size} no-repeat`;
const BRACKETS = ["left top", "right top", "left bottom", "right bottom"]
  .flatMap((p) => [g2(p, "9px 2px"), g2(p, "2px 9px")])
  .join(", ");

// Crosshair cursor with a lagging reticle and a comet trail. Desktop only.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isTouch()) return;
    document.body.classList.add("has-cursor");
    const c = canvas.current!;
    const g = c.getContext("2d")!;
    let w = (c.width = innerWidth);
    let h = (c.height = innerHeight);
    const onResize = () => {
      w = c.width = innerWidth;
      h = c.height = innerHeight;
    };

    const mouse = { x: w / 2, y: h / 2 };
    const ringPos = { x: w / 2, y: h / 2 };
    const trail: { x: number; y: number }[] = [];
    let hovering = false;
    let down = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const t = e.target as HTMLElement;
      hovering = !!t.closest("a, button, [data-hover], input, textarea, canvas");
    };
    const onDown = () => (down = true);
    const onUp = () => (down = false);

    const loop = () => {
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      if (ring.current) {
        const s = down ? 0.7 : hovering ? 1.7 : 1;
        ring.current.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) scale(${s}) rotate(${hovering ? 45 : 0}deg)`;
        ring.current.style.color = hovering ? "#ff2bd6" : "#00e5ff";
      }
      trail.push({ x: mouse.x, y: mouse.y });
      if (trail.length > 18) trail.shift();
      g.clearRect(0, 0, w, h);
      for (let i = 1; i < trail.length; i++) {
        const a = i / trail.length;
        g.strokeStyle = `rgba(0, 229, 255, ${a * 0.45})`;
        g.lineWidth = a * 3;
        g.beginPath();
        g.moveTo(trail[i - 1].x, trail[i - 1].y);
        g.lineTo(trail[i].x, trail[i].y);
        g.stroke();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    addEventListener("mousemove", onMove);
    addEventListener("mousedown", onDown);
    addEventListener("mouseup", onUp);
    addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMove);
      removeEventListener("mousedown", onDown);
      removeEventListener("mouseup", onUp);
      removeEventListener("resize", onResize);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  if (typeof window !== "undefined" && isTouch()) return null;

  return (
    <>
      <canvas ref={canvas} className="fixed inset-0 z-[200] pointer-events-none mix-blend-screen" />
      <div ref={dot} className="fixed top-0 left-0 z-[201] pointer-events-none -ml-[3px] -mt-[3px] w-[6px] h-[6px] bg-white rounded-full shadow-[0_0_10px_#fff]" />
      <div
        ref={ring}
        className="fixed top-0 left-0 z-[201] pointer-events-none -ml-4 -mt-4 w-8 h-8 transition-[color] duration-200"
        style={{ background: BRACKETS, color: "#00e5ff" }}
      />
    </>
  );
}
