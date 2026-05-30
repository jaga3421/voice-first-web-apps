import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const GIFS: Record<string, string> = {
  penny: "/penny-specs.gif",
  "iron-man": "/iron-man.gif",
};

const DEFAULT_GIF = "penny";
const VISIBLE_MS = 2000;

export default function GifOverlay() {
  const [currentGif, setCurrentGif] = useState<string | null>(null);

  // Preload all gifs so they pop instantly when triggered.
  useEffect(() => {
    Object.values(GIFS).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    let hideTimer: number | null = null;

    const show = (event: Event) => {
      const ce = event as CustomEvent<{ gif?: string }>;
      const requested = ce.detail?.gif ?? DEFAULT_GIF;
      const src = GIFS[requested] ?? GIFS[DEFAULT_GIF];
      setCurrentGif(src);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        setCurrentGif(null);
      }, VISIBLE_MS);
    };

    const dismiss = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCurrentGif(null);
    };

    window.addEventListener("voice-interface:gif-overlay", show);
    window.addEventListener("keydown", dismiss);

    return () => {
      window.removeEventListener("voice-interface:gif-overlay", show);
      window.removeEventListener("keydown", dismiss);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {currentGif && (
        <motion.div
          key={currentGif}
          className="fixed inset-0 z-[9996] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setCurrentGif(null)}
        >
          <motion.img
            src={currentGif}
            alt=""
            className="rounded-2xl shadow-2xl"
            style={{ width: "80%", height: "auto" }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
