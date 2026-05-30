import { useEffect, useState } from "react";

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

const trimForDisplay = (text: string) => {
  const cleaned = normalize(text);
  if (!cleaned) return "";

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= 2) {
    return sentences.slice(-2).join(" ");
  }

  const words = cleaned.split(" ");
  if (words.length > 24) {
    return words.slice(-24).join(" ");
  }
  return cleaned;
};

export default function VoiceSubtitleBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    const handleVisibility = (event: Event) => {
      const ce = event as CustomEvent<{ visible?: boolean }>;
      const visible = Boolean(ce.detail?.visible);
      setIsVisible(visible);
      if (!visible) setText("");
    };

    const handleFragment = (event: Event) => {
      const ce = event as CustomEvent<{ text?: string }>;
      setText(ce.detail?.text || "");
    };

    const handleClear = () => setText("");

    window.addEventListener(
      "voice-interface:subtitle-visibility",
      handleVisibility
    );
    window.addEventListener("voice-interface:subtitle-fragment", handleFragment);
    window.addEventListener("voice-interface:subtitle-clear", handleClear);

    return () => {
      window.removeEventListener(
        "voice-interface:subtitle-visibility",
        handleVisibility
      );
      window.removeEventListener(
        "voice-interface:subtitle-fragment",
        handleFragment
      );
      window.removeEventListener("voice-interface:subtitle-clear", handleClear);
    };
  }, []);

  if (!isVisible) return null;

  const display = trimForDisplay(text);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[9997] flex justify-center px-8 pb-6">
      <div className="max-w-5xl rounded-2xl bg-black/75 px-[34px] py-[26px] text-center text-[35px] font-medium leading-tight text-white shadow-2xl backdrop-blur-md">
        <div
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "1.2em",
          }}
        >
          {display || "Listening..."}
        </div>
      </div>
    </div>
  );
}
