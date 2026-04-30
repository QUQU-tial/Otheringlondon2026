"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

const linkClass =
  "text-[#1C1C1C] transition-opacity hover:opacity-65 focus:outline-none focus-visible:underline";

const linkStyle: CSSProperties = {
  fontFamily: "var(--font-inter)",
  fontSize: "clamp(15px, 1.15vw, 18px)",
  fontWeight: 500,
  letterSpacing: "-0.01em",
};

/**
 * White panel top strip: map · login.
 */
export function AboutUsWhiteTopBar() {
  return (
    <header
      className="flex min-h-[3.25rem] shrink-0 items-center justify-between border-b border-[#1C1C1C]/10 bg-white px-6 py-[clamp(14px,1.4vw,20px)] min-[860px]:px-10"
      aria-label="Site links"
    >
      <Link href="/partners" className={linkClass} style={linkStyle}>
        View All Programmes
      </Link>
      <Link href="/login" className={linkClass} style={linkStyle}>
        Login
      </Link>
    </header>
  );
}
