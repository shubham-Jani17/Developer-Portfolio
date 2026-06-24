import { useEffect, useState } from "react";

/**
 * Cycles through strings with a typewriter + delete effect.
 */
export function useTypewriter(words, options = {}) {
  const {
    typingMs = 85,
    deletingMs = 45,
    pauseMs = 2200,
    paused = false,
  } = options;

  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (paused) {
      setText(words?.[0] ?? "");
      return;
    }
    if (!words?.length) return;

    const current = words[wordIndex % words.length];
    const delay = isDeleting ? deletingMs : typingMs;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) {
          setTimeout(() => setIsDeleting(true), pauseMs);
        }
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setIsDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingMs, deletingMs, pauseMs, paused]);

  if (paused) return words?.[0] ?? "";
  return text;
}
