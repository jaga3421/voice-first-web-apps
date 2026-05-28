import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { slides, StepContext } from "./slides";

const EASE = [0.22, 1, 0.36, 1] as const;
const TIMER_TOTAL_SECONDS = 25 * 60;

export function Deck() {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [gridOpen, setGridOpen] = useState(false);

  const slide = slides[index];
  const stepCount = slide?.steps ?? 1;

  const advance = useCallback(() => {
    if (gridOpen) return;
    if (step < stepCount - 1) {
      setStep((s) => s + 1);
    } else if (index < slides.length - 1) {
      setIndex(index + 1);
      setStep(0);
    }
  }, [step, stepCount, index, gridOpen]);

  const retreat = useCallback(() => {
    if (gridOpen) return;
    if (step > 0) {
      setStep((s) => s - 1);
    } else if (index > 0) {
      const prev = slides[index - 1];
      setIndex(index - 1);
      setStep((prev?.steps ?? 1) - 1);
    }
  }, [step, index, gridOpen]);

  const go = useCallback(
    (i: number, where: "first" | "last" = "first") => {
      const clamped = Math.max(0, Math.min(slides.length - 1, i));
      setIndex(clamped);
      const s = slides[clamped];
      setStep(where === "last" ? (s?.steps ?? 1) - 1 : 0);
    },
    []
  );

  /* ----- keyboard ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          if (gridOpen) setGridOpen(false);
          else advance();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          retreat();
          break;
        case "ArrowDown":
          e.preventDefault();
          go(index + 1, "first");
          break;
        case "ArrowUp":
          e.preventDefault();
          go(index - 1, "first");
          break;
        case "Home":
          e.preventDefault();
          go(0, "first");
          break;
        case "End":
          e.preventDefault();
          go(slides.length - 1, "last");
          break;
        case "g":
        case "G":
          e.preventDefault();
          setGridOpen((v) => !v);
          break;
        case "f":
        case "F":
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
          break;
        case "Escape":
          if (gridOpen) {
            e.preventDefault();
            setGridOpen(false);
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, retreat, go, gridOpen, index]);

  return (
    <div className="kn-root">
      <Stage>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.985, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.01, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <StepContext.Provider value={step}>
              {slide.render()}
            </StepContext.Provider>
          </motion.div>
        </AnimatePresence>
      </Stage>

      <TopHUD />

      <BottomHUD index={index} total={slides.length} />

      <MobileTapNav onPrev={retreat} onNext={advance} />

      <AnimatePresence>
        {gridOpen && (
          <GridOverview
            currentIndex={index}
            onPick={(i) => {
              setIndex(i);
              setStep(0);
              setGridOpen(false);
            }}
            onClose={() => setGridOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   MOBILE TAP NAV - left half = prev, right half = next
   ============================================================ */

function MobileTapNav({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex md:hidden pointer-events-none">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous slide"
        className="flex-1 pointer-events-auto active:bg-white/5 transition-colors"
      />
      <button
        type="button"
        onClick={onNext}
        aria-label="Next slide"
        className="flex-1 pointer-events-auto active:bg-white/5 transition-colors"
      />
    </div>
  );
}

/* ============================================================
   STAGE
   ============================================================ */

function Stage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const scale = Math.min(
        window.innerWidth / 1920,
        window.innerHeight / 1080
      );
      el.style.transform = `scale(${scale})`;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div ref={ref} className="kn-stage kn-grid-bg">
      <GlobalAurora />
      {children}
    </div>
  );
}

/* Animated aurora background */
function GlobalAurora() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 1100,
          height: 1100,
          left: "-5%",
          top: "5%",
          background:
            "radial-gradient(circle, oklch(0.70 0.20 290 / 0.42), transparent 65%)",
          filter: "blur(70px)",
        }}
        animate={{
          scale: [1, 1.18, 1.05, 1],
          x: [0, 80, -50, 0],
          y: [0, -40, 50, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 1200,
          height: 1200,
          right: "-8%",
          bottom: "-8%",
          background:
            "radial-gradient(circle, oklch(0.85 0.15 200 / 0.35), transparent 65%)",
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1, 1.12, 0.95, 1],
          x: [0, -60, 40, 0],
          y: [0, 40, -30, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 900,
          height: 900,
          left: "35%",
          top: "30%",
          background:
            "radial-gradient(circle, oklch(0.70 0.25 340 / 0.25), transparent 65%)",
          filter: "blur(90px)",
        }}
        animate={{
          scale: [1, 1.25, 1.05, 1],
          x: [0, -50, 70, 0],
          y: [0, 50, -40, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ============================================================
   TOP HUD - title · counter · meetup + timer
   ============================================================ */

type PaceLevel = "ok" | "warn" | "danger";

const WARN_THRESHOLD_SECONDS = 5 * 60;
const DANGER_THRESHOLD_SECONDS = 60;

function useCountdown(totalSeconds: number) {
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const level: PaceLevel =
    remaining <= DANGER_THRESHOLD_SECONDS
      ? "danger"
      : remaining <= WARN_THRESHOLD_SECONDS
        ? "warn"
        : "ok";
  return {
    label: `${mm}:${ss}`,
    pct: remaining / totalSeconds,
    remaining,
    level,
  };
}

const PACE_COLOR: Record<PaceLevel, string> = {
  ok: "var(--kn-grad-aurora)",
  warn: "oklch(0.82 0.18 70)",
  danger: "oklch(0.65 0.25 25)",
};

function TopHUD() {
  const { label, pct, level } = useCountdown(TIMER_TOTAL_SECONDS);
  const pulsing = level !== "ok";
  const pulseDuration = level === "danger" ? 0.7 : 1.4;

  return (
    <div className="fixed top-0 inset-x-0 z-40 pointer-events-none">
      <div className="grid grid-cols-3 items-start px-10 pt-6">
        {/* LEFT - title */}
        <div className="kn-mono text-[13px] text-kn-fg tracking-[0.32em] font-bold pt-1">
          VOICE FIRST WEB APPS
        </div>

        {/* CENTER - timer + depleting bar */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 text-kn-fg">
            <TimerIcon />
            <div className="kn-mono text-[14px] tracking-[0.22em] font-bold tabular-nums">
              {label}
            </div>
          </div>
          <motion.div
            className="rounded-full overflow-hidden"
            style={{ background: "oklch(0.65 0.05 260 / 0.18)" }}
            animate={{
              width: level === "danger" ? 260 : 220,
              height: level === "danger" ? 5 : 3,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="h-full rounded-full"
              animate={{
                width: `${Math.max(0, Math.min(1, pct)) * 100}%`,
                background: PACE_COLOR[level],
                opacity: pulsing ? [1, 0.4, 1] : 1,
              }}
              transition={{
                width: { duration: 0.5, ease: "linear" },
                background: { duration: 0.4 },
                opacity: pulsing
                  ? { duration: pulseDuration, repeat: Infinity }
                  : { duration: 0.4 },
              }}
            />
          </motion.div>
        </div>

        {/* RIGHT - meetup */}
        <div className="kn-mono text-[13px] text-kn-fg tracking-[0.32em] font-bold text-right pt-1">
          JsLovers × MongoDB
        </div>
      </div>
    </div>
  );
}

function TimerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 9v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================
   BOTTOM HUD - controls + progress bar
   ============================================================ */

function BottomHUD({ index, total }: { index: number; total: number }) {
  const progress = index / Math.max(1, total - 1);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none flex items-end">
      {/* progress bar - bottom 0, ends before the counter */}
      <div
        className="h-[5px] flex-1 mr-3"
        style={{ background: "oklch(0.65 0.05 260 / 0.12)" }}
      >
        <motion.div
          className="h-full"
          style={{ background: "var(--kn-grad-aurora)" }}
          animate={{
            width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </div>

      {/* bottom-right counter */}
      <div className="kn-mono text-[13px] text-kn-fg tracking-[0.32em] font-bold tabular-nums pr-8 pb-3 w-[140px] text-right">
        {String(index + 1).padStart(2, "0")} /{" "}
        {String(total).padStart(2, "0")}
      </div>
    </div>
  );
}

/* ============================================================
   GRID OVERVIEW
   ============================================================ */

function GridOverview({
  currentIndex,
  onPick,
  onClose,
}: {
  currentIndex: number;
  onPick: (i: number) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto kn-scroll-hide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: "oklch(0.10 0.02 265 / 0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
      onClick={onClose}
    >
      <div className="min-h-full px-16 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="kn-kicker">Overview</div>
            <div className="kn-display text-[40px] mt-2 font-bold">
              {slides.length} slides
            </div>
          </div>
          <button
            className="kn-glass px-5 py-3 rounded-full kn-mono text-[12px] text-kn-fg/70"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ESC · CLOSE
          </button>
        </div>

        <div
          className="grid grid-cols-4 gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((s, i) => {
            const isCurrent = i === currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => onPick(i)}
                className={`group text-left rounded-2xl overflow-hidden transition-all ${
                  isCurrent
                    ? "ring-2 ring-kn-cyan kn-glow-cyan"
                    : "ring-1 ring-kn-border hover:ring-kn-fg/30"
                }`}
              >
                <div className="aspect-video kn-glass relative overflow-hidden">
                  <div
                    className="absolute"
                    style={{
                      width: 1920,
                      height: 1080,
                      transform: "scale(0.18)",
                      transformOrigin: "top left",
                      pointerEvents: "none",
                    }}
                  >
                    <StepContext.Provider value={(s.steps ?? 1) - 1}>
                      {s.render()}
                    </StepContext.Provider>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 kn-glass border-t border-kn-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="kn-mono text-[11px] text-kn-cyan">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14px] truncate text-kn-fg/85">
                      {s.title}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="kn-mono text-[10px] text-kn-cyan">
                      NOW
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
