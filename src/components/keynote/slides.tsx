import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ============================================================
   CONTEXT & HELPERS
   ============================================================ */

export const StepContext = createContext(0);

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  at = 0,
  delay = 0,
  duration = 0.7,
  y = 16,
  blur = 6,
  className = "",
  style,
  children,
}: {
  at?: number;
  delay?: number;
  duration?: number;
  y?: number;
  blur?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const step = useContext(StepContext);
  const active = step >= at;
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      animate={
        active
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y, filter: `blur(${blur}px)` }
      }
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function StepGate({
  from,
  to = Infinity,
  children,
}: {
  from: number;
  to?: number;
  children: ReactNode;
}) {
  const step = useContext(StepContext);
  const visible = step >= from && step <= to;
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   LAYOUT SCAFFOLD - heading at top, content centered below
   ============================================================ */

function SlideShell({
  kicker,
  title,
  children,
  noShell,
}: {
  kicker?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  noShell?: boolean;
}) {
  if (noShell) {
    return <div className="absolute inset-0">{children}</div>;
  }
  return (
    <div className="absolute inset-0 flex flex-col px-32 pt-28 pb-16">
      {(kicker || title) && (
        <Reveal at={0}>
          {kicker && <Kicker>{kicker}</Kicker>}
          {title && (
            <h1 className="kn-display text-[96px] leading-[1.0] mt-5">
              {title}
            </h1>
          )}
        </Reveal>
      )}
      <div className="flex-1 flex flex-col justify-center mt-8">{children}</div>
    </div>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return <div className="kn-kicker">{children}</div>;
}

/* code token helpers */
const k = (s: string) => <span className="tok-kw">{s}</span>;
const str = (s: string) => <span className="tok-str">{s}</span>;
const cmt = (s: string) => <span className="tok-com">{s}</span>;
const fn = (s: string) => <span className="tok-fn">{s}</span>;
const punc = (s: string) => <span className="tok-punc">{s}</span>;
const idt = (s: string) => <span className="tok-id">{s}</span>;

/* ============================================================
   01. COVER
   ============================================================ */

function CoverSlide() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="relative z-10 flex-1 flex flex-col justify-center px-32">
        <Reveal at={0} delay={0.0}>
          <Kicker>JsLovers × MongoDB · Meetup</Kicker>
        </Reveal>

        <Reveal at={0} delay={0.15} y={28}>
          <h1 className="kn-display text-[168px] leading-[0.92] mt-10 max-w-[1500px]">
            Build apps that <span className="kn-text-grad">listen</span> to you
          </h1>
        </Reveal>

        <Reveal at={0} delay={0.4}>
          <div className="mt-12 text-[56px] kn-display text-kn-fg/70 font-light tracking-tight">
            Voice First Web Apps
          </div>
        </Reveal>

        <div className="mt-24 flex items-end justify-between max-w-[1500px]">
          <Reveal at={0} delay={0.65}>
            <div>
              <div className="kn-mono text-[12px] text-kn-fg/40 mb-3">
                Speaker
              </div>
              <div className="kn-display text-[52px]">
                Jagadeesh Jayachandran
              </div>
              <div className="text-[24px] text-kn-fg/70 mt-2 font-medium">
                Front End Developer
              </div>
              <div className="kn-mono text-[14px] text-kn-cyan mt-2">
                Turing.com
              </div>
            </div>
          </Reveal>

          <Reveal at={0} delay={0.8}>
            <div className="text-right">
              <div className="kn-mono text-[12px] text-kn-fg/40 mb-3">
                Find me
              </div>
              <div className="space-y-1 text-[20px] text-kn-fg/80 font-mono">
                <div>linkedin.com/in/jjayy</div>
                <div>github.com/jaga3421</div>
                <div>jagadeesh-j.vercel.app</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   02. AGENDA
   ============================================================ */

const AGENDA: Array<[string, string]> = [
  ["CLI to GUI to Voice", "1m"],
  ["Use Cases", "1m"],
  ["Interaction Loop", "3m"],
  ["Commands vs Conversation", "2m"],
  ["From Mic to Action", "4m"],
  ["Live Demo", "3m"],
  ["Where AI Fits", "2m"],
  ["Hybrid Model", "2m"],
  ["Ship-ready Voice", "2m"],
  ["Q&A", "5m"],
];

function AgendaSlide() {
  return (
    <SlideShell kicker="02 · The Path · ~25 min" title="Talk Agenda">
      <div className="grid grid-cols-2 gap-x-20 gap-y-7 max-w-[1600px]">
        {AGENDA.map(([item, dur], i) => (
          <Reveal key={item} at={0} delay={0.2 + i * 0.06} y={18}>
            <div className="flex items-center gap-8">
              <span className="kn-mono text-[20px] text-kn-cyan w-14">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="kn-display text-[38px] text-kn-fg/90 font-semibold flex-1">
                {item}
              </span>
              <span className="kn-mono text-[14px] text-kn-fg/40 tracking-[0.2em] tabular-nums">
                {dur}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

/* ============================================================
   03. CLI → GUI → VOICE
   ============================================================ */

const ERAS = [
  {
    label: "Era 01",
    name: "CLI",
    summary: "Command driven",
    keywords: ["precise", "scriptable", "expert"],
    glyph: "❯_",
    glow: "0 0 36px -8px oklch(0.85 0.15 200 / 0.30), 0 0 72px -12px oklch(0.85 0.15 200 / 0.18)",
    color: "var(--kn-cyan)",
  },
  {
    label: "Era 02",
    name: "GUI",
    summary: "Direct manipulation",
    keywords: ["clickable", "intuitive", "spatial"],
    glyph: "▢",
    glow: "0 0 36px -8px oklch(0.70 0.20 290 / 0.30), 0 0 72px -12px oklch(0.70 0.20 290 / 0.18)",
    color: "var(--kn-violet)",
  },
  {
    label: "Era 03",
    name: "Voice",
    summary: "Natural interaction",
    keywords: ["natural", "hands-free", "ambient"],
    glyph: "◎",
    glow: "0 0 36px -8px oklch(0.70 0.25 340 / 0.30), 0 0 72px -12px oklch(0.70 0.25 340 / 0.18)",
    color: "var(--kn-magenta)",
  },
];

function EvolutionSlide() {
  return (
    <SlideShell
      kicker="03 · How we got here"
      title={
        <>
          CLI <span className="text-kn-fg/30 font-light">→</span> GUI{" "}
          <span className="text-kn-fg/30 font-light">→</span> Voice
        </>
      }
    >
      <div className="relative grid grid-cols-3 gap-10 items-center">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kn-fg/15 to-transparent -translate-y-1/2 -z-10" />

        {ERAS.map((era, i) => (
          <Reveal key={era.name} at={0} delay={0.15 + i * 0.18} y={30}>
            <div
              className="kn-glass p-12 h-[560px] flex flex-col justify-between"
              style={{ boxShadow: era.glow }}
            >
              <div>
                <div className="kn-mono text-[12px] text-kn-fg/50">
                  {era.label}
                </div>
                <motion.div
                  className="text-[120px] kn-display mt-6 leading-none"
                  style={{ color: era.color }}
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {era.glyph}
                </motion.div>
              </div>

              <div>
                <div className="kn-display text-[72px] font-extrabold">
                  {era.name}
                </div>
                <div className="text-[28px] text-kn-fg/70 mt-3">
                  {era.summary}
                </div>
                <div className="mt-10 flex flex-wrap gap-2">
                  {era.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="kn-mono text-[12px] px-4 py-2 rounded-full border border-kn-border text-kn-fg/70"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

/* ============================================================
   04. USE CASES
   ============================================================ */

function AccessibilityIcon() {
  return (
    <motion.svg viewBox="0 0 80 80" width="120" height="120" fill="none">
      <motion.circle
        cx="40"
        cy="40"
        r="34"
        stroke="var(--kn-cyan)"
        strokeWidth="1.5"
        opacity="0.5"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "40px 40px" }}
      />
      <circle cx="40" cy="22" r="6" fill="var(--kn-cyan)" />
      <path
        d="M22 38h36M30 38v22M50 38v22M40 38v8"
        stroke="var(--kn-cyan)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

function HandsFreeIcon() {
  return (
    <motion.svg viewBox="0 0 80 80" width="120" height="120" fill="none">
      <motion.path
        d="M40 14 v34"
        stroke="var(--kn-violet)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <motion.rect
        x="30"
        y="50"
        width="20"
        height="14"
        rx="3"
        stroke="var(--kn-violet)"
        strokeWidth="2.5"
      />
      <motion.path
        d="M22 36c4 6 11 10 18 10s14-4 18-10"
        stroke="var(--kn-violet)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        animate={{ pathLength: [0, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="40"
        cy="22"
        r="3"
        fill="var(--kn-violet)"
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
  );
}

function AgentsIcon() {
  return (
    <motion.svg viewBox="0 0 80 80" width="120" height="120" fill="none">
      <motion.circle
        cx="40"
        cy="40"
        r="20"
        stroke="var(--kn-magenta)"
        strokeWidth="2"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "40px 40px" }}
        strokeDasharray="4 6"
      />
      <motion.circle
        cx="40"
        cy="40"
        r="10"
        fill="var(--kn-magenta)"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "40px 40px" }}
      />
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "40px 40px" }}
      >
        <circle cx="40" cy="14" r="3" fill="var(--kn-magenta)" opacity="0.85" />
        <circle cx="64" cy="46" r="2" fill="var(--kn-magenta)" opacity="0.7" />
        <circle cx="20" cy="50" r="2" fill="var(--kn-magenta)" opacity="0.7" />
      </motion.g>
    </motion.svg>
  );
}

const USE_CASES = [
  {
    icon: <AccessibilityIcon />,
    title: "Accessibility",
    color: "var(--kn-cyan)",
    items: [
      ["Inclusion", "Empowering users with motor or visual impairments."],
      ["Alt-Input", "Voice as a primary, not secondary, interaction."],
    ],
  },
  {
    icon: <HandsFreeIcon />,
    title: "Hands-Free",
    color: "var(--kn-violet)",
    items: [
      ["Safety", "Driving, industrial work, medical procedures."],
      ["Convenience", "Smart homes, cooking, multi-tasking."],
    ],
  },
  {
    icon: <AgentsIcon />,
    title: "Next-Gen Agents",
    color: "var(--kn-magenta)",
    items: [
      ["Contextual AI", "Talking to LLMs directly inside your app."],
      ["Intent-First", "Replacing complex forms with natural dialogue."],
    ],
  },
];

function UseCasesSlide() {
  return (
    <SlideShell kicker="04 · Where voice wins" title="Use Cases">
      <div className="grid grid-cols-3 gap-10">
        {USE_CASES.map((uc, i) => (
          <Reveal key={uc.title} at={0} delay={0.2 + i * 0.18} y={28}>
            <motion.div
              className="kn-glass p-12 h-[660px] flex flex-col items-start"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="rounded-2xl p-4 -mt-2"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(1 0 0 / 0.04), transparent)",
                }}
              >
                {uc.icon}
              </div>

              <div
                className="kn-mono text-[14px] mt-8"
                style={{ color: uc.color }}
              >
                {String(i + 1).padStart(2, "0")} · Use case
              </div>
              <div className="kn-display text-[52px] font-bold mt-3 leading-tight">
                {uc.title}
              </div>

              <div className="mt-8 space-y-6">
                {uc.items.map(([label, body]) => (
                  <div key={label}>
                    <div
                      className="kn-mono text-[13px]"
                      style={{ color: uc.color }}
                    >
                      {label}
                    </div>
                    <div className="text-[22px] text-kn-fg/80 mt-1 leading-snug">
                      {body}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

/* ============================================================
   05. INTERACTION LOOP - auto-stagger every 2s, loops
   ============================================================ */

const LOOP_STAGES = [
  {
    label: "01",
    title: "Listen",
    text: "Capture audio. Detect speech start and stop.",
    color: "var(--kn-cyan)",
    glyph: "▶",
  },
  {
    label: "02",
    title: "Transcribe",
    text: "Convert speech to text in the browser or via cloud.",
    color: "var(--kn-violet)",
    glyph: "≡",
  },
  {
    label: "03",
    title: "Understand",
    text: "Command, intent, or just dictation?",
    color: "var(--kn-magenta)",
    glyph: "✦",
  },
  {
    label: "04",
    title: "Act",
    text: "Mutate state, call APIs, navigate, or speak back.",
    color: "oklch(0.85 0.18 140)",
    glyph: "→",
  },
];

function useAutoStage(count: number, intervalMs = 2000, holdCycles = 1) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => {
        if (s >= count + holdCycles - 1) return 0;
        return s + 1;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, holdCycles]);
  return stage;
}

function WaveformBars({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-end gap-1 h-10 mt-6 justify-center">
      {[8, 14, 22, 30, 18, 26, 10, 16, 22, 12].map((h, i) => (
        <motion.div
          key={i}
          className="w-[5px] rounded-full"
          style={{ background: color, opacity: 0.85 }}
          animate={
            active
              ? {
                  height: [h, h * 1.8, h * 0.6, h],
                  opacity: [0.85, 1, 0.6, 0.85],
                }
              : { height: 4, opacity: 0.25 }
          }
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

function FlowingDots({ active, color }: { active: boolean; color: string }) {
  return (
    <div
      className="relative h-[3px] mt-6 overflow-hidden rounded-full"
      style={{ background: "oklch(0.65 0.05 260 / 0.18)" }}
    >
      {active && (
        <>
          {[0, 0.33, 0.66].map((d) => (
            <motion.div
              key={d}
              className="absolute top-0 h-full w-12 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              }}
              animate={{ left: ["-15%", "115%"] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "linear",
                delay: d * 1.8,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

function InteractionLoopSlide() {
  const stage = useAutoStage(4, 2000, 1);

  return (
    <SlideShell
      kicker="05 · How voice interfaces work"
      title="The Interaction Loop"
    >
      <div className="flex items-center">
        <div className="grid grid-cols-4 gap-8 w-full relative">
          {/* connector - explicit low z-index */}
          <div className="absolute top-[88px] left-[6%] right-[6%] h-px z-0 pointer-events-none">
            <div className="absolute inset-0 bg-kn-fg/10" />
            <motion.div
              className="h-full relative"
              style={{
                background:
                  "linear-gradient(90deg, var(--kn-cyan), var(--kn-violet), var(--kn-magenta), oklch(0.85 0.18 140))",
                transformOrigin: "left",
              }}
              animate={{ scaleX: Math.min(stage / 3, 1) }}
              transition={{ duration: 0.7, ease: EASE }}
            />
          </div>

          {LOOP_STAGES.map((s, i) => {
            const active = stage > i;
            return (
              <motion.div
                key={s.title}
                className="relative z-10 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={
                  active
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0.25, y: 12, filter: "blur(2px)" }
                }
                transition={{ duration: 0.7, ease: EASE }}
              >
                <motion.div
                  className="kn-glass w-44 h-44 rounded-full flex items-center justify-center text-[80px] relative z-10"
                  animate={{
                    boxShadow: active
                      ? `0 0 80px -8px ${s.color}, 0 0 0 2px ${s.color}`
                      : "0 0 0 0px transparent",
                    scale: active ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.6, ease: EASE }}
                  style={{ color: s.color }}
                >
                  <motion.span
                    animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                  >
                    {s.glyph}
                  </motion.span>
                </motion.div>

                <div
                  className="kn-mono text-[14px] mt-8"
                  style={{ color: s.color }}
                >
                  {s.label}
                </div>
                <div className="kn-display text-[44px] mt-2 font-bold">
                  {s.title}
                </div>
                <div className="text-[19px] text-kn-fg/65 mt-4 max-w-[320px] leading-snug">
                  {s.text}
                </div>

                <div className="w-[260px]">
                  {i === 0 && (
                    <WaveformBars active={active} color={s.color} />
                  )}
                  {i === 1 && active && (
                    <motion.div
                      className="font-mono text-[16px] text-kn-fg/70 mt-6 h-10 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="kn-mono text-[12px] text-kn-fg/40 mr-2">
                        ▸
                      </span>
                      "next slide"
                    </motion.div>
                  )}
                  {i === 1 && !active && <div className="h-10 mt-6" />}
                  {i === 2 && (
                    <FlowingDots active={active} color={s.color} />
                  )}
                  {i === 3 && active && (
                    <motion.div
                      className="mt-6 inline-flex items-center gap-2 kn-mono text-[13px] px-3 py-2 rounded-full border"
                      style={{ color: s.color, borderColor: s.color }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      ✓ goNext()
                    </motion.div>
                  )}
                  {i === 3 && !active && <div className="h-10 mt-6" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SlideShell>
  );
}

/* ============================================================
   06. COMMANDS vs CONVERSATION
   ============================================================ */

function CommandsVsConvoSlide() {
  return (
    <SlideShell kicker="06 · Two modes of voice" title="Commands vs Conversation">
      <div className="grid grid-cols-2 gap-12">
        <Reveal at={0} delay={0.15}>
          <div className="kn-glass kn-glow-cyan h-[680px] p-14 flex flex-col">
            <div className="kn-mono text-[14px] text-kn-cyan">Mode A</div>
            <div className="kn-display text-[64px] mt-2 font-extrabold">
              Command Mode
            </div>
            <div className="mt-10 space-y-7">
              {[
                ["Deterministic", "Exact phrases like 'next slide' or 'submit'."],
                ["Fast", "Low latency, predictable, bounded actions."],
                ["Safer", "Best for navigation, toggles, and filters."],
              ].map(([key, v], i) => (
                <Reveal
                  key={key}
                  at={0}
                  delay={0.3 + i * 0.12}
                  y={12}
                  className="flex gap-5"
                >
                  <div className="text-kn-cyan kn-mono text-[14px] w-32 pt-2 flex-none">
                    {key}
                  </div>
                  <div className="text-[24px] text-kn-fg/85 leading-snug">
                    {v}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal at={0} delay={0.3}>
          <div className="kn-glass kn-glow-magenta h-[680px] p-14 flex flex-col">
            <div className="kn-mono text-[14px] text-kn-magenta">Mode B</div>
            <div className="kn-display text-[64px] mt-2 font-extrabold">
              Conversation Mode
            </div>
            <div className="mt-10 space-y-7">
              {[
                ["Flexible", "Natural language: 'show last week's signups'."],
                ["Ambiguous", "Needs interpretation and slot extraction."],
                ["AI-Friendly", "Best for assistants, search, and summaries."],
              ].map(([key, v], i) => (
                <Reveal
                  key={key}
                  at={0}
                  delay={0.45 + i * 0.12}
                  y={12}
                  className="flex gap-5"
                >
                  <div className="text-kn-magenta kn-mono text-[14px] w-32 pt-2 flex-none">
                    {key}
                  </div>
                  <div className="text-[24px] text-kn-fg/85 leading-snug">
                    {v}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </SlideShell>
  );
}

/* ============================================================
   08. JS IMPLEMENTATION - From mic to action
   ============================================================ */

type JsCard = {
  kicker: string;
  caption: string;
  filename: string;
  lines: ReactNode[];
  highlight: number[];
  color: string;
};

function JsImplementationSlide() {
  const step = useContext(StepContext);

  const cards: JsCard[] = [
    {
      kicker: "Listen loop",
      caption: "One controller orchestrates the whole flow.",
      filename: "controller.tsx",
      highlight: [5, 6, 7, 8],
      color: "var(--kn-cyan)",
      lines: [
        <>{k("function")} {fn("VoiceController")}{punc("() {")}</>,
        <>  {k("let")} {idt("transcript")} {punc("=")} {str('""')}{punc(";")}</>,
        <>  {k("let")} {idt("isListening")} {punc("=")} {k("false")}{punc(";")}</>,
        <></>,
        <>  {cmt("// 1. Listen continuously")}</>,
        <>  {cmt("// 2. Wait for a pause")}</>,
        <>  {cmt("// 3. Match command")}</>,
        <>  {cmt("// 4. Dispatch safe action")}</>,
        <>{punc("}")}</>,
      ],
    },
    {
      kicker: "Command registry",
      caption: "One source of truth for phrases and handlers.",
      filename: "commands.ts",
      highlight: [2, 3, 4],
      color: "var(--kn-violet)",
      lines: [
        <>{k("const")} {idt("commands")} {punc("= [")}</>,
        <>  {punc("{")} {idt("phrases")}{punc(":")} {punc("[")}{str('"next slide"')}{punc(",")} {str('"next"')}{punc("]")}{punc(",")} {idt("action")}{punc(":")} {fn("goNext")} {punc("},")}</>,
        <>  {punc("{")} {idt("phrases")}{punc(":")} {punc("[")}{str('"previous slide"')}{punc("]")}{punc(",")} {idt("action")}{punc(":")} {fn("goPrev")} {punc("},")}</>,
        <>  {punc("{")} {idt("phrases")}{punc(":")} {punc("[")}{str('"pause timer"')}{punc("]")}{punc(",")} {idt("action")}{punc(":")} {fn("pauseTimer")} {punc("},")}</>,
        <>{punc("];")}</>,
      ],
    },
    {
      kicker: "User feedback",
      caption: "Show what was heard and what fired.",
      filename: "ui.tsx",
      highlight: [1, 2, 3],
      color: "var(--kn-magenta)",
      lines: [
        <>{punc("<")}{k("voice-interface")} {punc("/>")}</>,
        <>{punc("<")}{k("voice-subtitle-bar")} {punc("/>")}</>,
        <>{punc("<")}{k("timer-component")} {idt("timer")}{punc("=")}{str('"25"')} {punc("/>")}</>,
      ],
    },
  ];

  return (
    <SlideShell kicker="07 · JavaScript Implementation" title="From mic to action">
      <div className="grid grid-cols-3 gap-8">
        {cards.map((card, i) => {
          const visible = step >= i;
          const focused = step === i;

          return (
            <motion.div
              key={card.kicker}
              className="flex flex-col h-[700px]"
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={
                visible
                  ? {
                      opacity: focused ? 1 : 0.55,
                      y: focused ? -6 : 0,
                      filter: "blur(0px)",
                    }
                  : { opacity: 0, y: 30, filter: "blur(8px)" }
              }
              transition={{ duration: 0.6, ease: EASE }}
            >
              <motion.div
                className="kn-glass p-8 flex-1 flex flex-col relative overflow-hidden"
                animate={{
                  boxShadow: focused
                    ? `0 0 80px -10px ${card.color}, 0 0 0 2px ${card.color}`
                    : visible
                      ? "0 30px 80px -30px oklch(0 0 0 / 0.6)"
                      : "none",
                }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {/* sliding "focus" beam */}
                {focused && (
                  <motion.div
                    className="absolute inset-x-0 h-[120px] pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, transparent, ${card.color}1A, transparent)`,
                    }}
                    initial={{ top: -120 }}
                    animate={{ top: 720 }}
                    transition={{
                      duration: 3.5,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  />
                )}

                <div className="flex items-center gap-3 relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center kn-mono text-[12px] font-bold"
                    style={{
                      background: focused ? card.color : "transparent",
                      color: focused
                        ? "oklch(0.10 0.02 265)"
                        : card.color,
                      border: `1px solid ${card.color}`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    className="kn-mono text-[14px]"
                    style={{ color: card.color }}
                  >
                    {card.kicker}
                  </div>
                </div>

                <div className="mt-6 font-mono relative">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-kn-magenta/70" />
                    <span className="w-2 h-2 rounded-full bg-kn-violet/70" />
                    <span className="w-2 h-2 rounded-full bg-kn-cyan/70" />
                    <span className="ml-2 kn-mono text-[10px] text-kn-fg/40">
                      {card.filename}
                    </span>
                  </div>
                  <div className="text-[15px] leading-[1.7] font-mono">
                    {card.lines.map((line, li) => {
                      const isHi = focused && card.highlight.includes(li + 1);
                      return (
                        <motion.div
                          key={li}
                          className="grid grid-cols-[24px_1fr] gap-2 px-1"
                          animate={{
                            background: isHi
                              ? `linear-gradient(90deg, ${card.color}1F, transparent 80%)`
                              : "transparent",
                            borderLeft: isHi
                              ? `2px solid ${card.color}`
                              : "2px solid transparent",
                          }}
                          transition={{ duration: 0.4 }}
                        >
                          <span className="text-kn-fg/25 text-right select-none">
                            {li + 1}
                          </span>
                          <span>{line}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto pt-6 relative">
                  <div className="kn-divider mb-5" />
                  <div className="text-[19px] text-kn-fg/80 leading-snug">
                    {card.caption}
                  </div>

                  {focused && (
                    <motion.div
                      className="mt-4 inline-flex items-center gap-2 kn-mono text-[11px] px-3 py-1.5 rounded-full"
                      style={{
                        color: card.color,
                        border: `1px solid ${card.color}`,
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      >
                        ●
                      </motion.span>
                      EXPLAINING THIS
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </SlideShell>
  );
}

/* ============================================================
   09. DEMO
   ============================================================ */

function DemoSlide() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-32">
      <div className="relative z-10 text-center">
        <Reveal at={0}>
          <Kicker>08 · Live</Kicker>
        </Reveal>
        <Reveal at={0} delay={0.15}>
          <h1 className="kn-display text-[240px] mt-6 leading-none">
            <span className="kn-text-grad">Demo</span>
          </h1>
        </Reveal>
        <Reveal at={0} delay={0.4}>
          <div className="mt-16 kn-glass kn-glow-cyan inline-flex items-center gap-8 px-12 py-8">
            <motion.div
              className="w-6 h-6 rounded-full"
              style={{ background: "var(--kn-cyan)" }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <div className="text-[36px] font-mono">/demo-dictation</div>
            <div className="kn-mono text-[14px] text-kn-fg/50">
              open voice demo →
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   11. USING AI
   ============================================================ */

function UsingAiSlide() {
  return (
    <SlideShell kicker="09 · Using AI" title="Where AI fits">
      <div className="grid grid-cols-2 gap-12">
        <Reveal at={0} delay={0.2}>
          <div className="kn-glass kn-glow-cyan p-12 h-[620px]">
            <div className="kn-mono text-[14px] text-kn-cyan">
              Where AI helps
            </div>
            <div className="kn-display text-[44px] font-bold mt-4">Augment</div>
            <div className="mt-8 space-y-6">
              {[
                ["Intent Extraction", "Fuzzy text becomes a structured intent."],
                ["Contextual Help", "In-app answers without rigid commands."],
                ["Formatting", "Clean dictation, summarize, extract tasks."],
              ].map(([t, v]) => (
                <div key={t}>
                  <div className="text-[22px] kn-display font-bold">✓ {t}</div>
                  <div className="text-[20px] text-kn-fg/65 mt-2 leading-snug">
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal at={0} delay={0.35}>
          <div className="kn-glass kn-glow-magenta p-12 h-[620px]">
            <div className="kn-mono text-[14px] text-kn-magenta">
              Where AI shouldn't lead
            </div>
            <div className="kn-display text-[44px] font-bold mt-4">
              Don't drive
            </div>
            <div className="mt-8 space-y-6">
              {[
                ["Critical Controls", "No model fires payments or deletes directly."],
                ["Permission Boundaries", "Model suggests. App executes."],
                ["Basic Commands", "Known phrases stay deterministic."],
              ].map(([t, v]) => (
                <div key={t}>
                  <div className="text-[22px] kn-display font-bold">✕ {t}</div>
                  <div className="text-[20px] text-kn-fg/65 mt-2 leading-snug">
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </SlideShell>
  );
}

/* ============================================================
   12. HYBRID MODEL - auto-stagger every 2s
   ============================================================ */

const HYBRID_STEPS = [
  {
    n: "01",
    title: "Exact Match",
    body: "Try the command registry first.",
    color: "var(--kn-cyan)",
  },
  {
    n: "02",
    title: "AI Intent",
    body: "If nothing matches, ask the model.",
    color: "var(--kn-violet)",
  },
  {
    n: "03",
    title: "Allow-list",
    body: "Validate before the dispatcher fires.",
    color: "var(--kn-magenta)",
  },
];

function HybridModelSlide() {
  const stage = useAutoStage(3, 2000, 1);

  return (
    <SlideShell kicker="10 · Using AI" title="The Hybrid Model">
      <div className="flex flex-col justify-center gap-12">
        <Reveal at={0} delay={0.15}>
          <div className="flex items-center justify-center">
            <div className="kn-glass px-8 py-5 inline-flex items-center gap-4">
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ background: "var(--kn-cyan)" }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <div className="font-mono text-[22px] text-kn-fg/85">
                "uh, can you skip to the next one"
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-3 gap-8 relative">
          {/* connector - z-low */}
          <div className="absolute top-[110px] left-[5%] right-[5%] h-px bg-gradient-to-r from-kn-cyan/40 via-kn-violet/40 to-kn-magenta/40 -z-10 pointer-events-none" />

          {HYBRID_STEPS.map((stp, i) => {
            const active = stage > i;
            return (
              <motion.div
                key={stp.n}
                className="flex flex-col items-center text-center relative z-10"
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={
                  active
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0.25, y: 12, filter: "blur(3px)" }
                }
                transition={{ duration: 0.7, ease: EASE }}
              >
                <motion.div
                  className="kn-glass w-56 h-56 rounded-3xl flex items-center justify-center relative"
                  style={{
                    boxShadow: active
                      ? `0 0 80px -12px ${stp.color}, 0 0 0 1px ${stp.color}`
                      : "0 0 0 0 transparent",
                  }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 4 + i * 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div
                    className="kn-display text-[80px] font-extrabold leading-none"
                    style={{ color: stp.color }}
                  >
                    {stp.n}
                  </div>
                </motion.div>
                <div className="kn-display text-[36px] mt-10 font-bold">
                  {stp.title}
                </div>
                <div className="text-[20px] text-kn-fg/65 mt-3 max-w-[360px] leading-snug">
                  {stp.body}
                </div>
              </motion.div>
            );
          })}

          {/* packet flowing through */}
          <motion.div
            className="absolute top-[107px] w-4 h-4 rounded-full z-10"
            style={{
              left: "5%",
              background: "var(--kn-fg)",
              boxShadow: "0 0 24px 4px oklch(0.85 0.15 200 / 0.7)",
            }}
            animate={{ left: ["5%", "95%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <Reveal at={0} delay={0.85}>
          <div className="text-center font-mono text-[22px] text-kn-fg/65">
            →{" "}
            <span style={{ color: "var(--kn-cyan)" }}>
              {`{ command: "next_slide" }`}
            </span>
          </div>
        </Reveal>

        <Reveal at={0} delay={1.0}>
          <div className="text-center kn-mono text-[14px] text-kn-fg/50 tracking-[0.3em]">
            DETERMINISTIC · FLEXIBLE · SAFE
          </div>
        </Reveal>
      </div>
    </SlideShell>
  );
}

/* ============================================================
   15. BEST PRACTICES
   ============================================================ */

const BEST_PRACTICES = [
  "Always show microphone state and permission state",
  "Keep keyboard and mouse fallback for every critical flow",
  "Separate transcript, intent, and action",
  "Confirm destructive actions before executing them",
  "Use final phrases for commands, not unstable interim text",
  "Measure latency, failures, and no-match commands",
  "Design for noise, accents, and bad networks",
  "Be explicit about what stays local vs goes to cloud",
];

function BestPracticesSlide() {
  return (
    <SlideShell kicker="11 · Best Practices" title="Ship-ready voice">
      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        {BEST_PRACTICES.map((bp, i) => (
          <Reveal key={bp} at={0} delay={0.15 + i * 0.08} y={14}>
            <div className="kn-glass px-8 py-6 flex items-center gap-6 h-full">
              <div className="kn-mono text-[14px] text-kn-cyan w-12">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="text-[24px] text-kn-fg/90 leading-snug">{bp}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

/* ============================================================
   16. SUMMING UP
   ============================================================ */

const SUMMARY = [
  "Voice is the most natural interface",
  "Web apps can listen, understand, and respond",
  "Keep state, transcript, intent, and action separate",
  "Deterministic commands come before AI interpretation",
  "AI is best for ambiguity, extraction, and assistance",
  "The app always owns execution and safety",
];

function SummingUpSlide() {
  return (
    <SlideShell kicker="12 · Summing up" title="Principles to take home">
      <div className="flex flex-col gap-10">
        <div className="grid grid-cols-2 gap-x-16 gap-y-6">
          {SUMMARY.map((line, i) => (
            <Reveal key={line} at={0} delay={0.2 + i * 0.12} y={16}>
              <div className="flex items-start gap-6">
                <div className="kn-mono text-[16px] text-kn-cyan pt-3 w-10">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-[28px] kn-display font-semibold leading-snug">
                  {line}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal at={0} delay={1.0}>
          <div className="text-center text-[64px] kn-display font-extrabold">
            Let's build apps that <span className="kn-text-grad">listen</span>.
          </div>
        </Reveal>
      </div>
    </SlideShell>
  );
}

/* ============================================================
   17. Q&A + THANKS
   ============================================================ */

function QaThanksSlide() {
  return (
    <div className="absolute inset-0 flex flex-col px-32 py-20">
      <div className="relative z-10 flex-1 flex flex-col">
        <Reveal at={0}>
          <Kicker>13 · Over to you</Kicker>
        </Reveal>

        <div className="flex-1 flex flex-col items-center justify-center -mt-8">
          <Reveal at={0} delay={0.15}>
            <h1 className="kn-display text-[280px] leading-[0.95] text-center">
              <span className="kn-text-grad">Q&A</span>{" "}
              <span className="text-kn-fg/30 font-light">&</span>{" "}
              <span className="text-kn-fg">Thanks</span>
            </h1>
          </Reveal>

          <Reveal at={0} delay={0.5}>
            <div className="kn-mono text-[18px] text-kn-fg/50 mt-10 tracking-[0.5em]">
              ASK · ME · ANYTHING
            </div>
          </Reveal>
        </div>

        <Reveal at={0} delay={0.75}>
          <div className="kn-glass mt-8 p-8 flex items-center justify-between gap-10">
            <div className="flex-none">
              <div className="kn-mono text-[12px] text-kn-fg/40">Speaker</div>
              <div className="kn-display text-[34px] mt-1 font-bold">
                Jagadeesh Jayachandran
              </div>
              <div className="text-[18px] text-kn-fg/65 mt-1">
                Front End Developer · Turing.com
              </div>
            </div>

            <div className="flex-1 grid grid-cols-4 gap-4">
              {[
                ["LinkedIn", "/in/jjayy", "https://www.linkedin.com/in/jjayy"],
                ["GitHub", "/jaga3421", "https://www.github.com/jaga3421"],
                ["Website", "jagadeesh-j.vercel.app", "https://jagadeesh-j.vercel.app"],
                ["Email", "jagadeesh.jkp@gmail.com", "mailto:jagadeesh.jkp@gmail.com"],
              ].map(([label, value, href]) => (
                <a
                  key={label as string}
                  className="kn-glass p-4 hover:kn-glow-cyan transition-shadow block"
                  href={href as string}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="kn-mono text-[11px] text-kn-cyan">{label}</div>
                  <div className="text-[14px] mt-1 font-mono text-kn-fg/85 break-all">
                    {value}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   SLIDES EXPORT
   ============================================================ */

export type SlideDef = {
  id: string;
  title: string;
  steps: number;
  render: () => ReactNode;
};

export const slides: SlideDef[] = [
  { id: "cover", title: "Cover", steps: 1, render: () => <CoverSlide /> },
  { id: "agenda", title: "Talk Agenda", steps: 1, render: () => <AgendaSlide /> },
  { id: "evolution", title: "CLI to GUI to Voice", steps: 1, render: () => <EvolutionSlide /> },
  { id: "use-cases", title: "Use Cases", steps: 1, render: () => <UseCasesSlide /> },
  { id: "loop", title: "The Interaction Loop", steps: 1, render: () => <InteractionLoopSlide /> },
  { id: "cmd-convo", title: "Commands vs Conversation", steps: 1, render: () => <CommandsVsConvoSlide /> },
  { id: "js-impl", title: "From mic to action", steps: 3, render: () => <JsImplementationSlide /> },
  { id: "demo", title: "Demo", steps: 1, render: () => <DemoSlide /> },
  { id: "ai-where", title: "Where AI fits", steps: 1, render: () => <UsingAiSlide /> },
  { id: "hybrid", title: "The Hybrid Model", steps: 1, render: () => <HybridModelSlide /> },
  { id: "best", title: "Ship-ready voice", steps: 1, render: () => <BestPracticesSlide /> },
  { id: "sum", title: "Summing Up", steps: 1, render: () => <SummingUpSlide /> },
  { id: "qa-thanks", title: "Q&A · Thanks", steps: 1, render: () => <QaThanksSlide /> },
];
