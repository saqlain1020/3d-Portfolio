import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import emailjs from "@emailjs/browser";
import { SectionHeader, Magnetic, Reveal } from "../components/ui";
import { profile } from "../lib/data";
import { game } from "../game/store";
import { sfx } from "../game/sfx";
import { track } from "../lib/analytics";
import Confetti from "../components/Confetti";

const EMAILJS = { service: "service_7vupatn", template: "template_fzzvvtg", publicKey: "user_UfZdGnbnAi6ueK5aTIQxR" };

type Form = { name: string; email: string; subject: string; message: string };

const damageOf = (f: Form) =>
  (f.name.trim().length > 1 ? 20 : 0) +
  (/^\S+@\S+\.\S+$/.test(f.email) ? 25 : 0) +
  (f.subject.trim().length > 2 ? 10 : 0) +
  Math.min(35, Math.floor(f.message.trim().length / 3));

export default function Contact() {
  const [form, setForm] = useState<Form>({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "won" | "error">("idle");
  const [hits, setHits] = useState<{ k: number; n: number; x: number }[]>([]);
  const boss = useAnimationControls();
  const lastDamage = useRef(0);

  const damage = damageOf(form);
  const hp = state === "won" ? 0 : 100 - damage;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    const d = damageOf(next);
    const delta = d - lastDamage.current;
    if (delta >= 5 || (delta > 0 && e.target.name !== "message")) {
      lastDamage.current = d;
      setHits((h) => [...h.slice(-4), { k: Date.now(), n: delta, x: 30 + Math.random() * 40 }]);
      boss.start({ x: [0, -8, 8, -5, 5, 0], filter: ["brightness(1)", "brightness(2.5)", "brightness(1)"], transition: { duration: 0.35 } });
      sfx.drop(4);
    } else if (delta < 0) lastDamage.current = d;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    sfx.warp();
    try {
      await emailjs.send(EMAILJS.service, EMAILJS.template, form, { publicKey: EMAILJS.publicKey });
      setState("won");
      track("contact", "sent");
      boss.start({ scale: [1, 1.3, 0], rotate: [0, -10, 40], opacity: [1, 1, 0], transition: { duration: 0.9 } });
      game.unlock("boss");
    } catch {
      setState("error");
      sfx.fail();
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#ff2bd61a,transparent_60%)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader world="4-1" kicker="Final Boss" title="Let's build" accent="something.">
          The last boss is an empty inbox. Every field you fill deals damage — send the message to finish it off. I usually
          reply within a day.
        </SectionHeader>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
          <Reveal>
            <div className="panel corner p-6 sm:p-8 relative overflow-hidden" style={{ ["--c" as string]: "#ff2bd6" }}>
              <div className="flex justify-between font-mono text-[10px] tracking-widest">
                <span className="text-magenta">BOSS · LVL 99</span>
                <span className="text-muted">WEAKNESS: GOOD IDEAS</span>
              </div>
              <div className="relative h-48 grid place-items-center mt-2">
                <motion.div animate={boss} className="relative">
                  <BossSprite hp={hp} />
                </motion.div>
                <AnimatePresence>
                  {hits.map((h) => (
                    <motion.span
                      key={h.k}
                      initial={{ opacity: 1, y: 0, scale: 0.6 }}
                      animate={{ opacity: 0, y: -70, scale: 1.3 }}
                      transition={{ duration: 0.9 }}
                      onAnimationComplete={() => setHits((x) => x.filter((y) => y.k !== h.k))}
                      className="absolute font-display font-black text-2xl text-amber pointer-events-none"
                      style={{ left: `${h.x}%`, top: "35%" }}
                    >
                      -{h.n}
                    </motion.span>
                  ))}
                </AnimatePresence>
                {state === "won" && <Confetti />}
              </div>
              <div className="font-display font-bold text-xl text-center">{state === "won" ? "INBOX ZERO — DEFEATED" : "INBOX ZERO"}</div>
              <div className="mt-3">
                <div className="flex justify-between font-mono text-[10px] text-muted mb-1">
                  <span>HP</span>
                  <span>{hp}/100</span>
                </div>
                <div className="h-3 bg-white/5 border border-white/10 p-[2px]">
                  <motion.div
                    className="h-full"
                    animate={{ width: `${hp}%`, background: hp > 50 ? "#ff2bd6" : hp > 20 ? "#ffb020" : "#ff3b3b" }}
                    transition={{ type: "spring", stiffness: 90, damping: 16 }}
                  />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-2">
                <ContactLink href={`mailto:${profile.email}`} label="Email" value={profile.email} />
                <ContactLink href={profile.links.linkedin} label="LinkedIn" value="in/saqlain1020" />
                <ContactLink href={profile.links.github} label="GitHub" value="@saqlain1020" />
                <ContactLink href={profile.cv} label="CV" value="Download PDF" download onClick={() => game.unlock("cv")} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <AnimatePresence mode="wait">
              {state === "won" ? (
                <motion.div key="won" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="panel p-8 sm:p-12 text-center">
                  <div className="text-6xl">🏆</div>
                  <div className="font-mono text-xs text-lime tracking-[0.3em] mt-6">VICTORY · +250 XP</div>
                  <h3 className="font-display text-3xl sm:text-4xl font-black mt-3">Message delivered!</h3>
                  <p className="text-muted mt-4">Thanks, {form.name.split(" ")[0] || "friend"}. I'll get back to you at {form.email} soon.</p>
                  <button
                    onClick={() => {
                      setForm({ name: "", email: "", subject: "", message: "" });
                      lastDamage.current = 0;
                      setState("idle");
                      boss.set({ scale: 1, rotate: 0, opacity: 1 });
                    }}
                    className="pixel-btn mt-8 border border-white/20 px-6 py-3 text-xs hover:border-cyan hover:text-cyan"
                  >
                    New game+
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Player name" name="name" value={form.name} onChange={onChange} required />
                    <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
                  </div>
                  <Field label="Quest (subject)" name="subject" value={form.subject} onChange={onChange} />
                  <Field label="Your message" name="message" value={form.message} onChange={onChange} textarea required />
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="pixel-btn bg-magenta text-void px-8 py-4 text-sm font-bold hover:shadow-[0_0_40px_#ff2bd6] disabled:opacity-60"
                    >
                      {state === "sending" ? "Casting…" : "⚔ Send final blow"}
                    </button>
                    {state === "error" && (
                      <span className="font-mono text-xs text-magenta">
                        Attack missed! Try again or email <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>
                      </span>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, textarea, ...props }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; required?: boolean; textarea?: boolean }) {
  const cls =
    "peer w-full bg-white/[0.03] border border-white/10 px-4 pt-6 pb-2.5 text-white outline-none transition-colors focus:border-cyan focus:bg-cyan/[0.04] placeholder-transparent";
  return (
    <label className="relative block group">
      {textarea ? <textarea {...props} rows={6} placeholder={label} className={cls + " resize-none"} /> : <input {...props} placeholder={label} className={cls} />}
      <span className="absolute left-4 top-2 font-mono text-[10px] tracking-widest text-muted uppercase peer-focus:text-cyan transition-colors">
        {label}
        {props.required && <span className="text-magenta"> *</span>}
      </span>
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-cyan to-magenta peer-focus:w-full transition-all duration-500" />
    </label>
  );
}

function ContactLink({ label, value, ...rest }: { label: string; value: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = rest.href?.startsWith("http");
  return (
    <Magnetic strength={0.15} {...rest} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="!flex flex-col items-start p-3 border border-white/10 hover:border-cyan/50 hover:bg-cyan/5 transition-colors min-w-0">
      <span className="font-mono text-[10px] text-muted tracking-widest">{label.toUpperCase()}</span>
      <span className="text-sm truncate w-full">{value}</span>
    </Magnetic>
  );
}

// A pixel-art "inbox monster" drawn from a character grid.
function BossSprite({ hp }: { hp: number }) {
  const grid = useMemo(
    () => [
      "..X......X..",
      "...X....X...",
      "..XXXXXXXX..",
      ".XX.XXXX.XX.",
      "XXXXXXXXXXXX",
      "X.XXXXXXXX.X",
      "X.X......X.X",
      "...XX..XX...",
    ],
    [],
  );
  const color = hp > 50 ? "#ff2bd6" : hp > 20 ? "#ffb020" : "#ff3b3b";
  return (
    <div className="floaty" style={{ filter: `drop-shadow(0 0 18px ${color})` }}>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
        {grid.join("").split("").map((c, i) => (
          <span key={i} className="w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-300" style={{ background: c === "X" ? color : "transparent" }} />
        ))}
      </div>
    </div>
  );
}
