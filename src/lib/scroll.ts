import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export const initScroll = () => {
  if (lenis) return lenis;
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
};

export const scrollTo = (target: string | number) => {
  // A stopped Lenis ignores scrollTo, and explicit navigation should always win.
  if (lenis) {
    lenis.start();
    lenis.scrollTo(target, { offset: 0, duration: 1.6 });
  }
  else if (typeof target === "string") document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
};

export const stopScroll = (stop: boolean) => {
  if (!lenis) return;
  if (stop) lenis.stop();
  else lenis.start();
};

export { gsap, ScrollTrigger };
