"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TypingAreaProps {
  passage: string;
  onComplete: (wpm: number, accuracy: number, timeElapsed: number) => void;
}

export default function TypingArea({ passage, onComplete }: TypingAreaProps) {
  const words = passage.split(" ");

  const [wordIndex, setWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [completed, setCompleted] = useState(false);

  const totalKeystrokesRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  const expected = words[wordIndex] ?? "";
  // Input is wrong when it doesn't match the prefix of the expected word
  const isInputError = input.length > 0 && !expected.startsWith(input);

  // Chars completed so far (for WPM)
  const charsCompleted = words.slice(0, wordIndex).reduce(
    (sum, w) => sum + w.length + 1, // +1 for the space
    0
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!started || completed) return;
    timerRef.current = setInterval(() => {
      if (startTime) {
        const secs = (Date.now() - startTime) / 1000;
        setElapsed(Math.floor(secs));
        setWpm(Math.round(charsCompleted / 5 / (secs / 60)));
      }
    }, 200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, completed, startTime, charsCompleted]);

  // Scroll active word into view
  useEffect(() => {
    activeWordRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [wordIndex]);

  function finish(_finalInput: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    setCompleted(true);
    const secs = (Date.now() - (startTime ?? Date.now())) / 1000;
    const finalElapsed = Math.round(secs);
    const totalChars = passage.length;
    const finalWpm = Math.round(totalChars / 5 / (secs / 60));
    const accuracy = Math.min(
      Math.round((totalChars / totalKeystrokesRef.current) * 100 * 100) / 100,
      100
    );
    onComplete(finalWpm, accuracy, finalElapsed);
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (completed) return;

      if (e.key === " ") {
        e.preventDefault();
        // Only advance if the current word is typed correctly
        if (input === expected) {
          const nextIndex = wordIndex + 1;
          totalKeystrokesRef.current += 1; // count the space
          if (nextIndex === words.length) {
            finish(input);
          } else {
            setWordIndex(nextIndex);
            setInput("");
          }
        }
        // If wrong, block the space silently — the red input tells the story
      }
    },
    [input, expected, wordIndex, words.length, completed]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (completed) return;
      const val = e.target.value;

      if (!started && val.length > 0) {
        setStarted(true);
        setStartTime(Date.now());
      }

      // Track non-backspace keystrokes for accuracy
      if (val.length > input.length) {
        totalKeystrokesRef.current += val.length - input.length;
      }

      setInput(val);

      // Auto-complete last word when typed exactly
      if (wordIndex === words.length - 1 && val === expected) {
        totalKeystrokesRef.current += 0; // already counted in the change
        finish(val);
      }
    },
    [input, started, wordIndex, words.length, expected, completed]
  );

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">wpm</span>
          <span className="text-[var(--accent)] font-bold text-lg tabular-nums w-12">
            {started ? wpm : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">time</span>
          <span className="text-[var(--foreground)] tabular-nums w-12">
            {started ? `${elapsed}s` : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">progress</span>
          <span className="text-[var(--foreground)] tabular-nums">
            {Math.round((wordIndex / words.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--surface-2)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-100"
          style={{ width: `${(wordIndex / words.length) * 100}%` }}
        />
      </div>

      {/* Passage display */}
      <div className="font-mono text-xl leading-relaxed tracking-wide max-h-48 overflow-hidden select-none">
        {words.map((word, wi) => {
          const isCompleted = wi < wordIndex;
          const isCurrent = wi === wordIndex;

          return (
            <span key={wi}>
              {isCompleted ? (
                <span className="text-[var(--foreground)]">{word}</span>
              ) : isCurrent ? (
                <span ref={activeWordRef} className="relative">
                  {word.split("").map((char, ci) => {
                    const typed = input[ci];
                    const isCursorPos = ci === input.length;

                    return (
                      <span key={ci} className="relative">
                        {isCursorPos && (
                          <span className="absolute -left-px top-0 bottom-0 w-0.5 bg-[var(--accent)] cursor-blink" />
                        )}
                        <span
                          className={
                            typed === undefined
                              ? "text-[var(--muted)]"
                              : typed === char
                              ? "text-[var(--foreground)]"
                              : "text-[var(--error)] bg-[var(--error)]/10 rounded-sm"
                          }
                        >
                          {char}
                        </span>
                      </span>
                    );
                  })}
                  {/* Cursor after last char when word is fully typed */}
                  {input.length >= word.length && (
                    <span className="relative">
                      <span className="absolute -left-px top-0 bottom-0 w-0.5 bg-[var(--accent)] cursor-blink" />
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[var(--muted)]">{word}</span>
              )}
              {wi < words.length - 1 && (
                <span className={isCompleted ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
                  {" "}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Input box */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={completed}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={started ? "" : "start typing..."}
        className={`
          w-full font-mono text-lg px-4 py-3 rounded-xl border outline-none
          bg-[var(--surface)] placeholder-[var(--muted)]
          transition-colors duration-100
          ${isInputError
            ? "border-[var(--error)]/50 text-[var(--error)]"
            : "border-[var(--border)] text-[var(--foreground)] focus:border-[var(--accent)]/60"
          }
          ${completed ? "opacity-50 cursor-default" : ""}
        `}
      />
    </div>
  );
}
