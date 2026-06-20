"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getActivities, type Activity } from "../lib/storage";

const AUTO_MS = 5500;

/** First slide on About us — editorial GIF (always index 0). */
const ABOUT_FIRST_GIF =
  "https://kyttwueejybalvhojfvf.supabase.co/storage/v1/object/sign/Yinzhe%20Qu/Stretched-Type-Repeater.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wOWVjZjI0OC04NGI3LTRmZTAtODkyNy1lOTQ3Zjg4ZmE0MjAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJZaW56aGUgUXUvU3RyZXRjaGVkLVR5cGUtUmVwZWF0ZXIuZ2lmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTg4MzMxNSwiZXhwIjoxODEzNDE5MzE1fQ.zAzLaU898WSBknGmEr8suc3LyPPkfpfTFltFeMh5CaU";

const ABOUT_FIRST_SLIDE = {
  src: ABOUT_FIRST_GIF,
  alt: "Stretched type repeater — GATHERING LONDON",
} as const;

function hasDisplayableImage(a: Activity): a is Activity & { primary_image: string } {
  const u = a.primary_image;
  return typeof u === "string" && (u.startsWith("http") || u.startsWith("data:image"));
}

type AboutPhotoWallProps = {
  className?: string;
};

/**
 * Single 16:9 frame: uses the same activity primary images as the home detail panel.
 * One image at a time; right/left arrows; auto-advance (pauses on hover).
 */
export function AboutPhotoWall({ className = "" }: AboutPhotoWallProps) {
  const [slides, setSlides] = useState<{ src: string; alt: string }[]>([ABOUT_FIRST_SLIDE]);
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getActivities().then((list) => {
      if (cancelled) return;
      const out: { src: string; alt: string }[] = [];
      const seen = new Set<string>();
      for (const a of list) {
        if (!hasDisplayableImage(a)) continue;
        const src = a.primary_image;
        if (seen.has(src) || src === ABOUT_FIRST_GIF) continue;
        seen.add(src);
        out.push({ src, alt: a.activity_title || "Programme image" });
      }
      setSlides([ABOUT_FIRST_SLIDE, ...out]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const len = slides.length;
  const safeIndex = len ? index % len : 0;

  const goNext = useCallback(() => {
    if (len <= 1) return;
    setIndex((i) => (i + 1) % len);
  }, [len]);

  const goPrev = useCallback(() => {
    if (len <= 1) return;
    setIndex((i) => (i - 1 + len) % len);
  }, [len]);

  useEffect(() => {
    if (len <= 1 || pause) return;
    const t = window.setInterval(goNext, AUTO_MS);
    return () => window.clearInterval(t);
  }, [len, pause, goNext, safeIndex]);

  useEffect(() => {
    setIndex((i) => (len ? Math.min(i, len - 1) : 0));
  }, [len]);

  const current = slides[safeIndex];

  const shell = useMemo(
    () => (
      <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-[#e5e5e5] shadow-sm ring-1 ring-black/5">
        {current ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={current.src}
            alt={current.alt}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#d4d4d4]">
            <span className="text-[14px] text-[#525252]" style={{ fontFamily: "var(--font-inter)" }}>
              {len === 0 ? "No programme images yet" : "Image not available"}
            </span>
          </div>
        )}
      </div>
    ),
    [current, len],
  );

  return (
    <div
      className={`w-full ${className}`.trim()}
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Programme images from the festival"
    >
      <div className="relative w-full">
        {shell}

        {len > 1 && (
          <>
            <button
              type="button"
              onClick={() => {
                goPrev();
                setPause(true);
              }}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-[2px] transition-colors hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Previous image"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => {
                goNext();
                setPause(true);
              }}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-[2px] transition-colors hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Next image"
            >
              <Chevron dir="right" />
            </button>
          </>
        )}
      </div>

      {len > 1 && (
        <p
          className="mt-3 text-center text-[12px] tracking-[0.04em] text-[#737373]"
          style={{ fontFamily: "var(--font-inter)" }}
          aria-live="polite"
        >
          {safeIndex + 1} / {len}
        </p>
      )}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={dir === "left" ? "rotate-180" : ""}
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
