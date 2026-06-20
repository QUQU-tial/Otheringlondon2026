"use client";

import React, { useEffect, useRef, useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How do I browse programmes?",
    a: "Click any activity title in the left list. The right panel shows full details, images, and links for that programme.",
  },
  {
    q: "How can I take part or partner with you?",
    a: "Use Join us at the bottom of this column, or open the menu (☰) and choose Take part or All our partners.",
  },
  {
    q: "Why don’t I see a programme I expect?",
    a: "Only published activities appear here. If something is missing, it may not be live yet—check back later or contact the organisers.",
  },
  {
    q: "What is Login for?",
    a: "Login is for hosts and team members who manage content. Public browsing does not require an account.",
  },
  {
    q: "How do I search the list?",
    a: "Open the menu and use Search activities at the top. Pick a result to jump to that title in the list.",
  },
];

const FLOAT_BOTTOM = "clamp(20px, 1.67vw, 24px)";
const FLOAT_INLINE = "36px";

const joinLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter)",
  fontSize: "clamp(16px, 1.39vw, 20px)",
  fontWeight: 500,
  lineHeight: "clamp(24px, 2.08vw, 30px)",
  writingMode: "vertical-rl",
  textOrientation: "mixed",
};

export function PrimaryPanelChrome() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50"
      style={{
        bottom: FLOAT_BOTTOM,
        paddingLeft: FLOAT_INLINE,
        paddingRight: FLOAT_INLINE,
      }}
    >
      <div className="flex items-end justify-between">
        {/* FAQ — bottom left */}
        <div ref={rootRef} className="pointer-events-auto flex flex-col items-start gap-3">
          {open && (
            <div
              className="max-h-[min(52vh,420px)] w-[min(calc(100vw-32px),320px)] overflow-y-auto rounded-lg border border-white/15 bg-black p-4 text-left shadow-xl scrollbar-hide"
              id="primary-panel-faq-panel"
              role="dialog"
              aria-label="Common questions"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2
                  className="font-medium uppercase tracking-wide text-white"
                  style={{
                    fontFamily: "var(--font-source-sans-3)",
                    fontSize: "clamp(14px, 1.2vw, 16px)",
                  }}
                >
                  Common questions
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ul className="flex flex-col gap-4">
                {FAQ_ITEMS.map((item, i) => (
                  <li key={i}>
                    <p
                      className="mb-1 font-medium text-[#EDE6CF]"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        lineHeight: 1.35,
                      }}
                    >
                      {item.q}
                    </p>
                    <p
                      className="font-light text-[#c8c8c8]"
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontSize: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="box-border flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#5a5a5a] bg-black text-[#d4d4d4] shadow-[0_10px_28px_rgba(0,0,0,0.38)] transition-[color,box-shadow,transform,border-color] hover:scale-105 hover:border-[#707070] hover:text-white hover:shadow-[0_12px_32px_rgba(0,0,0,0.42)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8a29e]/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.97] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              lineHeight: 1,
            }}
            aria-expanded={open}
            aria-controls={open ? "primary-panel-faq-panel" : undefined}
            aria-label={open ? "Close common questions" : "Open common questions"}
          >
            ?
          </button>
        </div>

        {/* Join us — vertical label; bottom edge aligns with ? (h-9 row) */}
        <a
          href="/submit"
          className="pointer-events-auto uppercase text-white transition-opacity duration-200 hover:opacity-70"
          style={joinLabelStyle}
        >
          Join us →
        </a>
      </div>
    </div>
  );
}
