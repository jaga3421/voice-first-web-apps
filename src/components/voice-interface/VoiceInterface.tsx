import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const PAUSE_AFTER_SPEECH_MS = 500;
const POST_MATCH_IGNORE_MS = 2000;

const SPELLED_SLIDE_NUMBERS: Record<string, number> = {
  one: 1,
  first: 1,
  two: 2,
  second: 2,
  three: 3,
  third: 3,
  four: 4,
  fourth: 4,
  five: 5,
  fifth: 5,
  six: 6,
  sixth: 6,
  seven: 7,
  seventh: 7,
  eight: 8,
  eighth: 8,
  nine: 9,
  ninth: 9,
  ten: 10,
  tenth: 10,
};

const normalizeTranscript = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getTranscriptDelta = (previousText: string, currentText: string) => {
  const previous = previousText.trim();
  const current = currentText.trim();

  if (!current) return "";
  if (!previous) return current;
  if (current.startsWith(previous)) {
    return current.slice(previous.length).trim();
  }

  const previousIndex = current.indexOf(previous);
  if (previousIndex >= 0) {
    return current.slice(previousIndex + previous.length).trim();
  }

  return current;
};

const dispatchTimerCommand = (action: "start" | "pause" | "resume") => {
  window.dispatchEvent(
    new CustomEvent("voice-interface:timer-command", {
      detail: { action },
    })
  );
};

const dispatchCelebration = () => {
  window.dispatchEvent(new CustomEvent("voice-interface:celebrate"));
};

const dispatchSubtitleVisibility = (visible: boolean) => {
  window.dispatchEvent(
    new CustomEvent("voice-interface:subtitle-visibility", {
      detail: { visible },
    })
  );
};

const dispatchSubtitleUpdate = (text: string) => {
  window.dispatchEvent(
    new CustomEvent("voice-interface:subtitle-fragment", {
      detail: { text },
    })
  );
};

const dispatchSubtitleCommit = (text: string) => {
  window.dispatchEvent(
    new CustomEvent("voice-interface:subtitle-commit", {
      detail: { text },
    })
  );
};

const dispatchSubtitleClear = () => {
  window.dispatchEvent(new CustomEvent("voice-interface:subtitle-clear"));
};

const dispatchDeckAdvance = () => {
  window.dispatchEvent(new CustomEvent("deck:advance"));
};

const dispatchDeckRetreat = () => {
  window.dispatchEvent(new CustomEvent("deck:retreat"));
};

const dispatchDeckGoIndex = (index: number) => {
  window.dispatchEvent(
    new CustomEvent("deck:go-index", {
      detail: { index },
    })
  );
};

const dispatchDeckGoId = (id: string) => {
  window.dispatchEvent(
    new CustomEvent("deck:go-id", {
      detail: { id },
    })
  );
};

let subtitleBaselineTranscript = "";

const extractSlideNumber = (normalizedText: string) => {
  const digitMatch =
    normalizedText.match(
      /(?:go to|open)?\s*(?:slide\s*)?(\d+)(?:st|nd|rd|th)?\s*slide?/
    ) || normalizedText.match(/slide\s*(\d+)(?:st|nd|rd|th)?/);

  if (digitMatch) {
    return Number(digitMatch[1]);
  }

  for (const [word, number] of Object.entries(SPELLED_SLIDE_NUMBERS)) {
    const patterns = [
      `go to ${word} slide`,
      `go to slide ${word}`,
      `${word} slide`,
      `slide ${word}`,
    ];

    if (patterns.some((pattern) => normalizedText.includes(pattern))) {
      return number;
    }
  }

  return null;
};

const executeVoiceCommand = (
  normalizedText: string,
  currentTranscript = ""
) => {
  if (!normalizedText) return false;

  if (
    normalizedText === "show" ||
    normalizedText === "show subtitle" ||
    normalizedText === "show subtitles"
  ) {
    subtitleBaselineTranscript = currentTranscript.trim();
    dispatchSubtitleClear();
    dispatchSubtitleVisibility(true);
    return true;
  }

  if (
    normalizedText === "hide" ||
    normalizedText === "hide subtitle" ||
    normalizedText === "hide subtitles"
  ) {
    dispatchSubtitleClear();
    dispatchSubtitleVisibility(false);
    return true;
  }

  if (
    normalizedText === "100" ||
    normalizedText.includes(" 100 ") ||
    normalizedText.startsWith("100 ") ||
    normalizedText.endsWith(" 100") ||
    normalizedText.includes("one hundred") ||
    normalizedText.includes("hundred") ||
    normalizedText.includes("hundreth") ||
    normalizedText.includes("my demo") ||
    normalizedText.includes("my demos")
  ) {
    dispatchCelebration();
    return true;
  }

  if (normalizedText.includes("agenda")) {
    dispatchDeckGoId("agenda");
    return true;
  }

  const requestedSlideNumber = extractSlideNumber(normalizedText);
  if (requestedSlideNumber) {
    dispatchDeckGoIndex(requestedSlideNumber - 1);
    return true;
  }

  if (
    normalizedText.includes("next slide") ||
    normalizedText === "next" ||
    normalizedText.endsWith(" next") ||
    normalizedText.startsWith("next ") ||
    normalizedText.includes("go next") ||
    normalizedText.includes("go to next") ||
    normalizedText.includes("go to the next") ||
    normalizedText.includes("to the next") ||
    normalizedText.includes("move next") ||
    normalizedText.includes("move to next") ||
    normalizedText.includes("move forward") ||
    normalizedText.includes("scroll down")
  ) {
    dispatchDeckAdvance();
    return true;
  }

  if (
    normalizedText.includes("previous slide") ||
    normalizedText === "previous" ||
    normalizedText.endsWith(" previous") ||
    normalizedText.startsWith("previous ") ||
    normalizedText.includes("go back") ||
    normalizedText.includes("go to previous") ||
    normalizedText.includes("go to the previous") ||
    normalizedText.includes("to the previous") ||
    normalizedText.includes("move previous") ||
    normalizedText.includes("move back") ||
    normalizedText.includes("scroll up")
  ) {
    dispatchDeckRetreat();
    return true;
  }

  if (
    normalizedText.includes("start timer") ||
    normalizedText.includes("start the timer")
  ) {
    dispatchTimerCommand("start");
    return true;
  }

  if (
    normalizedText.includes("resume timer") ||
    normalizedText.includes("resume the timer")
  ) {
    dispatchTimerCommand("resume");
    return true;
  }

  if (
    normalizedText.includes("pause timer") ||
    normalizedText.includes("pause the timer") ||
    normalizedText.includes("pass timer") ||
    normalizedText.includes("pass the timer") ||
    normalizedText.includes("pasta timer") ||
    normalizedText.includes("past the timer") ||
    normalizedText.includes("for the timer") ||
    normalizedText.includes("as the timer")
  ) {
    dispatchTimerCommand("pause");
    return true;
  }

  return false;
};

const logVoiceCapture = (
  capturedText: string,
  matched: boolean,
  executed: boolean
) => {
  console.log(
    `[voice] heard="${capturedText}" matched=${matched ? "yes" : "no"} executed=${
      executed ? "yes" : "no"
    }`
  );
};

type IndicatorStatus =
  | "idle"
  | "enabled"
  | "listening"
  | "transcribing"
  | "matched"
  | "error";

export default function VoiceInterface() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [indicatorStatus, setIndicatorStatus] = useState<IndicatorStatus>("idle");
  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const indicatorResetTimerRef = useRef<number | null>(null);
  const postMatchIgnoreTimerRef = useRef<number | null>(null);
  const transcriptRef = useRef("");
  const fullTranscriptRef = useRef("");
  const currentTranscriptSnapshotRef = useRef("");
  const lastConsumedTranscriptRef = useRef("");
  const enabledRef = useRef(false);
  const indicatorStatusRef = useRef<IndicatorStatus>("idle");
  const ignoreSpeechUntilRef = useRef(0);

  const updateIndicatorStatus = (
    nextStatus: IndicatorStatus,
    options: { resetAfterMs?: number | null; force?: boolean } = {}
  ) => {
    const { resetAfterMs = null, force = false } = options;

    if (indicatorResetTimerRef.current) {
      clearTimeout(indicatorResetTimerRef.current);
      indicatorResetTimerRef.current = null;
    }

    if (
      indicatorStatusRef.current === "error" &&
      !force &&
      nextStatus !== "error"
    ) {
      return;
    }

    indicatorStatusRef.current = nextStatus;
    setIndicatorStatus(nextStatus);

    if (resetAfterMs) {
      indicatorResetTimerRef.current = window.setTimeout(() => {
        if (indicatorStatusRef.current === "error") {
          return;
        }

        const fallbackStatus: IndicatorStatus = enabledRef.current
          ? recognitionRef.current && isListening
            ? "listening"
            : "enabled"
          : "idle";

        indicatorStatusRef.current = fallbackStatus;
        setIndicatorStatus(fallbackStatus);
        indicatorResetTimerRef.current = null;
      }, resetAfterMs);
    }
  };

  useEffect(() => {
    enabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    indicatorStatusRef.current = indicatorStatus;
  }, [indicatorStatus]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "q") {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isTypingTarget) {
        return;
      }

      event.preventDefault();
      setIsEnabled((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition is not supported in this browser.");
      updateIndicatorStatus("error", { force: true });
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      updateIndicatorStatus("listening");
    };

    recognition.onresult = (event: any) => {
      if (Date.now() < ignoreSpeechUntilRef.current) {
        transcriptRef.current = "";
        currentTranscriptSnapshotRef.current = "";
        lastConsumedTranscriptRef.current = "";
        dispatchSubtitleUpdate("");
        return;
      }

      let finalChunk = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) {
          finalChunk += `${text} `;
          fullTranscriptRef.current += `${text} `;
        } else {
          interimTranscript += text;
        }
      }

      const subtitleTranscript =
        `${fullTranscriptRef.current}${interimTranscript}`.trim();
      currentTranscriptSnapshotRef.current = subtitleTranscript;
      transcriptRef.current = getTranscriptDelta(
        lastConsumedTranscriptRef.current,
        currentTranscriptSnapshotRef.current
      );
      const subtitleFragment = getTranscriptDelta(
        subtitleBaselineTranscript,
        subtitleTranscript
      );
      dispatchSubtitleUpdate(subtitleFragment);

      if (transcriptRef.current || finalChunk.trim()) {
        updateIndicatorStatus("transcribing", { resetAfterMs: 1000 });
      }

      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }

      pauseTimerRef.current = window.setTimeout(() => {
        const pendingTranscript = transcriptRef.current.trim();
        const normalizedTranscript = normalizeTranscript(pendingTranscript);

        if (pendingTranscript.trim()) {
          dispatchSubtitleCommit(pendingTranscript);
        }

        if (normalizedTranscript) {
          const executed = executeVoiceCommand(
            normalizedTranscript,
            fullTranscriptRef.current.trim()
          );
          if (executed) {
            ignoreSpeechUntilRef.current = Date.now() + POST_MATCH_IGNORE_MS;
            transcriptRef.current = "";
            fullTranscriptRef.current = "";
            currentTranscriptSnapshotRef.current = "";
            lastConsumedTranscriptRef.current = "";
            dispatchSubtitleUpdate("");
            updateIndicatorStatus("matched", { resetAfterMs: 1000 });

            if (postMatchIgnoreTimerRef.current) {
              clearTimeout(postMatchIgnoreTimerRef.current);
            }

            postMatchIgnoreTimerRef.current = window.setTimeout(() => {
              ignoreSpeechUntilRef.current = 0;
              postMatchIgnoreTimerRef.current = null;
            }, POST_MATCH_IGNORE_MS);
          }
          logVoiceCapture(normalizedTranscript, executed, executed);
        }

        lastConsumedTranscriptRef.current = currentTranscriptSnapshotRef.current;
        transcriptRef.current = "";
        dispatchSubtitleUpdate("");
      }, PAUSE_AFTER_SPEECH_MS);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (indicatorStatusRef.current !== "error") {
        updateIndicatorStatus(enabledRef.current ? "enabled" : "idle");
      }

      if (!enabledRef.current) return;

      restartTimerRef.current = window.setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {
          console.warn("Voice interface restart failed:", error);
        }
      }, 200);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.warn("Voice interface error:", event.error);
        updateIndicatorStatus("error", { force: true });
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }

      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }

      if (indicatorResetTimerRef.current) {
        clearTimeout(indicatorResetTimerRef.current);
      }

      if (postMatchIgnoreTimerRef.current) {
        clearTimeout(postMatchIgnoreTimerRef.current);
      }

      recognition.stop();
    };
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;

    if (!recognition) return;

    if (isEnabled) {
      transcriptRef.current = "";
      fullTranscriptRef.current = "";
      currentTranscriptSnapshotRef.current = "";
      lastConsumedTranscriptRef.current = "";
      ignoreSpeechUntilRef.current = 0;
      subtitleBaselineTranscript = "";
      dispatchSubtitleUpdate("");
      updateIndicatorStatus("enabled", { force: true });

      try {
        recognition.start();
      } catch (error) {
        console.warn("Voice interface start failed:", error);
        updateIndicatorStatus("error", { force: true });
      }
      return;
    }

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    transcriptRef.current = "";
    fullTranscriptRef.current = "";
    currentTranscriptSnapshotRef.current = "";
    lastConsumedTranscriptRef.current = "";
    ignoreSpeechUntilRef.current = 0;
    subtitleBaselineTranscript = "";
    dispatchSubtitleClear();
    dispatchSubtitleVisibility(false);

    if (postMatchIgnoreTimerRef.current) {
      clearTimeout(postMatchIgnoreTimerRef.current);
      postMatchIgnoreTimerRef.current = null;
    }
    updateIndicatorStatus("idle", { force: true });

    try {
      recognition.stop();
    } catch (error) {
      console.warn("Voice interface stop failed:", error);
    }
  }, [isEnabled]);

  const active = isEnabled && isListening;
  const speaking = indicatorStatus === "transcribing";
  const error = indicatorStatus === "error";

  const barColor = error
    ? "oklch(0.65 0.25 25)"
    : active
      ? "var(--kn-cyan)"
      : "oklch(0.65 0.05 260 / 0.45)";

  const baseHeights = [4, 7, 10, 13, 10, 7, 4];

  return (
    <button
      type="button"
      aria-label="Toggle voice interface"
      aria-pressed={isEnabled}
      onClick={() => setIsEnabled((prev) => !prev)}
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999] flex h-6 items-end justify-center gap-[3px] px-3 cursor-pointer"
    >
      {baseHeights.map((h, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full"
          style={{ background: barColor, height: h }}
          animate={
            speaking
              ? {
                  height: [h, h * 1.6, h * 0.7, h],
                  opacity: [0.85, 1, 0.7, 0.85],
                }
              : active
                ? {
                    height: [h, h * 1.15, h],
                    opacity: [0.7, 0.9, 0.7],
                  }
                : { height: h, opacity: 0.6 }
          }
          transition={{
            duration: speaking ? 0.9 : 2.4,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        />
      ))}
    </button>
  );
}
