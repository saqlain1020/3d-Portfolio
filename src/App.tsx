import { useEffect, useState } from "react";
import Boot from "./components/Boot";
import HUD from "./components/HUD";
import Toasts from "./components/Toasts";
import Cursor from "./components/Cursor";
import Terminal from "./components/Terminal";
import LevelNav from "./components/LevelNav";
import Hero from "./sections/Hero";
import GalaxySection from "./sections/GalaxySection";
import Character from "./sections/Character";
import Quests from "./sections/Quests";
import Inventory from "./sections/Inventory";
import Arcade from "./sections/Arcade";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import { game, useGame } from "./game/store";
import { initScroll, stopScroll } from "./lib/scroll";
import { initAnalytics } from "./lib/analytics";
import { sections } from "./lib/data";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function App() {
  const [booted, setBooted] = useState(false);
  const terminalOpen = useGame((s) => s.terminalOpen);

  useEffect(() => {
    initAnalytics();
  }, []);

  // Lock the page while the boot screen or terminal is up.
  useEffect(() => {
    document.body.style.overflow = booted ? "" : "hidden";
    if (booted) {
      initScroll();
      stopScroll(terminalOpen);
    }
  }, [booted, terminalOpen]);

  // Global keys: terminal toggle and the konami code.
  useEffect(() => {
    let seq: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof Element && !!e.target.closest("input, textarea");
      if ((e.key === "`" || e.key === "~") && !typing) {
        e.preventDefault();
        game.setTerminal(!game.get().terminalOpen);
        return;
      }
      if (e.key === "Escape" && game.get().terminalOpen) game.setTerminal(false);
      if (typing) return;
      seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
      if (seq.join() === KONAMI.join()) {
        game.setGodMode(!game.get().godMode);
        game.unlock("konami");
        seq = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Section visits award exploration achievements.
  useEffect(() => {
    if (!booted) return;
    const h = new Date().getHours();
    if (h >= 0 && h < 5) setTimeout(() => game.unlock("night"), 4000);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.target.id !== "home") game.unlock(`visit-${e.target.id}`);
        }
      },
      { threshold: 0.25 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [booted]);

  return (
    <>
      <div className="grain" />
      <Cursor />
      {!booted && <Boot onStart={() => setBooted(true)} />}
      <HUD visible={booted} />
      <LevelNav visible={booted} />
      <Toasts />
      <Terminal />
      <main className="relative">
        <Hero ready={booted} />
        <GalaxySection />
        <Character />
        <Quests />
        <Inventory />
        <Arcade />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
