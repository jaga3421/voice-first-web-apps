import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowLeft,
  FaMicrophone,
  FaRobot,
  FaStop,
  FaWaveSquare,
} from "react-icons/fa";

export const Route = createFileRoute("/demo-dictation")({
  component: DictationPage,
});

const SILENCE_GAP_MS = 500;
const SILENCE_RMS_THRESHOLD = 0.02;
const MIN_SPEECH_FRAMES = 6;
const MIN_AUDIO_BLOB_BYTES = 1200;
const MIN_BROWSER_TRANSCRIPT_CHARS = 2;
const COMMAND_REPEAT_GUARD_MS = 4000;

type Command = {
  id: string;
  label: string;
  description: string;
  phrases: string[];
};

const COMMANDS: Command[] = [
  {
    id: "next_slide",
    label: "Next Slide",
    description: "Move one slide forward",
    phrases: ["next slide", "next"],
  },
  {
    id: "previous_slide",
    label: "Previous Slide",
    description: "Move one slide backward",
    phrases: ["previous slide", "previous"],
  },
  {
    id: "agenda",
    label: "Agenda",
    description: "Jump to the agenda slide",
    phrases: ["agenda"],
  },
  {
    id: "start_timer",
    label: "Start Timer",
    description: "Start the presentation timer",
    phrases: ["start timer", "start the timer"],
  },
  {
    id: "pause_timer",
    label: "Pause Timer",
    description: "Pause the presentation timer",
    phrases: ["pause timer", "pause the timer"],
  },
  {
    id: "resume_timer",
    label: "Resume Timer",
    description: "Resume the presentation timer",
    phrases: ["resume timer", "resume the timer"],
  },
];

const normalizeTranscript = (text: string) =>
  text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

const hasTranscribedWord = (text: string) =>
  normalizeTranscript(text).replace(/\s+/g, "").length >= MIN_BROWSER_TRANSCRIPT_CHARS;

const mergeTranscriptSegment = (existingText: string, incomingText: string) => {
  const prev = existingText.replace(/\s+/g, " ").trim();
  const next = incomingText.replace(/\s+/g, " ").trim();
  if (!next) return prev;
  if (!prev) return next;
  if (prev.toLowerCase().endsWith(next.toLowerCase())) {
    return prev;
  }
  return `${prev} ${next}`.trim();
};

const matchExactCommand = (transcript: string): Command | null => {
  const normalized = normalizeTranscript(transcript);
  if (!normalized) return null;
  return (
    COMMANDS.find((command) =>
      command.phrases.some((phrase) =>
        normalized.includes(normalizeTranscript(phrase))
      )
    ) || null
  );
};

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

type ExecutedEntry = {
  id: string;
  label: string;
  source: string;
  phrase: string;
  reason: string;
  at: string;
};

function DictationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [browserTranscript, setBrowserTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeCommandId, setActiveCommandId] = useState<string | null>(null);
  const [executedCommands, setExecutedCommands] = useState<ExecutedEntry[]>([]);
  const [highlightedExecutionId, setHighlightedExecutionId] = useState<
    string | null
  >(null);
  const [isHearingSpeech, setIsHearingSpeech] = useState(false);
  const [recentMatchLabel, setRecentMatchLabel] = useState<string | null>(null);

  const isRecordingRef = useRef(false);
  const useAIRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isSegmentingRef = useRef(false);
  const heardSpeechRef = useRef(false);
  const speechFrameCountRef = useRef(0);
  const browserTranscriptRef = useRef("");
  const browserFinalTranscriptRef = useRef("");
  const recognitionRestartTimerRef = useRef<number | null>(null);
  const recognitionActiveRef = useRef(false);
  const activeCommandTimerRef = useRef<number | null>(null);
  const transcriptPanelRef = useRef<HTMLDivElement | null>(null);
  const commandsPanelRef = useRef<HTMLDivElement | null>(null);
  const executedCommandsPanelRef = useRef<HTMLDivElement | null>(null);
  const executionHighlightTimerRef = useRef<number | null>(null);
  const aiTranscriptRef = useRef("");
  const lastCommandIdRef = useRef<string | null>(null);
  const lastCommandAtRef = useRef(0);

  useEffect(() => {
    useAIRef.current = useAI;
  }, [useAI]);

  useEffect(() => {
    aiTranscriptRef.current = aiTranscript;
  }, [aiTranscript]);

  const handleCommandExecution = (
    command: Command,
    phrase: string,
    source: string,
    reason = ""
  ) => {
    // Guard against the same intent firing back-to-back. Whisper is primed with
    // the running transcript, so on near-silent chunks it tends to re-emit the
    // last command phrase, which the intent matcher then matches again. Skip a
    // repeat of the same command inside a short window (a deliberate repeat after
    // the gap still goes through, and a different command resets immediately).
    const now = Date.now();
    const isRepeat =
      lastCommandIdRef.current === command.id &&
      now - lastCommandAtRef.current < COMMAND_REPEAT_GUARD_MS;
    lastCommandIdRef.current = command.id;
    lastCommandAtRef.current = now;
    if (isRepeat) return;

    setActiveCommandId(command.id);
    if (activeCommandTimerRef.current) {
      clearTimeout(activeCommandTimerRef.current);
    }
    activeCommandTimerRef.current = window.setTimeout(() => {
      setActiveCommandId(null);
    }, 1800);

    const executionId = `${command.id}-${Date.now()}`;
    setExecutedCommands((prev) =>
      [
        ...prev,
        {
          id: executionId,
          label: command.label,
          source,
          phrase,
          reason,
          at: formatTime(),
        },
      ].slice(-7)
    );

    setHighlightedExecutionId(executionId);
    if (executionHighlightTimerRef.current) {
      clearTimeout(executionHighlightTimerRef.current);
    }
    executionHighlightTimerRef.current = window.setTimeout(() => {
      setHighlightedExecutionId(null);
    }, 2200);

    setRecentMatchLabel(command.label);
    window.setTimeout(() => {
      setRecentMatchLabel((current) =>
        current === command.label ? null : current
      );
    }, 1800);
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
    };

    recognition.onresult = (event: any) => {
      let finalChunk = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript || "";
        if (result.isFinal) {
          finalChunk += `${text} `;
          browserFinalTranscriptRef.current += `${text} `;
        } else {
          interimTranscript += text;
        }
      }

      const nextTranscript =
        `${browserFinalTranscriptRef.current}${interimTranscript}`.trim();
      browserTranscriptRef.current = nextTranscript;
      setBrowserTranscript(nextTranscript);

      if (!useAIRef.current) {
        const matchedCommand = matchExactCommand(finalChunk);
        if (matchedCommand) {
          handleCommandExecution(
            matchedCommand,
            finalChunk.trim(),
            "Word match"
          );
        }
      }
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      if (isRecordingRef.current) {
        recognitionRestartTimerRef.current = window.setTimeout(() => {
          if (!isRecordingRef.current || recognitionActiveRef.current) return;
          try {
            recognition.start();
          } catch (error) {
            console.warn("Speech recognition restart failed:", error);
          }
        }, 150);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.warn("Speech recognition error:", event.error);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if (transcriptPanelRef.current) {
      transcriptPanelRef.current.scrollTop =
        transcriptPanelRef.current.scrollHeight;
    }
  }, [browserTranscript, aiTranscript, isTranscribing]);

  useEffect(() => {
    if (commandsPanelRef.current && activeCommandId) {
      const target = commandsPanelRef.current.querySelector(
        `[data-command-id="${activeCommandId}"]`
      );
      (target as HTMLElement | null)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeCommandId]);

  useEffect(() => {
    if (executedCommandsPanelRef.current && executedCommands.length > 0) {
      executedCommandsPanelRef.current.scrollTo({
        top: executedCommandsPanelRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [executedCommands]);

  useEffect(() => {
    return () => {
      if (activeCommandTimerRef.current) {
        clearTimeout(activeCommandTimerRef.current);
      }
      if (executionHighlightTimerRef.current) {
        clearTimeout(executionHighlightTimerRef.current);
      }
    };
  }, []);

  const sendChunkToCloud = async (audioBlob: Blob) => {
    if (!audioBlob || audioBlob.size === 0 || !useAIRef.current) return;

    setIsTranscribing(true);
    const formData = new FormData();
    formData.append("file", audioBlob, "chunk.webm");
    formData.append("context", aiTranscriptRef.current.slice(-300));
    formData.append("transcript", aiTranscriptRef.current);
    formData.append("aiMode", "true");
    formData.append(
      "commands",
      JSON.stringify(
        COMMANDS.map((command) => ({
          id: command.id,
          label: command.label,
          phrases: command.phrases,
          description: command.description,
        }))
      )
    );

    try {
      const res = await fetch("/api/demo-dictation", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        console.error(
          "Transcription Error:",
          errData.details || errData.error
        );
        return;
      }
      const data = await res.json();
      const nextText = data.text?.trim() || data.rawText?.trim();
      if (nextText) {
        setAiTranscript((prev) => mergeTranscriptSegment(prev, nextText));
      }
      setBrowserTranscript("");
      browserTranscriptRef.current = "";
      browserFinalTranscriptRef.current = "";

      if (data.matchedCommandId) {
        const matchedCommand = COMMANDS.find(
          (command) => command.id === data.matchedCommandId
        );
        if (matchedCommand) {
          handleCommandExecution(
            matchedCommand,
            data.rawText?.trim() || nextText || "",
            "AI intent",
            data.matchReason || ""
          );
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const startMediaRecorder = (stream: MediaStream) => {
    const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? { mimeType: "audio/webm;codecs=opus" }
      : undefined;

    const recorder = new MediaRecorder(stream, options);
    audioChunksRef.current = [];
    heardSpeechRef.current = false;
    speechFrameCountRef.current = 0;
    setIsHearingSpeech(false);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const chunks = audioChunksRef.current;
      const hadSpeech = heardSpeechRef.current;
      const speechFrameCount = speechFrameCountRef.current;
      const shouldRestart = isRecordingRef.current && stream.active;
      const mimeType = recorder.mimeType || "audio/webm";
      const heardTranscribedWord = hasTranscribedWord(browserTranscriptRef.current);

      audioChunksRef.current = [];
      heardSpeechRef.current = false;
      speechFrameCountRef.current = 0;
      isSegmentingRef.current = false;

      if (shouldRestart) {
        startMediaRecorder(stream);
      } else if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      if (
        useAIRef.current &&
        hadSpeech &&
        speechFrameCount >= MIN_SPEECH_FRAMES &&
        heardTranscribedWord &&
        chunks.length > 0
      ) {
        const audioBlob = new Blob(chunks, { type: mimeType });
        if (audioBlob.size >= MIN_AUDIO_BLOB_BYTES) {
          void sendChunkToCloud(audioBlob);
        }
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  const flushCurrentSegment = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording" || isSegmentingRef.current) {
      return;
    }
    isSegmentingRef.current = true;
    recorder.stop();
  };

  const setupSilenceDetection = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const checkSilence = () => {
      if (!isRecordingRef.current) return;

      analyser.getByteTimeDomainData(dataArray);
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / bufferLength);

      if (rms >= SILENCE_RMS_THRESHOLD) {
        speechFrameCountRef.current += 1;
        if (speechFrameCountRef.current >= MIN_SPEECH_FRAMES) {
          heardSpeechRef.current = true;
          setIsHearingSpeech(true);
        }
      }

      if (rms < SILENCE_RMS_THRESHOLD && heardSpeechRef.current) {
        setIsHearingSpeech(false);
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = window.setTimeout(() => {
            flushCurrentSegment();
            silenceTimerRef.current = null;
          }, SILENCE_GAP_MS);
        }
      } else if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      requestAnimationFrame(checkSilence);
    };

    audioContextRef.current = audioContext;
    checkSilence();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      isRecordingRef.current = true;
      setBrowserTranscript("");
      setAiTranscript("");
      setExecutedCommands([]);
      browserTranscriptRef.current = "";
      browserFinalTranscriptRef.current = "";

      mediaStreamRef.current = stream;
      startMediaRecorder(stream);

      if (recognitionRestartTimerRef.current) {
        clearTimeout(recognitionRestartTimerRef.current);
      }

      if (recognitionRef.current && !recognitionActiveRef.current) {
        recognitionRef.current.start();
      }

      setupSilenceDetection(stream);
    } catch (error) {
      console.error(error);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setIsHearingSpeech(false);
    setRecentMatchLabel(null);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRestartTimerRef.current) {
      clearTimeout(recognitionRestartTimerRef.current);
      recognitionRestartTimerRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      flushCurrentSegment();
    } else if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (recognitionRef.current && recognitionActiveRef.current) {
      recognitionRef.current.stop();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  type ToastTone = "neutral" | "info" | "ai" | "match";
  const toast: { id: string; label: string; tone: ToastTone } | null = (() => {
    if (!isRecording || !useAI) return null;
    if (recentMatchLabel) {
      return {
        id: `match-${recentMatchLabel}`,
        label: `Matched: ${recentMatchLabel}`,
        tone: "match",
      };
    }
    if (isTranscribing) {
      return { id: "sending", label: "Sending to AI...", tone: "ai" };
    }
    if (isHearingSpeech) {
      return { id: "listening", label: "Listening...", tone: "info" };
    }
    return { id: "waiting", label: "Waiting for speech...", tone: "neutral" };
  })();

  const toneClasses: Record<ToastTone, string> = {
    neutral:
      "border-gray-700 bg-[#1a1a1a]/95 text-gray-300",
    info: "border-cyan-400/50 bg-cyan-500/10 text-cyan-200",
    ai: "border-pink-400/55 bg-pink-500/15 text-pink-200",
    match:
      "border-emerald-400/60 bg-emerald-500/15 text-emerald-200",
  };

  const dotClasses: Record<ToastTone, string> = {
    neutral: "bg-gray-500",
    info: "bg-cyan-300",
    ai: "bg-pink-300",
    match: "bg-emerald-300",
  };

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-[#0f0f0f] text-white p-6 font-sans">
      <Link
        to="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
      >
        <FaArrowLeft /> Exit Demo
      </Link>

      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border px-5 py-3 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.45)] ${toneClasses[toast.tone]}`}
          >
            <motion.span
              className={`h-2 w-2 rounded-full ${dotClasses[toast.tone]}`}
              animate={
                toast.tone === "match"
                  ? { scale: 1, opacity: 1 }
                  : { scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }
              }
              transition={
                toast.tone === "match"
                  ? { duration: 0.2 }
                  : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              }
            />
            <span className="text-sm font-medium uppercase tracking-[0.18em]">
              {toast.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto pt-16 pb-6 flex flex-col gap-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl text-left">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-[-0.04em] leading-none text-white">
              The Voice Interface Loop
            </h1>
            <p className="text-gray-500 mt-3 text-lg">
              Continuous speech, pause detection, transcription, and command
              execution.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start">
            {!isRecording ? (
              <button
                onClick={startRecording}
                aria-label="Start recording"
                className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110"
              >
                <FaMicrophone className="text-xl" />
                <div className="absolute -inset-3 -z-10 scale-150 rounded-full bg-white/5 animate-pulse" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                aria-label="Stop recording"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-600 text-white transition-all scale-110 active:scale-95 animate-pulse"
              >
                <FaStop className="text-xl" />
              </button>
            )}

            <button
              type="button"
              aria-label={
                useAI
                  ? "Disable AI intent matching"
                  : "Enable AI intent matching"
              }
              onClick={() => {
                const nextUseAI = !useAI;
                setUseAI(nextUseAI);
                setAiTranscript("");
                setBrowserTranscript("");
                browserTranscriptRef.current = "";
                browserFinalTranscriptRef.current = "";
              }}
              className={`flex h-16 w-16 items-center justify-center rounded-full border transition-colors ${
                useAI
                  ? "border-pink-500/50 bg-pink-500/15 text-pink-400"
                  : "border-gray-700 bg-[#171717] text-gray-500 hover:text-gray-300"
              }`}
            >
              <FaRobot className="text-xl" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr_1fr] gap-5 min-h-[440px]">
          <section className="bg-[#171717] rounded-3xl border border-gray-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  What you said
                </div>
                <div className="text-xl font-semibold mt-1">
                  Continuous transcript
                </div>
              </div>
              {useAI && (
                <div className="text-xs uppercase tracking-[0.25em] px-3 py-2 rounded-full border border-pink-500/40 text-pink-400">
                  AI on
                </div>
              )}
            </div>

            <div
              ref={transcriptPanelRef}
              className="flex-1 min-h-[220px] overflow-y-auto rounded-2xl bg-black/30 p-5 text-2xl leading-relaxed text-gray-100"
            >
              {browserTranscript || "Start talking..."}
            </div>

            <div className="mt-4 rounded-2xl bg-[#101010] border border-gray-800 p-4">
              <div className="text-gray-500 uppercase tracking-[0.25em] text-[11px] mb-2">
                AI transcription
              </div>
              <div className="text-gray-300 text-base leading-relaxed min-h-[48px]">
                {useAI
                  ? aiTranscript ||
                    (isTranscribing
                      ? "Thinking about intent..."
                      : "Pause after speaking to let AI infer intent.")
                  : "Turn on AI to compare raw words with inferred intent."}
              </div>
            </div>
          </section>

          <section className="bg-[#171717] rounded-3xl border border-gray-800 p-6 flex flex-col">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Available Commands
              </div>
              <div className="text-xl font-semibold mt-1">Command phrases</div>
            </div>

            <div
              ref={commandsPanelRef}
              className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-max"
            >
              {COMMANDS.map((command) => {
                const isActiveCommand = activeCommandId === command.id;
                return (
                  <div
                    key={command.id}
                    data-command-id={command.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isActiveCommand
                        ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(52,211,153,0.2)]"
                        : "border-gray-800 bg-black/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-semibold">
                        {command.label}
                      </div>
                      {isActiveCommand && (
                        <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-300">
                          Matched
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {command.description}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {command.phrases.map((phrase) => (
                        <span
                          key={phrase}
                          className="rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-300"
                        >
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-[#171717] rounded-3xl border border-gray-800 p-6 flex flex-col">
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Commands Executed
              </div>
              <div className="text-xl font-semibold mt-1">
                What the system picked
              </div>
            </div>

            <div
              ref={executedCommandsPanelRef}
              className="min-h-0 max-h-[390px] overflow-y-auto space-y-3 pr-1"
            >
              {executedCommands.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-700 bg-black/20 p-5 text-gray-500">
                  No commands executed yet.
                </div>
              ) : (
                executedCommands.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={
                      highlightedExecutionId === entry.id
                        ? {
                            opacity: 1,
                            y: 0,
                            borderColor: [
                              "rgba(52, 211, 153, 0.85)",
                              "rgba(52, 211, 153, 0.35)",
                              "rgba(52, 211, 153, 0.85)",
                            ],
                            boxShadow: [
                              "0 0 0 0 rgba(52, 211, 153, 0.30)",
                              "0 0 0 6px rgba(52, 211, 153, 0.08)",
                              "0 0 0 0 rgba(52, 211, 153, 0.00)",
                            ],
                          }
                        : {
                            opacity: 1,
                            y: 0,
                            borderColor: "rgba(31, 41, 55, 1)",
                            boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
                          }
                    }
                    transition={
                      highlightedExecutionId === entry.id
                        ? { duration: 1.2, repeat: 1, ease: "easeInOut" }
                        : { duration: 0.2 }
                    }
                    className="rounded-2xl border bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-semibold">{entry.label}</div>
                      <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500">
                        {entry.at}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                      <span
                        className={`rounded-full px-2 py-1 ${
                          entry.source === "AI intent"
                            ? "bg-pink-500/15 text-pink-300"
                            : "bg-blue-500/15 text-blue-300"
                        }`}
                      >
                        {entry.source}
                      </span>
                    </div>
                    <div className="mt-3 text-gray-300">"{entry.phrase}"</div>
                    {entry.reason && (
                      <div className="mt-2 text-sm text-gray-500">
                        {entry.reason}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-[#171717] px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-gray-500">
            <FaWaveSquare />
            {useAI
              ? "Words -> transcript -> intent"
              : "Words -> exact command match"}
          </div>

          {useAI && (
            <div className="text-xs uppercase tracking-[0.25em] px-3 py-2 rounded-full border border-pink-500/40 text-pink-400">
              AI mode
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
