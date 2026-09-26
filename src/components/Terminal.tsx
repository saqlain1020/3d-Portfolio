import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { game, useGame } from "../game/store";
import { sfx } from "../game/sfx";
import { levelFromXp, titleFor, ACHIEVEMENTS } from "../game/achievements";
import { planets, profile, projects, quests, sections } from "../lib/data";
import { scrollTo } from "../lib/scroll";
import { yearsSince } from "../lib/hooks";
import MatrixRain from "./MatrixRain";

type Line = { text: string; tone?: "in" | "ok" | "err" | "dim" | "accent" };

const COMMANDS = [
  "help", "whoami", "neofetch", "skills", "projects", "quests", "goto", "open", "contact", "cv", "github",
  "linkedin", "xp", "achievements", "sudo", "hire", "matrix", "music", "coffee", "ls", "cat", "date", "echo", "clear", "exit",
];

const FILES: Record<string, string> = {
  "readme.md": "Hi! I'm Saqlain. This whole site is a game — explore, collect XP, find the secrets.",
  "secrets.txt": "Rumor has it the konami code still works around here. ↑↑↓↓←→←→BA",
  "todo.txt": "1. Ship features  2. Mine blocks  3. Get hired by you  4. Coffee",
};

export default function Terminal() {
  const open = useGame((s) => s.terminalOpen);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [matrix, setMatrix] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (!lines.length)
        setLines([
          { text: "SAQLAIN-OS terminal — type 'help' to see commands.", tone: "accent" },
          { text: "Tip: TAB completes, ↑/↓ browses history, ESC closes.", tone: "dim" },
        ]);
    }
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const print = (...ls: (string | Line)[]) =>
    setLines((prev) => [...prev, ...ls.map((l) => (typeof l === "string" ? { text: l } : l))]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    print({ text: `saqlain@portfolio:~$ ${cmd}`, tone: "in" });
    if (!cmd) return;
    setHistory((h) => [cmd, ...h].slice(0, 50));
    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ").toLowerCase();

    switch (name.toLowerCase()) {
      case "help":
        print(
          { text: "Available commands:", tone: "accent" },
          "  whoami · neofetch · skills · projects · quests · contact",
          "  goto <section>   jump to: " + sections.map((s) => s.id).join(", "),
          "  open <project>   open a project's link",
          "  cv · github · linkedin · xp · achievements · music",
          "  ls · cat <file> · date · echo · clear · exit",
          { text: "  …and a few hidden ones. sudo might help.", tone: "dim" },
        );
        break;
      case "whoami":
        print(`${profile.fullName} — ${profile.role}`, profile.bio);
        break;
      case "neofetch": {
        const lvl = levelFromXp(game.get().xp);
        print(
          { text: "   ███████╗   saqlain@portfolio", tone: "accent" },
          { text: "   ██╔════╝   ─────────────────", tone: "accent" },
          { text: `   ███████╗   OS: SaqlainOS 2.0 (Karachi, PK)`, tone: "accent" },
          { text: `   ╚════██║   Uptime: ${yearsSince(profile.careerStart)}+ years coding`, tone: "accent" },
          { text: `   ███████║   Shell: TypeScript · Solidity · Python`, tone: "accent" },
          { text: `   ╚══════╝   Class: ${profile.className} · Visitor LVL ${lvl} (${titleFor(lvl)})`, tone: "accent" },
          `              Currently: Web3 + AI @ Permission.io`,
        );
        break;
      }
      case "skills":
        planets.forEach((p) => print(`  [${p.domain.padEnd(11)}] ${"█".repeat(Math.round(p.mastery / 10))}${"░".repeat(10 - Math.round(p.mastery / 10))} ${p.skills.slice(0, 6).join(", ")}…`));
        break;
      case "projects":
        projects.forEach((p) => print(`  ${p.id.padEnd(10)} ${p.rarity.padEnd(10)} ${p.title} — ${p.type}`));
        print({ text: "Use: open <id>", tone: "dim" });
        break;
      case "quests":
        quests.forEach((q) => print(`  [${q.status === "ACTIVE" ? "▶" : "✓"}] ${q.period.padEnd(16)} ${q.org}`));
        break;
      case "goto": {
        const s = sections.find((x) => x.id === arg || x.label.toLowerCase().includes(arg));
        if (!s) print({ text: `No such level: ${arg}`, tone: "err" });
        else {
          print({ text: `Warping to WORLD ${s.world} — ${s.label}…`, tone: "ok" });
          sfx.warp();
          game.setTerminal(false);
          setTimeout(() => scrollTo(`#${s.id}`), 250);
        }
        break;
      }
      case "open": {
        const p = projects.find((x) => x.id === arg || x.title.toLowerCase() === arg);
        if (!p) print({ text: "Unknown project. Try 'projects'.", tone: "err" });
        else if (!p.link) print({ text: `${p.title} is private/offline — check the Inventory for screenshots.`, tone: "dim" });
        else {
          window.open(p.link, "_blank", "noopener");
          print({ text: `Opening ${p.link}`, tone: "ok" });
        }
        break;
      }
      case "contact":
        print(`  email     ${profile.email}`, `  github    ${profile.links.github}`, `  linkedin  ${profile.links.linkedin}`);
        break;
      case "cv":
        window.open(profile.cv, "_blank");
        game.unlock("cv");
        print({ text: "Downloading CV…", tone: "ok" });
        break;
      case "github":
      case "linkedin":
        window.open(profile.links[name as "github" | "linkedin"], "_blank", "noopener");
        print({ text: `Opening ${name}…`, tone: "ok" });
        break;
      case "xp": {
        const s = game.get();
        print(`XP: ${s.xp} · Level ${levelFromXp(s.xp)} · High score: ${s.highScore} blocks`);
        break;
      }
      case "achievements": {
        const got = game.get().unlocked;
        ACHIEVEMENTS.forEach((a) => print({ text: `  ${got.includes(a.id) ? "■" : "□"} ${a.secret && !got.includes(a.id) ? "???" : a.title}`, tone: got.includes(a.id) ? "ok" : "dim" }));
        break;
      }
      case "sudo":
        if (arg.includes("hire")) {
          print(
            { text: "[sudo] password for recruiter: ********", tone: "dim" },
            { text: "Access granted. Initiating hiring protocol…", tone: "ok" },
            { text: `Opening a message to ${profile.email} ✉️`, tone: "ok" },
          );
          game.unlock("sudo");
          setTimeout(() => {
            game.setTerminal(false);
            scrollTo("#contact");
          }, 1400);
        } else print({ text: "Nice try. Maybe 'sudo hire-saqlain'?", tone: "err" });
        break;
      case "hire":
        print({ text: "Permission denied. (hint: you need sudo)", tone: "err" });
        break;
      case "matrix":
        setMatrix(true);
        print({ text: "Wake up, Neo…", tone: "ok" });
        setTimeout(() => setMatrix(false), 6000);
        break;
      case "music":
        game.toggleMusic();
        print({ text: game.get().music ? "♪ Now playing: saqlain.fm — synthwave loop in A minor, 96 BPM" : "Music off.", tone: "ok" });
        break;
      case "coffee":
        print("      ( (", "       ) )", "    ........", "    |      |]", "    \\      /", "     `----'", { text: "Productivity +50%. Brewed with ☕ by Saqlain.", tone: "ok" });
        game.addXp(5);
        break;
      case "rm":
        print({ text: "Whoa there. This portfolio is immutable — it's on-chain. (not really)", tone: "err" });
        break;
      case "ls":
        print("  " + Object.keys(FILES).join("   "));
        break;
      case "cat":
        print(FILES[arg] ? FILES[arg] : { text: `cat: ${arg || "?"}: No such file`, tone: "err" });
        break;
      case "date":
        print(new Date().toString());
        break;
      case "echo":
        print(args.join(" "));
        break;
      case "clear":
        setLines([]);
        break;
      case "exit":
        game.setTerminal(false);
        break;
      default:
        print({ text: `command not found: ${name}. Type 'help'.`, tone: "err" });
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sfx.key();
    if (e.key === "Enter") {
      run(input);
      setInput("");
      setHIdx(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(hIdx + 1, history.length - 1);
      setHIdx(i);
      if (history[i]) setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = Math.max(hIdx - 1, -1);
      setHIdx(i);
      setInput(i === -1 ? "" : history[i]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [first, second] = input.split(" ");
      if (second === undefined) {
        const m = COMMANDS.filter((c) => c.startsWith(first));
        if (m.length === 1) setInput(m[0] + " ");
        else if (m.length) print({ text: m.join("  "), tone: "dim" });
      } else {
        const pool = first === "goto" ? sections.map((s) => s.id) : first === "open" ? projects.map((p) => p.id) : first === "cat" ? Object.keys(FILES) : [];
        const m = pool.filter((c) => c.startsWith(second));
        if (m.length === 1) setInput(`${first} ${m[0]}`);
        else if (m.length) print({ text: m.join("  "), tone: "dim" });
      }
    } else if (e.key === "Escape") {
      game.setTerminal(false);
    }
  };

  const tone = (t?: Line["tone"]) =>
    t === "in" ? "text-white" : t === "ok" ? "text-lime" : t === "err" ? "text-magenta" : t === "dim" ? "text-muted" : t === "accent" ? "text-cyan" : "text-white/80";

  return (
    <>
      {matrix && <MatrixRain />}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-void/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => game.setTerminal(false)}
          >
            <motion.div
              initial={{ y: 60, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 60, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.focus();
              }}
              className="w-full max-w-3xl h-[70vh] sm:h-[520px] flex flex-col bg-[#07070d]/95 border border-lime/30 shadow-[0_0_60px_#b6ff3b22] scanlines relative overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 font-mono text-xs text-muted">
                <span className="w-3 h-3 rounded-full bg-magenta/80" />
                <span className="w-3 h-3 rounded-full bg-amber/80" />
                <span className="w-3 h-3 rounded-full bg-lime/80" />
                <span className="ml-3">saqlain@portfolio: ~</span>
                <button className="ml-auto hover:text-white" onClick={() => game.setTerminal(false)}>
                  ✕
                </button>
              </div>
              <div ref={bodyRef} data-lenis-prevent className="flex-1 overflow-y-auto p-4 font-mono text-[12.5px] leading-relaxed">
                {lines.map((l, i) => (
                  <div key={i} className={`whitespace-pre-wrap break-words ${tone(l.tone)}`}>
                    {l.text}
                  </div>
                ))}
                <div className="flex items-center">
                  <span className="text-lime shrink-0">saqlain@portfolio:~$&nbsp;</span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKey}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    aria-label="Terminal input"
                    className="flex-1 min-w-0 bg-transparent outline-none text-white caret-lime"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
