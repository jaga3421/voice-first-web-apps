import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const GIF_SRC = "/penny-specs.gif";
const VISIBLE_MS = 6000;

export default function GifOverlay() {
  const [visible, setVisible] = useState(false);

  // Preload the gif so it pops instantly when triggered.
  useEffect(() => {
    const img = new Image();
    img.src = GIF_SRC;
  }, []);

  useEffect(() => {
    let hideTimer: number | null = null;

    const show = () => {
      setVisible(true);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        setVisible(false);
      }, VISIBLE_MS);
    };

    const dismiss = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
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
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9996] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setVisible(false)}
        >
          <motion.img
            src={GIF_SRC}
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
